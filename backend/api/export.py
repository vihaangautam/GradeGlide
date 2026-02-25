from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import csv
import io
import json

from database import get_db
from models.session import GradingSession

router = APIRouter(prefix="/sessions", tags=["export"])


@router.get("/{session_id}/export")
def export_session(session_id: str, format: str = "json", db: Session = Depends(get_db)):
    """
    Export a completed grading session.
    ?format=json  → full JSON
    ?format=csv   → spreadsheet-friendly CSV
    """
    session = db.get(GradingSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if format == "csv":
        return _export_csv(session)
    return _export_json(session)


def _export_json(session: GradingSession):
    rows = []
    for q in sorted(session.questions, key=lambda x: x.q_number):
        result = q.result
        rows.append({
            "question": q.q_number,
            "questionText": q.question_text,
            "type": q.question_type,
            "maxMarks": q.max_marks,
            "obtainedMarks": result.obtained_marks if result else None,
            "confidence": result.confidence if result else "low",
            "aiRemark": result.ai_remark if result else "",
        })

    payload = json.dumps({
        "student": session.student_name,
        "subject": session.subject,
        "totalMarks": session.total_marks,
        "obtainedMarks": session.obtained_marks,
        "questions": rows,
    }, indent=2)

    return StreamingResponse(
        io.BytesIO(payload.encode()),
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="session_{session.id[:8]}.json"'},
    )


def _export_csv(session: GradingSession):
    buf = io.StringIO()
    writer = csv.writer(buf)

    writer.writerow(["GradeGlide Export"])
    writer.writerow(["Student", session.student_name])
    writer.writerow(["Subject", session.subject, "Total", session.total_marks, "Obtained", session.obtained_marks])
    writer.writerow([])
    writer.writerow(["Q#", "Question", "Type", "Max Marks", "Obtained Marks", "Confidence", "AI Remark"])

    for q in sorted(session.questions, key=lambda x: x.q_number):
        result = q.result
        writer.writerow([
            q.q_number,
            q.question_text,
            q.question_type,
            q.max_marks,
            result.obtained_marks if result else "",
            result.confidence if result else "low",
            result.ai_remark if result else "",
        ])

    csv_bytes = buf.getvalue().encode("utf-8-sig")  # UTF-8 BOM for Excel compatibility
    return StreamingResponse(
        io.BytesIO(csv_bytes),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="session_{session.id[:8]}.csv"'},
    )
