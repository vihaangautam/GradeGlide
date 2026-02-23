import uuid
from sqlalchemy import String, Float, Text, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


class GradingResult(Base):
    __tablename__ = "grading_results"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    question_id: Mapped[str] = mapped_column(String, ForeignKey("questions.id"), nullable=False, unique=True)
    obtained_marks: Mapped[float] = mapped_column(Float, nullable=True)
    # high | medium | low
    confidence: Mapped[str] = mapped_column(String(10), default="low")
    ai_remark: Mapped[str] = mapped_column(Text, nullable=True)
    # Raw OCR text of the student's answer
    transcript: Mapped[str] = mapped_column(Text, nullable=True)
    is_finalised: Mapped[bool] = mapped_column(Boolean, default=False)

    question: Mapped["Question"] = relationship(back_populates="result")
