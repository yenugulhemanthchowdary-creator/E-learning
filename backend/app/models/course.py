from sqlalchemy import Boolean, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(String(500), nullable=False, default="")
    instructor: Mapped[str] = mapped_column(String(120), nullable=False)
    thumbnail: Mapped[str] = mapped_column(String(350), nullable=False)
    rating: Mapped[float] = mapped_column(Float, default=4.5)
    duration: Mapped[str] = mapped_column(String(40), nullable=False)
    difficulty: Mapped[str] = mapped_column(String(20), nullable=False)
    category: Mapped[str] = mapped_column(String(60), nullable=False)
    price: Mapped[int] = mapped_column(Integer, default=0)
    ai_recommended: Mapped[bool] = mapped_column(Boolean, default=False)
    students: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[str] = mapped_column(String(40), nullable=False)
