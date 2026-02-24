"""
answer_key.py — Stores teacher-defined marking schemes (answer keys).
Questions and steps are stored as a JSON blob for simplicity.
"""
import uuid
import json
from datetime import datetime
from sqlalchemy import String, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column
from database import Base


class AnswerKey(Base):
    __tablename__ = "answer_keys"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    subject: Mapped[str] = mapped_column(String(100), nullable=False)
    exam_title: Mapped[str] = mapped_column(String(300), nullable=True)
    # JSON list of question dicts:
    # [{ "q_number": 1, "type": "SHORT_ANSWER", "text": "...", "max_marks": 2, "steps": [] }, ...]
    questions_json: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    @property
    def questions(self) -> list:
        return json.loads(self.questions_json)

    @questions.setter
    def questions(self, value: list):
        self.questions_json = json.dumps(value)

    @property
    def question_count(self) -> int:
        return len(self.questions)

    @property
    def total_marks(self) -> int:
        return sum(q.get("max_marks", 0) for q in self.questions)
