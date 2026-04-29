import json
import random
import string
from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import CurrentUser, get_current_user
from app.core.config import settings
from app.core.security import create_access_token, hash_password, verify_password
from app.db.database import get_db, next_sequence
from app.schemas.api import (
    AuthResponse,
    CompetitionCreateRequest,
    CompetitionJoinRequest,
    CompetitionLeaderboardEntry,
    CompetitionQuestionResponse,
    CompetitionResponse,
    CompetitionSubmitRequest,
    CompetitionSubmitResponse,
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
    TutorChatRequest,
    TutorChatResponse,
    UserProfile,
)
from app.schemas.sandbox import CodeFeedbackRequest, CodeFeedbackResponse
from app.services.ai_tutor import AITutor, AITutorError
from app.services.code_feedback import CodeFeedbackService
from app.services.groq_chat import GroqChatError, GroqChatService

router = APIRouter(prefix="/api", tags=["EduAI"])
Difficulty = Literal["beginner", "intermediate", "advanced"]
TUTOR_SYSTEM_PROMPT = (
    "You are EduAI, a helpful learning assistant for students. Keep answers concise and educational."
)

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


def serialize_course(course: dict, progress: int) -> CourseResponse:
    return CourseResponse(
        id=int(course["id"]),
        title=str(course["title"]),
        description=str(course.get("description", "")),
        instructor=str(course["instructor"]),
        thumbnail=str(course["thumbnail"]),
        rating=float(course.get("rating", 0.0)),
        duration=str(course["duration"]),
        difficulty=course["difficulty"],  # type: ignore[arg-type]
        category=str(course["category"]),
        price=int(course.get("price", 0)),
        progress=progress,
        ai_recommended=bool(course.get("ai_recommended", False)),
        students=int(course.get("students", 0)),
        created_at=str(course.get("created_at", "")),
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


def build_competition_question_set(topic: str, difficulty: Difficulty, count: int) -> list[QuizQuestion]:
    seed = build_quiz_bank(topic=topic, difficulty=difficulty)
    if count <= len(seed):
        return seed[:count]

    expanded: list[QuizQuestion] = []
    for index in range(count):
        template = seed[index % len(seed)]
        round_number = (index // len(seed)) + 1
        expanded.append(
            QuizQuestion(
                id=f"{template.id}-r{round_number}",
                topic=template.topic,
                difficulty=template.difficulty,
                prompt=f"{template.prompt} (Round {round_number})",
                options=template.options,
                answer=template.answer,
                hint=template.hint,
            )
        )

    return expanded


async def generate_unique_join_code(db) -> str:
    alphabet = string.ascii_uppercase + string.digits
    competitions = db["quiz_competitions"]
    while True:
        code = "".join(random.choices(alphabet, k=6))
        existing = await competitions.find_one({"join_code": code})
        if existing is None:
            return code


async def competition_participant_count(db, competition_id: int) -> int:
    return await db["quiz_competition_participants"].count_documents({"competition_id": competition_id})


def serialize_competition(competition: dict, participant_count: int) -> CompetitionResponse:
    return CompetitionResponse(
        id=int(competition["id"]),
        title=str(competition["title"]),
        topic=str(competition["topic"]),
        difficulty=competition["difficulty"],  # type: ignore[arg-type]
        question_count=int(competition.get("question_count", 10)),
        seconds_per_question=int(competition.get("seconds_per_question", 20)),
        max_participants=int(competition.get("max_participants", 50)),
        is_public=bool(competition.get("is_public", True)),
        status=competition["status"],  # type: ignore[arg-type]
        join_code=str(competition["join_code"]),
        created_by=int(competition["created_by"]),
        participant_count=participant_count,
    )


def serialize_user_profile(user: dict) -> UserProfile:
    return UserProfile(
        id=int(user["id"]),
        full_name=str(user["full_name"]),
        email=str(user["email"]),
        avatar=f"https://i.pravatar.cc/100?img={(int(user['id']) % 70) + 1}",
        phone=user.get("phone"),
        bio=user.get("bio"),
        learning_goals=list(user.get("learning_goals", [])),
    )


@router.post("/auth/register", response_model=AuthResponse, summary="Register a new student account")
async def register(request: RegisterRequest, db=Depends(get_db)) -> AuthResponse:
    existing = await db["users"].find_one({"email": request.email})
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user_id = await next_sequence("users")
    user = {
        "id": user_id,
        "email": request.email,
        "full_name": request.full_name,
        "hashed_password": hash_password(request.password),
        "phone": request.phone,
        "bio": request.bio,
        "learning_goals": request.learning_goals,
    }
    await db["users"].insert_one(user)

    token = create_access_token(subject=str(user_id), extra_claims={"email": user["email"]})
    return AuthResponse(
        access_token=token,
        user=serialize_user_profile(user),
    )


@router.post("/auth/login", response_model=AuthResponse, summary="Login student and issue JWT token")
async def login(request: LoginRequest, db=Depends(get_db)) -> AuthResponse:
    user = await db["users"].find_one({"email": request.email})
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    stored_hashed_password = user.get("hashed_password")
    legacy_password = user.get("password")

    if stored_hashed_password:
        try:
            is_valid_password = verify_password(request.password, stored_hashed_password)
        except ValueError:
            is_valid_password = False
    else:
        is_valid_password = legacy_password is not None and request.password == legacy_password

    if not is_valid_password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(subject=str(user["id"]), extra_claims={"email": user["email"]})
    return AuthResponse(
        access_token=token,
        user=serialize_user_profile(user),
    )


@router.get("/auth/me", response_model=UserProfile, summary="Get current authenticated user profile")
async def me(current_user: CurrentUser = Depends(get_current_user), db=Depends(get_db)) -> UserProfile:
    user = await db["users"].find_one({"id": current_user.id})
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return serialize_user_profile(user)


@router.get("/courses", response_model=list[CourseResponse], summary="List available courses")
async def list_courses(db=Depends(get_db)) -> list[CourseResponse]:
    courses = await db["courses"].find().sort("id", 1).to_list(length=None)
    return [serialize_course(course, progress=(int(course["id"]) * 13) % 100) for course in courses]


@router.get("/courses/{course_id}", response_model=CourseResponse, summary="Get course details")
async def get_course(course_id: int, db=Depends(get_db)) -> CourseResponse:
    course = await db["courses"].find_one({"id": course_id})
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    return serialize_course(course, progress=(int(course["id"]) * 13) % 100)


@router.post("/courses/{course_id}/enroll", summary="Enroll current user in a course")
async def enroll_course(
    course_id: int,
    db=Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
) -> dict[str, str]:
    course = await db["courses"].find_one({"id": course_id})
    if course is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    enrollments = db["enrollments"]
    existing = await enrollments.find_one({"user_id": current_user.id, "course_id": course_id})
    if existing is None:
        enrollment_id = await next_sequence("enrollments")
        await enrollments.insert_one(
            {
                "id": enrollment_id,
                "user_id": current_user.id,
                "course_id": course_id,
                "progress": 0,
                "created_at": datetime.now(timezone.utc),
            }
        )

    return {"status": "enrolled"}


@router.patch("/courses/{course_id}/progress", summary="Update current user's course progress")
async def update_course_progress(
    course_id: int,
    payload: CourseProgressUpdateRequest,
    db=Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
) -> dict[str, int]:
    enrollments = db["enrollments"]
    enrollment = await enrollments.find_one({"user_id": current_user.id, "course_id": course_id})
    if enrollment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enrollment not found")

    await enrollments.update_one(
        {"id": enrollment["id"]},
        {"$set": {"progress": payload.progress}},
    )
    return {"progress": payload.progress}


@router.get("/student/courses/me", response_model=list[CourseResponse], summary="Get current user's enrolled courses")
async def get_my_courses(
    db=Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
) -> list[CourseResponse]:
    enrollments = await db["enrollments"].find({"user_id": current_user.id}).sort("created_at", -1).to_list(length=None)
    courses_collection = db["courses"]
    results: list[CourseResponse] = []
    for enrollment in enrollments:
        course = await courses_collection.find_one({"id": enrollment["course_id"]})
        if course:
            results.append(serialize_course(course, progress=int(enrollment.get("progress", 0))))
    return results


@router.get(
    "/student/{id}/dashboard",
    response_model=DashboardResponse,
    summary="Get a student's dashboard progress snapshot",
)
async def get_student_dashboard(id: int) -> DashboardResponse:
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
    tutor = AITutor()
    try:
        data = await tutor.generate_learning_path(topic=payload.topic, skill_level=payload.skill_level)
    except AITutorError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc

    return LearningPathResponse(**data)


@router.post(
    "/tutor/chat",
    response_model=TutorChatResponse,
    summary="Chat with AI tutor (Groq)",
)
async def tutor_chat(payload: TutorChatRequest) -> TutorChatResponse:
    service = GroqChatService(
        api_key=settings.groq_api_key or payload.api_key,
        model=settings.groq_model or payload.model,
    )
    try:
        answer = await service.chat(message=payload.message, system_prompt=TUTOR_SYSTEM_PROMPT)
    except GroqChatError as exc:
        status_code = status.HTTP_400_BAD_REQUEST if exc.status_code == 400 else status.HTTP_502_BAD_GATEWAY
        raise HTTPException(status_code=status_code, detail=str(exc)) from exc

    return TutorChatResponse(answer=answer)


@router.get(
    "/quiz/{topic}/{difficulty}",
    response_model=list[QuizQuestion],
    summary="Fetch quiz questions by topic and difficulty",
)
async def get_quiz_questions(topic: str, difficulty: Difficulty) -> list[QuizQuestion]:
    return build_quiz_bank(topic=topic, difficulty=difficulty)


@router.post("/quiz/submit", response_model=QuizSubmitResponse, summary="Submit quiz answer")
async def submit_quiz(
    request: QuizSubmitRequest,
    db=Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
) -> QuizSubmitResponse:
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
    attempt_id = await next_sequence("quiz_attempts")
    await db["quiz_attempts"].insert_one(
        {
            "id": attempt_id,
            "user_id": current_user.id,
            "topic": request.topic,
            "difficulty": request.difficulty,
            "question_id": request.question_id,
            "selected_answer": request.selected_answer,
            "correct": correct,
            "score_delta": score_delta,
            "created_at": datetime.now(timezone.utc),
        }
    )

    return QuizSubmitResponse(correct=correct, score_delta=score_delta, next_difficulty=next_difficulty)


@router.post(
    "/quiz/competitions",
    response_model=CompetitionResponse,
    summary="Create a customizable quiz competition",
)
async def create_quiz_competition(
    payload: CompetitionCreateRequest,
    db=Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
) -> CompetitionResponse:
    join_code = await generate_unique_join_code(db)
    competition_id = await next_sequence("quiz_competitions")
    competition = {
        "id": competition_id,
        "title": payload.title,
        "topic": payload.topic,
        "difficulty": payload.difficulty,
        "question_count": payload.question_count,
        "seconds_per_question": payload.seconds_per_question,
        "max_participants": payload.max_participants,
        "is_public": payload.is_public,
        "status": "open",
        "join_code": join_code,
        "created_by": current_user.id,
        "created_at": datetime.now(timezone.utc),
        "started_at": None,
        "ended_at": None,
    }
    await db["quiz_competitions"].insert_one(competition)

    questions = build_competition_question_set(
        topic=payload.topic,
        difficulty=payload.difficulty,
        count=payload.question_count,
    )
    question_documents: list[dict[str, object]] = []
    for index, question in enumerate(questions, start=1):
        question_documents.append(
            {
                "id": await next_sequence("quiz_competition_questions"),
                "competition_id": competition_id,
                "question_index": index,
                "prompt": question.prompt,
                "options_json": json.dumps(question.options),
                "answer": question.answer,
                "hint": question.hint,
            }
        )
    if question_documents:
        await db["quiz_competition_questions"].insert_many(question_documents)

    await db["quiz_competition_participants"].insert_one(
        {
            "id": await next_sequence("quiz_competition_participants"),
            "competition_id": competition_id,
            "user_id": current_user.id,
            "score": 0,
            "answered_questions": 0,
            "is_host": True,
            "joined_at": datetime.now(timezone.utc),
        }
    )

    return serialize_competition(competition, participant_count=1)


@router.get(
    "/quiz/competitions",
    response_model=list[CompetitionResponse],
    summary="List available public quiz competitions",
)
async def list_quiz_competitions(
    status_filter: Literal["open", "live", "ended"] | None = None,
    db=Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
) -> list[CompetitionResponse]:
    query: dict[str, object] = {"is_public": True}
    if status_filter:
        query["status"] = status_filter

    competitions = await db["quiz_competitions"].find(query).sort("id", -1).to_list(length=None)
    if not competitions:
        return []

    return [
        serialize_competition(
            competition,
            participant_count=await competition_participant_count(db, int(competition["id"])),
        )
        for competition in competitions
    ]


@router.post(
    "/quiz/competitions/{competition_id}/join",
    response_model=CompetitionResponse,
    summary="Join an existing quiz competition",
)
async def join_quiz_competition(
    competition_id: int,
    payload: CompetitionJoinRequest,
    db=Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
) -> CompetitionResponse:
    competition = await db["quiz_competitions"].find_one({"id": competition_id})
    if competition is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Competition not found")
    if competition["status"] == "ended":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Competition already ended")

    participants = db["quiz_competition_participants"]
    existing = await participants.find_one({"competition_id": competition_id, "user_id": current_user.id})
    current_count = await participants.count_documents({"competition_id": competition_id})

    if existing is None:
        if not competition.get("is_public", True) and (payload.join_code or "").upper() != competition["join_code"]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid competition join code")
        if current_count >= int(competition["max_participants"]):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Competition is full")

        await participants.insert_one(
            {
                "id": await next_sequence("quiz_competition_participants"),
                "competition_id": competition_id,
                "user_id": current_user.id,
                "score": 0,
                "answered_questions": 0,
                "is_host": current_user.id == competition["created_by"],
                "joined_at": datetime.now(timezone.utc),
            }
        )
        current_count += 1

    return serialize_competition(competition, participant_count=current_count)


@router.post(
    "/quiz/competitions/{competition_id}/start",
    response_model=CompetitionResponse,
    summary="Start a quiz competition",
)
async def start_quiz_competition(
    competition_id: int,
    db=Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
) -> CompetitionResponse:
    competition = await db["quiz_competitions"].find_one({"id": competition_id})
    if competition is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Competition not found")
    if competition["created_by"] != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only host can start competition")
    if competition["status"] != "open":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Competition is not in open state")

    participant_count = await competition_participant_count(db, competition_id)
    if participant_count < 1:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="No participants available")

    await db["quiz_competitions"].update_one(
        {"id": competition_id},
        {"$set": {"status": "live", "started_at": datetime.now(timezone.utc)}},
    )
    competition["status"] = "live"
    competition["started_at"] = datetime.now(timezone.utc)

    return serialize_competition(competition, participant_count=participant_count)


@router.get(
    "/quiz/competitions/{competition_id}/questions/{question_index}",
    response_model=CompetitionQuestionResponse,
    summary="Get a specific competition question",
)
async def get_competition_question(
    competition_id: int,
    question_index: int,
    db=Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
) -> CompetitionQuestionResponse:
    competition = await db["quiz_competitions"].find_one({"id": competition_id})
    if competition is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Competition not found")
    if competition["status"] != "live":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Competition is not live")

    participant = await db["quiz_competition_participants"].find_one(
        {"competition_id": competition_id, "user_id": current_user.id}
    )
    if participant is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Join competition first")

    question = await db["quiz_competition_questions"].find_one(
        {"competition_id": competition_id, "question_index": question_index}
    )
    if question is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

    return CompetitionQuestionResponse(
        question_index=int(question["question_index"]),
        total_questions=int(competition["question_count"]),
        prompt=str(question["prompt"]),
        options=json.loads(question["options_json"]),
        hint=str(question["hint"]),
        difficulty=competition["difficulty"],  # type: ignore[arg-type]
        topic=str(competition["topic"]),
        seconds_per_question=int(competition["seconds_per_question"]),
    )


@router.post(
    "/quiz/competitions/{competition_id}/submit",
    response_model=CompetitionSubmitResponse,
    summary="Submit one competition answer",
)
async def submit_competition_answer(
    competition_id: int,
    payload: CompetitionSubmitRequest,
    db=Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
) -> CompetitionSubmitResponse:
    competition = await db["quiz_competitions"].find_one({"id": competition_id})
    if competition is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Competition not found")
    if competition["status"] != "live":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Competition is not live")

    participants = db["quiz_competition_participants"]
    participant = await participants.find_one({"competition_id": competition_id, "user_id": current_user.id})
    if participant is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Join competition first")

    submissions = db["quiz_competition_submissions"]
    existing_submission = await submissions.find_one(
        {
            "competition_id": competition_id,
            "user_id": current_user.id,
            "question_index": payload.question_index,
        }
    )
    if existing_submission is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Question already submitted")

    question = await db["quiz_competition_questions"].find_one(
        {"competition_id": competition_id, "question_index": payload.question_index}
    )
    if question is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

    correct = str(question["answer"]).strip().lower() == payload.selected_answer.strip().lower()
    bounded_time = max(0, min(payload.time_taken_seconds, int(competition["seconds_per_question"])))
    speed_bonus = max(0, int(competition["seconds_per_question"]) - bounded_time) * 2
    score_delta = (100 + speed_bonus) if correct else 0

    await submissions.insert_one(
        {
            "id": await next_sequence("quiz_competition_submissions"),
            "competition_id": competition_id,
            "user_id": current_user.id,
            "question_index": payload.question_index,
            "selected_answer": payload.selected_answer,
            "correct": correct,
            "time_taken_seconds": bounded_time,
            "score_delta": score_delta,
            "submitted_at": datetime.now(timezone.utc),
        }
    )

    updated_score = int(participant.get("score", 0)) + score_delta
    answered_questions = max(int(participant.get("answered_questions", 0)), payload.question_index)
    await participants.update_one(
        {"id": participant["id"]},
        {"$set": {"score": updated_score, "answered_questions": answered_questions}},
    )

    completed = answered_questions >= int(competition["question_count"])
    next_question_index = min(int(competition["question_count"]), payload.question_index + 1)

    return CompetitionSubmitResponse(
        correct=correct,
        score_delta=score_delta,
        total_score=updated_score,
        next_question_index=next_question_index,
        competition_completed=completed,
    )


@router.get(
    "/quiz/competitions/{competition_id}/leaderboard",
    response_model=list[CompetitionLeaderboardEntry],
    summary="Get competition leaderboard",
)
async def get_competition_leaderboard(
    competition_id: int,
    db=Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
) -> list[CompetitionLeaderboardEntry]:
    competition = await db["quiz_competitions"].find_one({"id": competition_id})
    if competition is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Competition not found")

    participant_check = await db["quiz_competition_participants"].find_one(
        {"competition_id": competition_id, "user_id": current_user.id}
    )
    if participant_check is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Join competition first")

    rows = await db["quiz_competition_participants"].find({"competition_id": competition_id}).to_list(length=None)
    user_ids = [row["user_id"] for row in rows]
    users = await db["users"].find({"id": {"$in": user_ids}}).to_list(length=None)
    users_by_id = {int(user["id"]): user for user in users}

    rows.sort(key=lambda row: (-int(row.get("score", 0)), -int(row.get("answered_questions", 0)), row.get("joined_at")))

    leaderboard: list[CompetitionLeaderboardEntry] = []
    for index, participant in enumerate(rows, start=1):
        user = users_by_id.get(int(participant["user_id"]))
        if user is None:
            continue
        leaderboard.append(
            CompetitionLeaderboardEntry(
                user_id=int(user["id"]),
                display_name=str(user["full_name"]),
                score=int(participant.get("score", 0)),
                answered_questions=int(participant.get("answered_questions", 0)),
                rank=index,
            )
        )

    return leaderboard


@router.get(
    "/student/dashboard/me",
    response_model=DashboardResponse,
    summary="Get authenticated student's dashboard snapshot",
)
async def get_my_dashboard(
    current_user: CurrentUser = Depends(get_current_user),
    db=Depends(get_db),
) -> DashboardResponse:
    attempts = await db["quiz_attempts"].find({"user_id": current_user.id}).sort("created_at", -1).to_list(length=None)
    total_attempts = len(attempts)
    total_score = sum(int(item.get("score_delta", 0)) for item in attempts)
    progress_percent = min(100, total_score)

    streak_days = 0
    for item in attempts:
        if item.get("correct"):
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
    service = CodeFeedbackService()
    result = await service.analyze(language=payload.language, code=payload.code)
    return CodeFeedbackResponse(**result)
