from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from database import get_db
from models.session import GradingSession
from models.question import Question, QuestionStep
from models.result import GradingResult

router = APIRouter(prefix="/sessions", tags=["grading"])


# ── Pydantic schemas ─────────────────────────────────────────────────────────

class MarkUpdate(BaseModel):
    question_id: str
    step_id: Optional[str] = None   # None → update question-level mark
    obtained_marks: Optional[float] = None


# ── Helpers ──────────────────────────────────────────────────────────────────

def _session_to_dict(session: GradingSession) -> dict:
    """Shape the DB session into the format GradingReview.jsx expects."""
    questions = []
    for q in sorted(session.questions, key=lambda x: x.q_number):
        result = q.result

        steps = []
        for s in q.steps:
            steps.append({
                "id": s.step_key,
                "label": s.label,
                "maxMarks": s.max_marks,
                "obtainedMarks": s.obtained_marks,
                "aiStatus": s.ai_status,
                "aiNote": s.ai_note,
            })

        q_dict = {
            "id": q.q_number,
            "question": q.question_text,
            "questionType": q.question_type,
            "maxMarks": q.max_marks,
            "obtainedMarks": result.obtained_marks if result else None,
            "aiRemark": result.ai_remark if result else "",
            "status": _derive_status(result),
            "confidence": result.confidence if result else "low",
            "bbox": q.bbox or {"x": 0, "y": q.q_number * 25, "w": 100, "h": 25},
            "transcript": result.transcript if result else "",
            "steps": steps if steps else None,
        }
        questions.append(q_dict)

    return {
        "studentName": session.student_name,
        "rollNo": session.roll_no,
        "subject": session.subject,
        "totalMarks": session.total_marks,
        "obtainedMarks": session.obtained_marks,
        "status": session.status,
        "questions": questions,
        # Serve the first uploaded image as the answer sheet photo
        "answerSheetUrl": (
            f"/uploads/{session.id}/page_1.png"
            if session.images else None
        ),
    }


def _derive_status(result) -> str:
    if not result or result.obtained_marks is None:
        return "partial"
    if result.obtained_marks == 0:
        return "incorrect"
    # Compare via the parent question max_marks
    return "correct" if result.obtained_marks >= (result.question.max_marks if result.question else 1) else "partial"


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("")
def list_sessions(db: Session = Depends(get_db)):
    """List all grading sessions (for GradingWorkspace batch list)."""
    sessions = db.query(GradingSession).order_by(GradingSession.created_at.desc()).all()
    return [
        {
            "id": s.id,
            "studentName": s.student_name,
            "subject": s.subject,
            "examTitle": s.exam_title,
            "totalMarks": s.total_marks,
            "obtainedMarks": s.obtained_marks,
            "status": s.status,
            "createdAt": s.created_at.isoformat(),
        }
        for s in sessions
    ]


@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Aggregate metrics and recent activity for the Dashboard page."""
    all_sessions = db.query(GradingSession).all()

    total = len(all_sessions)
    completed = sum(1 for s in all_sessions if s.status == "completed")
    processing = sum(1 for s in all_sessions if s.status in ("processing", "pending"))

    # Distinct subjects seen (proxy for "answer keys used")
    subjects = list({s.subject for s in all_sessions if s.subject})

    # 5 most recent sessions for the activity feed
    recent = sorted(all_sessions, key=lambda s: s.created_at, reverse=True)[:5]

    return {
        "totalPapersGraded": total,
        "completed": completed,
        "processing": processing,
        "uniqueSubjects": len(subjects),
        "recentSessions": [
            {
                "id": s.id,
                "studentName": s.student_name,
                "subject": s.subject,
                "examTitle": s.exam_title,
                "totalMarks": s.total_marks,
                "obtainedMarks": s.obtained_marks,
                "status": s.status,
                "createdAt": s.created_at.isoformat(),
            }
            for s in recent
        ],
    }


@router.get("/{session_id}")
def get_session(session_id: str, db: Session = Depends(get_db)):
    """Full session data — matches MOCK_EXAM_DATA shape in GradingReview."""
    session = db.get(GradingSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return _session_to_dict(session)


@router.patch("/{session_id}/marks")
def update_marks(session_id: str, update: MarkUpdate, db: Session = Depends(get_db)):
    """Save teacher's mark adjustment. Accepts step-level or question-level updates."""
    session = db.get(GradingSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if update.step_id:
        # Update individual step mark
        step = db.query(QuestionStep).filter_by(
            question_id=update.question_id,
            step_key=update.step_id,
        ).first()
        if not step:
            raise HTTPException(status_code=404, detail="Step not found")
        step.obtained_marks = update.obtained_marks
        step.ai_status = "correct" if (update.obtained_marks or 0) >= step.max_marks else "incorrect"

        # Recalculate question total from steps
        question = db.get(Question, update.question_id)
        if question and question.result:
            question.result.obtained_marks = sum(
                (s.obtained_marks or 0) for s in question.steps
            )
    else:
        # Update question-level mark directly (SHORT_ANSWER)
        result = db.query(GradingResult).filter_by(question_id=update.question_id).first()
        if result:
            result.obtained_marks = update.obtained_marks

    # Recalculate session total
    session.obtained_marks = sum(
        (q.result.obtained_marks or 0) for q in session.questions if q.result
    )
    db.commit()
    return {"ok": True, "sessionTotal": session.obtained_marks}


@router.post("/{session_id}/finalise")
def finalise_session(session_id: str, db: Session = Depends(get_db)):
    """Mark all questions as finalised and session as completed."""
    session = db.get(GradingSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    for q in session.questions:
        if q.result:
            q.result.is_finalised = True
    session.status = "completed"
    db.commit()
    return {"ok": True, "status": "completed"}
