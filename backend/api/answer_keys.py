"""
answer_keys.py — CRUD + extraction endpoints for Answer Key objects.

Routes:
  GET    /answer-keys            list all
  POST   /answer-keys/extract    extract scheme from uploaded PDF/DOCX
  POST   /answer-keys            create (save)
  GET    /answer-keys/{id}       detail
  DELETE /answer-keys/{id}       delete
"""
import shutil
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from database import get_db
from models.answer_key import AnswerKey
from services.answer_key_extractor import extract_answer_key

router = APIRouter(prefix="/answer-keys", tags=["answer-keys"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


# ── Pydantic schemas ──────────────────────────────────────────────────────────

class AnswerKeyCreate(BaseModel):
    title: str
    subject: str
    exam_title: Optional[str] = None
    questions: list  # validated loosely — frontend controls the shape


# ── Helper ────────────────────────────────────────────────────────────────────

def _key_summary(key: AnswerKey) -> dict:
    return {
        "id": key.id,
        "title": key.title,
        "subject": key.subject,
        "examTitle": key.exam_title,
        "questionCount": key.question_count,
        "totalMarks": key.total_marks,
        "createdAt": key.created_at.isoformat(),
    }


def _key_detail(key: AnswerKey) -> dict:
    return {
        **_key_summary(key),
        "questions": key.questions,
    }


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("")
def list_answer_keys(db: Session = Depends(get_db)):
    """List all saved answer keys (summary — no questions list)."""
    keys = db.query(AnswerKey).order_by(AnswerKey.created_at.desc()).all()
    return [_key_summary(k) for k in keys]


@router.post("/extract")
async def extract_from_file(
    file: UploadFile = File(...),
):
    """
    Upload a PDF or DOCX marking scheme.
    Returns extracted question list for the user to review/edit before saving.
    Does NOT persist anything to the database.
    """
    ext = Path(file.filename or "upload.pdf").suffix.lower()
    if ext not in (".pdf", ".docx", ".doc", ".jpg", ".jpeg", ".png"):
        raise HTTPException(
            status_code=422,
            detail="Unsupported file type. Please upload a PDF, DOCX, or image.",
        )

    # Save temp file
    tmp_path = UPLOAD_DIR / f"tmp_ak_{uuid.uuid4()}{ext}"
    try:
        with tmp_path.open("wb") as f:
            shutil.copyfileobj(file.file, f)

        result = extract_answer_key(str(tmp_path))
    finally:
        tmp_path.unlink(missing_ok=True)

    return {
        "questions": result["questions"],
        "rawText": result["raw_text"][:2000] if result["raw_text"] else "",
        "error": result["error"],
    }


@router.post("", status_code=201)
def create_answer_key(body: AnswerKeyCreate, db: Session = Depends(get_db)):
    """Persist a confirmed (and optionally edited) answer key."""
    key = AnswerKey(
        title=body.title,
        subject=body.subject,
        exam_title=body.exam_title,
    )
    key.questions = body.questions  # uses the setter → serialises to JSON
    db.add(key)
    db.commit()
    db.refresh(key)
    return _key_detail(key)


@router.get("/{key_id}")
def get_answer_key(key_id: str, db: Session = Depends(get_db)):
    """Full detail including questions list."""
    key = db.get(AnswerKey, key_id)
    if not key:
        raise HTTPException(status_code=404, detail="Answer key not found")
    return _key_detail(key)


@router.delete("/{key_id}", status_code=204)
def delete_answer_key(key_id: str, db: Session = Depends(get_db)):
    """Delete an answer key. Sessions that used it are not affected."""
    key = db.get(AnswerKey, key_id)
    if not key:
        raise HTTPException(status_code=404, detail="Answer key not found")
    db.delete(key)
    db.commit()
