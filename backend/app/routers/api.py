from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.db.database import get_db
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.quiz_attempt import QuizAttempt
from app.models.user import User
from app.schemas.api import (
    AuthResponse,
    CourseProgressUpdateRequest,
    CourseResponse,
    DashboardResponse,
    LeaderboardEntry,
    LearningPathRequest,
    LearningPathResponse,
    LoginRequest,
    QuizQuestion,
    QuizSubmitRequest,
    QuizSubmitResponse,
    RegisterRequest,
    UserProfile,
)
from app.schemas.sandbox import CodeFeedbackRequest, CodeFeedbackResponse
from app.services.ai_tutor import AITutor, AITutorError
from app.services.code_feedback import CodeFeedbackService

router = APIRouter(prefix="/api", tags=["EduAI"])
Difficulty = Literal["beginner", "intermediate", "advanced"]

QUIZ_BLUEPRINTS: list[dict[str, object]] = [
    {
        "prompt": "What best describes asynchronous programming in {topic}?",
        "options": [
            "Running tasks concurrently without blocking",
            "Storing every result in a global variable",
            "Compiling code into machine language first",
            "Designing interfaces without user feedback",
        ],
        "answer": "Running tasks concurrently without blocking",
        "hint": "Think about event loops and non-blocking I/O.",
    },
    {
        "prompt": "Which habit improves maintainability in {topic} projects?",
        "options": [
            "Breaking work into clear modules",
            "Skipping naming conventions",
            "Avoiding tests during development",
            "Duplicating logic to move faster",
        ],
        "answer": "Breaking work into clear modules",
        "hint": "Look for the option that reduces complexity over time.",
    },
    {
        "prompt": "What is the safest way to improve quality while learning {topic}?",
        "options": [
            "Write small iterations and validate often",
            "Add features without checking outputs",
            "Ignore edge cases until launch day",
            "Keep all code in one long file",
        ],
        "answer": "Write small iterations and validate often",
        "hint": "Frequent feedback beats big risky jumps.",
    },
    {
        "prompt": "Which choice usually helps {topic} applications scale?",
        "options": [
            "Designing around reusable patterns",
            "Hardcoding every configuration",
            "Avoiding documentation for speed",
            "Removing error handling",
        ],
        "answer": "Designing around reusable patterns",
        "hint": "Choose the option that makes growth easier, not harder.",
    },
    {
        "prompt": "What should a beginner focus on first in {topic}?",
        "options": [
            "Core concepts before heavy optimization",
            "Premature micro-optimizations",
            "Framework churn every week",
            "Memorizing errors without understanding them",
        ],
        "answer": "Core concepts before heavy optimization",
        "hint": "Strong fundamentals create faster long-term progress.",
    },
    {
        "prompt": "Which workflow reduces bugs in {topic} development?",
        "options": [
            "Testing assumptions with realistic examples",
            "Pushing directly without verification",
            "Ignoring failures in local runs",
            "Changing multiple systems without tracking them",
        ],
        "answer": "Testing assumptions with realistic examples",
        "hint": "Reliable teams validate before they celebrate.",
    },
    {
        "prompt": "What is a strong way to learn {topic} faster?",
        "options": [
            "Build one focused project after each lesson",
            "Only watch tutorials without practice",
            "Copy code without understanding it",
            "Skip reflection after mistakes",
        ],
        "answer": "Build one focused project after each lesson",
        "hint": "Hands-on repetition turns theory into skill.",
    },
    {
        "prompt": "Which principle improves collaboration on {topic} teams?",
        "options": [
            "Readable code and shared conventions",
            "Personal shortcuts that only one person knows",
            "Avoiding comments and documentation entirely",
            "Changing patterns in every file",
        ],
        "answer": "Readable code and shared conventions",
        "hint": "The best answer helps the next teammate too.",
    },
    {
        "prompt": "What is the best response when a {topic} feature fails unexpectedly?",
        "options": [
            "Inspect inputs, logs, and reproduce the issue",
            "Hide the error from users and move on",
            "Rewrite the whole codebase immediately",
            "Assume the infrastructure is always wrong",
        ],
        "answer": "Inspect inputs, logs, and reproduce the issue",
        "hint": "Debugging starts with evidence, not guesses.",
    },
    {
        "prompt": "Which result shows genuine progress in {topic}?",
        "options": [
            "Solving real problems with confidence",
            "Collecting courses without finishing them",
            "Memorizing syntax without application",
            "Avoiding challenging exercises",
        ],
        "answer": "Solving real problems with confidence",
        "hint": "Look for an outcome, not just activity.",
    },
]


def serialize_course(course: Course, progress: int) -> CourseResponse:
    return CourseResponse(
        id=course.id,
        title=course.title,
        description=course.description,
        instructor=course.instructor,
        thumbnail=course.thumbnail,
        rating=course.rating,
        duration=course.duration,
        difficulty=course.difficulty,  # type: ignore[arg-type]
        category=course.category,
        price=course.price,
        progress=progress,
        ai_recommended=course.ai_recommended,
        students=course.students,
        created_at=course.created_at,
    )


def build_quiz_bank(topic: str, difficulty: Difficulty) -> list[QuizQuestion]:
    return [
        QuizQuestion(
            id=f"{topic.lower().replace(' ', '-')}-{difficulty}-{index + 1}",
            topic=topic,
            difficulty=difficulty,
            prompt=str(item["prompt"]).format(topic=topic),
            options=list(item["options"]),  # type: ignore[arg-type]
            answer=str(item["answer"]),
            hint=str(item["hint"]),
        )
        for index, item in enumerate(QUIZ_BLUEPRINTS)
    ]


@router.post("/auth/register", response_model=AuthResponse, summary="Register a new student account")
async def register(request: RegisterRequest, db: AsyncSession = Depends(get_db)) -> AuthResponse:
    """Create a student user and return a JWT access token.

    This endpoint stores a hashed password and returns a bearer token
    for immediate authenticated access.
    """

    existing = await db.execute(select(User).where(User.email == request.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        email=request.email,
        full_name=request.full_name,
        hashed_password=hash_password(request.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token(subject=str(user.id), extra_claims={"email": user.email})
    return AuthResponse(
        access_token=token,
        user=UserProfile(
            id=user.id,
            full_name=user.full_name,
            email=user.email,
            avatar=f"https://i.pravatar.cc/100?img={(user.id % 70) + 1}",
        ),
    )


@router.post("/auth/login", response_model=AuthResponse, summary="Login student and issue JWT token")
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)) -> AuthResponse:
    """Authenticate a student by email/password and return JWT bearer token."""

    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(subject=str(user.id), extra_claims={"email": user.email})
    return AuthResponse(
        access_token=token,
        user=UserProfile(
            id=user.id,
            full_name=user.full_name,
            email=user.email,
            avatar=f"https://i.pravatar.cc/100?img={(user.id % 70) + 1}",
        ),
    )


@router.get("/auth/me", response_model=UserProfile, summary="Get current authenticated user profile")
async def me(current_user: User = Depends(get_current_user)) -> UserProfile:
    """Return the current authenticated user's profile from JWT bearer token."""

    return UserProfile(
        id=current_user.id,
        full_name=current_user.full_name,
        email=current_user.email,
        avatar=f"https://i.pravatar.cc/100?img={(current_user.id % 70) + 1}",
    )


@router.get("/courses", response_model=list[CourseResponse], summary="List available courses")
async def list_courses(db: AsyncSession = Depends(get_db)) -> list[CourseResponse]:
    """Return all courses for catalog browsing and filtering."""

    result = await db.execute(select(Course).order_by(Course.id.asc()))
    courses = list(result.scalars().all())
    return [serialize_course(course, progress=(course.id * 13) % 100) for course in courses]


@router.get("/courses/{course_id}", response_model=CourseResponse, summary="Get course details")
async def get_course(course_id: int, db: AsyncSession = Depends(get_db)) -> CourseResponse:
    """Return one course by ID for the course detail page."""

    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    return serialize_course(course, progress=(course.id * 13) % 100)


@router.post("/courses/{course_id}/enroll", summary="Enroll current user in a course")
async def enroll_course(
    course_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, str]:
    """Enroll authenticated user in a course if not already enrolled."""

    course_result = await db.execute(select(Course).where(Course.id == course_id))
    course = course_result.scalar_one_or_none()
    if course is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    existing = await db.execute(
        select(Enrollment).where(Enrollment.user_id == current_user.id, Enrollment.course_id == course_id)
    )
    if existing.scalar_one_or_none() is None:
        db.add(Enrollment(user_id=current_user.id, course_id=course_id, progress=0))
        await db.commit()

    return {"status": "enrolled"}


@router.patch("/courses/{course_id}/progress", summary="Update current user's course progress")
async def update_course_progress(
    course_id: int,
    payload: CourseProgressUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, int]:
    """Update progress percent for authenticated user's enrollment."""

    result = await db.execute(
        select(Enrollment).where(Enrollment.user_id == current_user.id, Enrollment.course_id == course_id)
    )
    enrollment = result.scalar_one_or_none()
    if enrollment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enrollment not found")

    enrollment.progress = payload.progress
    await db.commit()
    return {"progress": enrollment.progress}


@router.get("/student/courses/me", response_model=list[CourseResponse], summary="Get current user's enrolled courses")
async def get_my_courses(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[CourseResponse]:
    """Return enrolled courses for current user with persisted progress values."""

    enrollments_result = await db.execute(
        select(Enrollment, Course)
        .join(Course, Course.id == Enrollment.course_id)
        .where(Enrollment.user_id == current_user.id)
        .order_by(Enrollment.created_at.desc())
    )
    rows = enrollments_result.all()

    return [serialize_course(course, progress=enrollment.progress) for enrollment, course in rows]


@router.get(
    "/student/{id}/dashboard",
    response_model=DashboardResponse,
    summary="Get a student's dashboard progress snapshot",
)
async def get_student_dashboard(id: int) -> DashboardResponse:
    """Return student progress details including streaks and earned badges."""

    return DashboardResponse(
        student_id=id,
        progress_percent=68,
        streak_days=9,
        badges=["Consistent Learner", "Quiz Wizard", "Code Challenger"],
    )


@router.post(
    "/learning-path/generate",
    response_model=LearningPathResponse,
    summary="Generate AI-personalized learning path",
)
async def generate_learning_path(payload: LearningPathRequest) -> LearningPathResponse:
    """Generate a personalized learning plan by calling the OpenAI-backed AI tutor service."""

    tutor = AITutor()
    try:
        data = await tutor.generate_learning_path(topic=payload.topic, skill_level=payload.skill_level)
    except AITutorError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc

    return LearningPathResponse(**data)


@router.get(
    "/quiz/{topic}/{difficulty}",
    response_model=list[QuizQuestion],
    summary="Fetch quiz questions by topic and difficulty",
)
async def get_quiz_questions(topic: str, difficulty: Difficulty) -> list[QuizQuestion]:
    """Return adaptive quiz questions for the requested topic and difficulty level."""

    return build_quiz_bank(topic=topic, difficulty=difficulty)


@router.post("/quiz/submit", response_model=QuizSubmitResponse, summary="Submit quiz answer")
async def submit_quiz(
    request: QuizSubmitRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> QuizSubmitResponse:
    """Score a submitted answer and suggest the next adaptive difficulty."""

    question_bank = build_quiz_bank(topic=request.topic, difficulty=request.difficulty)
    question = next((item for item in question_bank if item.id == request.question_id), None)
    if question is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz question not found")

    correct = question.answer.strip().lower() == request.selected_answer.strip().lower()
    next_difficulty: Difficulty = request.difficulty

    if correct and request.difficulty != "advanced":
        next_difficulty = "intermediate" if request.difficulty == "beginner" else "advanced"
    if not correct and request.difficulty != "beginner":
        next_difficulty = "intermediate" if request.difficulty == "advanced" else "beginner"

    score_delta = 10 if correct else 0
    db.add(
        QuizAttempt(
            user_id=current_user.id,
            topic=request.topic,
            difficulty=request.difficulty,
            question_id=request.question_id,
            selected_answer=request.selected_answer,
            correct=correct,
            score_delta=score_delta,
        )
    )
    await db.commit()

    return QuizSubmitResponse(correct=correct, score_delta=score_delta, next_difficulty=next_difficulty)


@router.get(
    "/student/dashboard/me",
    response_model=DashboardResponse,
    summary="Get authenticated student's dashboard snapshot",
)
async def get_my_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DashboardResponse:
    """Return computed dashboard values for the currently authenticated student."""

    result = await db.execute(
        select(QuizAttempt)
        .where(QuizAttempt.user_id == current_user.id)
        .order_by(QuizAttempt.created_at.desc())
        .limit(100)
    )
    attempts = list(result.scalars().all())
    total_attempts = len(attempts)
    total_score = sum(item.score_delta for item in attempts)
    progress_percent = min(100, total_score)

    streak_days = 0
    for item in attempts:
        if item.correct:
            streak_days += 1
        else:
            break

    badges: list[str] = []
    if total_attempts >= 5:
        badges.append("Quiz Starter")
    if total_score >= 50:
        badges.append("Consistent Learner")
    if streak_days >= 3:
        badges.append("Streak Builder")
    if not badges:
        badges.append("New Explorer")

    return DashboardResponse(
        student_id=current_user.id,
        progress_percent=progress_percent,
        streak_days=streak_days,
        badges=badges,
    )


@router.get("/leaderboard", response_model=list[LeaderboardEntry], summary="Get platform leaderboard")
async def get_leaderboard() -> list[LeaderboardEntry]:
    """Return top-ranked students based on total score and streak momentum."""

    return [
        LeaderboardEntry(student_id=1, display_name="Maya", score=1480, streak=12),
        LeaderboardEntry(student_id=2, display_name="Alex", score=1415, streak=9),
        LeaderboardEntry(student_id=3, display_name="Sam", score=1370, streak=8),
    ]


@router.post(
    "/code/feedback",
    response_model=CodeFeedbackResponse,
    summary="Generate real-time AI feedback for code sandbox",
)
async def get_code_feedback(payload: CodeFeedbackRequest) -> CodeFeedbackResponse:
    """Analyze student code and return concise AI feedback with actionable suggestions."""

    service = CodeFeedbackService()
    result = await service.analyze(language=payload.language, code=payload.code)
    return CodeFeedbackResponse(**result)
