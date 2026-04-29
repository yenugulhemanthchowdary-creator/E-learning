from typing import Literal

from pydantic import BaseModel, Field


Difficulty = Literal["beginner", "intermediate", "advanced"]
CompetitionStatus = Literal["open", "live", "ended"]


class RegisterRequest(BaseModel):
    email: str
    full_name: str
    password: str = Field(min_length=8)
    phone: str | None = None
    bio: str | None = None
    learning_goals: list[str] = Field(default_factory=list)


class LoginRequest(BaseModel):
    email: str
    password: str


class UserProfile(BaseModel):
    id: int
    full_name: str
    email: str
    avatar: str
    phone: str | None = None
    bio: str | None = None
    learning_goals: list[str] = Field(default_factory=list)


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


class TutorChatRequest(BaseModel):
    message: str
    api_key: str | None = None
    model: str | None = None


class TutorChatResponse(BaseModel):
    answer: str


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
    video_id: str = ""
    created_at: str


class CourseProgressUpdateRequest(BaseModel):
    progress: int = Field(ge=0, le=100)


class CompetitionCreateRequest(BaseModel):
    title: str = Field(min_length=3, max_length=120)
    topic: str = Field(min_length=2, max_length=80)
    difficulty: Difficulty
    question_count: int = Field(default=10, ge=5, le=30)
    seconds_per_question: int = Field(default=20, ge=10, le=90)
    max_participants: int = Field(default=50, ge=2, le=500)
    is_public: bool = True


class CompetitionJoinRequest(BaseModel):
    join_code: str | None = None


class CompetitionResponse(BaseModel):
    id: int
    title: str
    topic: str
    difficulty: Difficulty
    question_count: int
    seconds_per_question: int
    max_participants: int
    is_public: bool
    status: CompetitionStatus
    join_code: str
    created_by: int
    participant_count: int


class CompetitionQuestionResponse(BaseModel):
    question_index: int
    total_questions: int
    prompt: str
    options: list[str]
    hint: str
    difficulty: Difficulty
    topic: str
    seconds_per_question: int


class CompetitionSubmitRequest(BaseModel):
    question_index: int = Field(ge=1)
    selected_answer: str = Field(min_length=1, max_length=255)
    time_taken_seconds: int = Field(ge=0, le=180)


class CompetitionSubmitResponse(BaseModel):
    correct: bool
    score_delta: int
    total_score: int
    next_question_index: int
    competition_completed: bool


class CompetitionLeaderboardEntry(BaseModel):
    user_id: int
    display_name: str
    score: int
    answered_questions: int
    rank: int
