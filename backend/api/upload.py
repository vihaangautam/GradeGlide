from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks, Depends
from sqlalchemy.orm import Session
import shutil
import uuid
import json
from pathlib import Path

from database import get_db
from models.session import GradingSession, AnswerSheetImage
from models.question import Question, QuestionStep
from models.result import GradingResult
from services.pdf_processor import file_to_images, save_page_images
from services.ocr_service import detect_question_regions
from services.ai_grader import grade_answer

router = APIRouter(prefix="/upload", tags=["upload"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Default marking schemes for each question type
DEFAULT_SCHEMES = {
    1: {
        "type": "SHORT_ANSWER",
        "text": "Define Ohm's Law.",
        "max_marks": 2,
        "steps": [],
    },
    2: {
        "type": "LONG_ANSWER",
        "text": "Explain the working of a transformer.",
        "max_marks": 5,
        "steps": [
            {"step_key": "a", "label": "Principle of mutual induction stated", "max_marks": 1},
            {"step_key": "b", "label": "Working explanation (step-up / step-down)", "max_marks": 1},
            {"step_key": "c", "label": "Labelled diagram of transformer", "max_marks": 2},
            {"step_key": "d", "label": "Formula: Vs/Vp = Ns/Np", "max_marks": 1},
        ],
    },
    3: {
        "type": "NUMERICAL",
        "text": "Calculate the equivalent resistance (R1=4Ω, R2=6Ω in parallel).",
        "max_marks": 3,
        "steps": [
            {"step_key": "a", "label": "Correct formula: 1/R = 1/R1 + 1/R2", "max_marks": 1},
            {"step_key": "b", "label": "Correct substitution of values", "max_marks": 1},
            {"step_key": "c", "label": "Final answer with correct unit (Ω)", "max_marks": 1},
        ],
    },
}


@router.post("/session")
async def create_grading_session(
    background_tasks: BackgroundTasks,
    answer_sheet: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Upload an answer sheet (PDF or image).
    Returns a session_id immediately; processing happens in the background.
    """
    session_id = str(uuid.uuid4())

    # Save the uploaded file
    ext = Path(answer_sheet.filename or "sheet.png").suffix or ".png"
    raw_path = UPLOAD_DIR / f"{session_id}_original{ext}"
    with raw_path.open("wb") as f:
        shutil.copyfileobj(answer_sheet.file, f)

    # Create DB session record
    session = GradingSession(
        id=session_id,
        student_name="Unknown Student",
        roll_no="—",
        subject="Physics",
        exam_title="Uploaded Exam",
        total_marks=sum(q["max_marks"] for q in DEFAULT_SCHEMES.values()),
        status="processing",
    )
    db.add(session)
    db.commit()

    # Save image record
    img_record = AnswerSheetImage(
        session_id=session_id,
        file_path=str(raw_path),
        original_filename=answer_sheet.filename,
        page_number=1,
    )
    db.add(img_record)
    db.commit()

    # Queue background processing
    background_tasks.add_task(_process_session, session_id, str(raw_path))
    return {"session_id": session_id, "status": "processing"}


def _process_session(session_id: str, file_path: str):
    """
    Background task: OCR + AI grading pipeline.
    Runs after the upload endpoint returns.
    """
    from database import SessionLocal
    db = SessionLocal()

    try:
        # 1. Convert to PIL images
        images = file_to_images(file_path)

        # Save page images for the viewer
        session_img_dir = str(UPLOAD_DIR / session_id)
        page_paths = save_page_images(images, session_id, str(UPLOAD_DIR))

        # Update image records with page paths
        for i, path in enumerate(page_paths):
            img = AnswerSheetImage(
                session_id=session_id,
                file_path=path,
                original_filename=f"page_{i + 1}.png",
                page_number=i + 1,
            )
            db.add(img)

        # 2. Detect question regions from first page
        regions = detect_question_regions(images[0])

        # Map regions to question numbers
        region_map = {r["q_num"]: r for r in regions}

        total_marks = 0.0

        # 3. Create Question + Step + Result records
        for q_num, scheme in DEFAULT_SCHEMES.items():
            region = region_map.get(q_num, {})
            student_text = region.get("raw_text", "")
            bbox_pct = region.get("bbox_pct", {"x": 0, "y": q_num * 25, "w": 100, "h": 25})

            # Create Question
            question = Question(
                session_id=session_id,
                q_number=q_num,
                question_text=scheme["text"],
                max_marks=scheme["max_marks"],
                question_type=scheme["type"],
                bbox_json=json.dumps(bbox_pct),
            )
            db.add(question)
            db.flush()  # get question.id

            # Create Steps
            for i, step_def in enumerate(scheme.get("steps", [])):
                step = QuestionStep(
                    question_id=question.id,
                    step_key=step_def["step_key"],
                    label=step_def["label"],
                    max_marks=step_def["max_marks"],
                    order_index=i,
                )
                db.add(step)

            db.flush()

            # 4. AI grade this question
            grading = grade_answer(
                question_text=scheme["text"],
                question_type=scheme["type"],
                max_marks=scheme["max_marks"],
                marking_scheme=scheme.get("steps", []),
                student_text=student_text,
                cropped_image=region.get("cropped_image"),
            )

            # Update step results from AI
            for step_result in grading.get("steps", []):
                for step in question.steps:
                    if step.step_key == step_result.get("step_key"):
                        step.obtained_marks = step_result.get("obtained_marks")
                        step.ai_status = step_result.get("ai_status", "low_confidence")
                        step.ai_note = step_result.get("ai_note")

            # Create GradingResult
            obtained = grading.get("obtained_marks")
            result = GradingResult(
                question_id=question.id,
                obtained_marks=obtained,
                confidence=grading.get("confidence", "low"),
                ai_remark=grading.get("ai_remark", ""),
                transcript=student_text,
            )
            db.add(result)

            if obtained is not None:
                total_marks += obtained

        # 5. Update session totals + status
        session = db.get(GradingSession, session_id)
        session.obtained_marks = total_marks
        session.status = "ready"
        db.commit()

    except Exception as e:
        db.rollback()
        session = db.get(GradingSession, session_id)
        if session:
            session.status = "error"
            db.commit()
        print(f"[upload] Error processing session {session_id}: {e}")
    finally:
        db.close()
