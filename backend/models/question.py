import uuid
import json
from sqlalchemy import String, Integer, Float, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id: Mapped[str] = mapped_column(String, ForeignKey("grading_sessions.id"), nullable=False)
    q_number: Mapped[int] = mapped_column(Integer, nullable=False)
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    max_marks: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    # SHORT_ANSWER | LONG_ANSWER | NUMERICAL
    question_type: Mapped[str] = mapped_column(String(20), default="SHORT_ANSWER")
    # JSON string: {"x": 5, "y": 10, "w": 90, "h": 20}
    bbox_json: Mapped[str] = mapped_column(Text, nullable=True)

    session: Mapped["GradingSession"] = relationship(back_populates="questions")
    steps: Mapped[list["QuestionStep"]] = relationship(back_populates="question", cascade="all, delete-orphan", order_by="QuestionStep.order_index")
    result: Mapped["GradingResult"] = relationship(back_populates="question", uselist=False, cascade="all, delete-orphan")

    @property
    def bbox(self):
        return json.loads(self.bbox_json) if self.bbox_json else None


class QuestionStep(Base):
    __tablename__ = "question_steps"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    question_id: Mapped[str] = mapped_column(String, ForeignKey("questions.id"), nullable=False)
    step_key: Mapped[str] = mapped_column(String(10), nullable=False)  # "a", "b", "c"
    label: Mapped[str] = mapped_column(Text, nullable=False)
    max_marks: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    obtained_marks: Mapped[float] = mapped_column(Float, nullable=True)
    # correct | incorrect | low_confidence
    ai_status: Mapped[str] = mapped_column(String(20), default="low_confidence")
    ai_note: Mapped[str] = mapped_column(Text, nullable=True)
    order_index: Mapped[int] = mapped_column(Integer, default=0)

    question: Mapped["Question"] = relationship(back_populates="steps")
