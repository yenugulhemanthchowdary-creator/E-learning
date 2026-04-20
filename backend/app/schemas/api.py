from typing import Literal

from pydantic import BaseModel, Field


Difficulty = Literal["beginner", "intermediate", "advanced"]


class RegisterRequest(BaseModel):
    email: str
    full_name: str
    password: str = Field(min_length=8)


class LoginRequest(BaseModel):
    email: str
    password: str


class UserProfile(BaseModel):
    id: int
    full_name: str
    email: str
    avatar: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfile


class DashboardResponse(BaseModel):
    student_id: int
    progress_percent: int
    streak_days: int
    badges: list[str]


class LearningPathRequest(BaseModel):
    topic: str
    skill_level: Difficulty


class QuizQuestion(BaseModel):
    id: str
    topic: str
    difficulty: Difficulty
    prompt: str
    options: list[str]
    answer: str
    hint: str


class QuizSubmitRequest(BaseModel):
    student_id: int
    topic: str
    difficulty: Difficulty
    question_id: str
    selected_answer: str


class QuizSubmitResponse(BaseModel):
    correct: bool
    score_delta: int
    next_difficulty: Difficulty


class LeaderboardEntry(BaseModel):
    student_id: int
    display_name: str
    score: int
    streak: int


class LearningPathResponse(BaseModel):
    steps: list[str]
    estimated_time: str
    resources: list[str]
    quiz_questions: list[str]


class CourseResponse(BaseModel):
    id: int
    title: str
    description: str
    instructor: str
    thumbnail: str
    rating: float
    duration: str
    difficulty: Difficulty
    category: str
    price: int
    progress: int
    ai_recommended: bool
    students: int
    created_at: str


class CourseProgressUpdateRequest(BaseModel):
    progress: int = Field(ge=0, le=100)
