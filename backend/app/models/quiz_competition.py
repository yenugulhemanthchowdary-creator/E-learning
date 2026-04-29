from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class QuizCompetition(Base):
    __tablename__ = "quiz_competitions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(120), nullable=False)
    topic: Mapped[str] = mapped_column(String(80), nullable=False)
    difficulty: Mapped[str] = mapped_column(String(20), nullable=False)
    question_count: Mapped[int] = mapped_column(Integer, default=10)
    seconds_per_question: Mapped[int] = mapped_column(Integer, default=20)
    max_participants: Mapped[int] = mapped_column(Integer, default=50)
    is_public: Mapped[bool] = mapped_column(Boolean, default=True)
    status: Mapped[str] = mapped_column(String(20), default="open")
    join_code: Mapped[str] = mapped_column(String(12), unique=True, nullable=False, index=True)
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class QuizCompetitionParticipant(Base):
    __tablename__ = "quiz_competition_participants"
    __table_args__ = (UniqueConstraint("competition_id", "user_id", name="uq_competition_user"),)

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    competition_id: Mapped[int] = mapped_column(ForeignKey("quiz_competitions.id"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    score: Mapped[int] = mapped_column(Integer, default=0)
    answered_questions: Mapped[int] = mapped_column(Integer, default=0)
    is_host: Mapped[bool] = mapped_column(Boolean, default=False)
    joined_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class QuizCompetitionQuestion(Base):
    __tablename__ = "quiz_competition_questions"
    __table_args__ = (UniqueConstraint("competition_id", "question_index", name="uq_competition_question_index"),)

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    competition_id: Mapped[int] = mapped_column(ForeignKey("quiz_competitions.id"), index=True)
    question_index: Mapped[int] = mapped_column(Integer, nullable=False)
    prompt: Mapped[str] = mapped_column(String(500), nullable=False)
    options_json: Mapped[str] = mapped_column(String(1200), nullable=False)
    answer: Mapped[str] = mapped_column(String(255), nullable=False)
    hint: Mapped[str] = mapped_column(String(300), nullable=False)


class QuizCompetitionSubmission(Base):
    __tablename__ = "quiz_competition_submissions"
    __table_args__ = (UniqueConstraint("competition_id", "user_id", "question_index", name="uq_competition_submission"),)

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    competition_id: Mapped[int] = mapped_column(ForeignKey("quiz_competitions.id"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    question_index: Mapped[int] = mapped_column(Integer, nullable=False)
    selected_answer: Mapped[str] = mapped_column(String(255), nullable=False)
    correct: Mapped[bool] = mapped_column(Boolean, default=False)
    time_taken_seconds: Mapped[int] = mapped_column(Integer, default=0)
    score_delta: Mapped[int] = mapped_column(Integer, default=0)
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
