import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


class GradingSession(Base):
    __tablename__ = "grading_sessions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    student_name: Mapped[str] = mapped_column(String(200), nullable=False)
    roll_no: Mapped[str] = mapped_column(String(50), nullable=True)
    subject: Mapped[str] = mapped_column(String(100), nullable=False)
    exam_title: Mapped[str] = mapped_column(String(200), nullable=True)
    total_marks: Mapped[int] = mapped_column(default=0)
    obtained_marks: Mapped[float] = mapped_column(default=0.0)
    # pending | processing | ready | completed
    status: Mapped[str] = mapped_column(String(20), default="pending")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    images: Mapped[list["AnswerSheetImage"]] = relationship(back_populates="session", cascade="all, delete-orphan")
    questions: Mapped[list["Question"]] = relationship(back_populates="session", cascade="all, delete-orphan")


class AnswerSheetImage(Base):
    __tablename__ = "answer_sheet_images"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id: Mapped[str] = mapped_column(String, nullable=False)
    file_path: Mapped[str] = mapped_column(Text, nullable=False)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=True)
    page_number: Mapped[int] = mapped_column(default=1)

    session: Mapped["GradingSession"] = relationship(back_populates="images")
