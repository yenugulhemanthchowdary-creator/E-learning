import os
from collections.abc import Sequence
from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.database import database, ensure_sequence
from app.routers.api import router as api_router

STARTER_CATALOG: Sequence[dict[str, object]] = (
    {
        "title": "Python Foundations",
        "description": "Build a strong Python base with variables, functions, debugging, and practical mini-projects.",
        "instructor": "Dr. Rahul Sharma",
        "thumbnail": "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
        "rating": 4.8,
        "duration": "24h",
        "difficulty": "beginner",
        "category": "Programming",
        "price": 499,
        "ai_recommended": True,
        "students": 12400,
        "created_at": "2026-02-01T00:00:00",
    },
    {
        "title": "React UI Engineering",
        "description": "Create responsive React interfaces with reusable components, hooks, and production-ready patterns.",
        "instructor": "Priya Nair",
        "thumbnail": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80",
        "rating": 4.9,
        "duration": "30h",
        "difficulty": "intermediate",
        "category": "Frontend",
        "price": 999,
        "ai_recommended": True,
        "students": 8900,
        "created_at": "2026-02-03T00:00:00",
    },
    {
        "title": "Machine Learning Essentials",
        "description": "Learn model training, evaluation, and applied machine learning workflows with guided exercises.",
        "instructor": "Prof. Anil Kumar",
        "thumbnail": "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&w=1200&q=80",
        "rating": 4.7,
        "duration": "40h",
        "difficulty": "advanced",
        "category": "AI",
        "price": 1999,
        "ai_recommended": True,
        "students": 6200,
        "created_at": "2026-02-05T00:00:00",
    },
    {
        "title": "SQL for Data Analysis",
        "description": "Query, aggregate, and analyze relational data with SQL best practices and real-world reports.",
        "instructor": "Meena Iyer",
        "thumbnail": "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1200&q=80",
        "rating": 4.6,
        "duration": "18h",
        "difficulty": "beginner",
        "category": "Data",
        "price": 299,
        "ai_recommended": False,
        "students": 9100,
        "created_at": "2026-02-07T00:00:00",
    },
    {
        "title": "TypeScript in Depth",
        "description": "Master advanced typing, generics, and scalable application architecture for modern teams.",
        "instructor": "Karan Mehta",
        "thumbnail": "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80",
        "rating": 4.8,
        "duration": "26h",
        "difficulty": "intermediate",
        "category": "Programming",
        "price": 899,
        "ai_recommended": False,
        "students": 5400,
        "created_at": "2026-02-09T00:00:00",
    },
    {
        "title": "System Design for Developers",
        "description": "Design scalable systems with APIs, caching, queues, and cloud-ready architectural thinking.",
        "instructor": "Ananya Singh",
        "thumbnail": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
        "rating": 4.9,
        "duration": "32h",
        "difficulty": "advanced",
        "category": "Architecture",
        "price": 1499,
        "ai_recommended": True,
        "students": 4300,
        "created_at": "2026-02-11T00:00:00",
    },
    {
        "title": "UI/UX Design Sprint",
        "description": "Turn ideas into polished wireframes, prototypes, and user-tested design decisions.",
        "instructor": "Sara Khan",
        "thumbnail": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
        "rating": 4.7,
        "duration": "20h",
        "difficulty": "beginner",
        "category": "Design",
        "price": 549,
        "ai_recommended": False,
        "students": 5100,
        "created_at": "2026-02-13T00:00:00",
    },
    {
        "title": "Applied Data Science Lab",
        "description": "Work on notebooks, dashboards, and practical data storytelling with end-to-end case studies.",
        "instructor": "Aarav Shah",
        "thumbnail": "https://images.unsplash.com/photo-1516321165247-4aa89a48be28?auto=format&fit=crop&w=1200&q=80",
        "rating": 4.8,
        "duration": "28h",
        "difficulty": "intermediate",
        "category": "Data Science",
        "price": 1299,
        "ai_recommended": True,
        "students": 4700,
        "created_at": "2026-02-15T00:00:00",
    },
)


def build_course_description(course: dict[str, object]) -> str:
    return (
        f"Strengthen your {str(course['category']).lower()} skills through {course['difficulty']} lessons, "
        "guided projects, adaptive quizzes, and mentor-style checkpoints."
    )


async def seed_or_upgrade_courses() -> None:
    courses = database["courses"]
    existing_count = await courses.count_documents({})

    if existing_count == 0:
        seeded_courses: list[dict[str, object]] = []
        for index, payload in enumerate(STARTER_CATALOG, start=1):
            document = dict(payload)
            document["id"] = index
            seeded_courses.append(document)
        if seeded_courses:
            await courses.insert_many(seeded_courses)
            await ensure_sequence("courses", len(seeded_courses))
        return

    async for course in courses.find({"description": {"$in": [None, ""]}}):
        await courses.update_one(
            {"id": course["id"]},
            {"$set": {"description": build_course_description(course)}},
        )

    highest_course = await courses.find_one(sort=[("id", -1)])
    if highest_course and isinstance(highest_course.get("id"), int):
        await ensure_sequence("courses", int(highest_course["id"]))


app = FastAPI(
    title="EduAI API",
    description="AI-powered e-learning backend with adaptive quizzes and analytics.",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event() -> None:
    """Seed MongoDB starter content and initialize sequence counters."""

    print("GROQ KEY:", bool(os.getenv("GROQ_API_KEY")))
    print("GROQ KEY (settings):", bool(settings.groq_api_key))
    await seed_or_upgrade_courses()


@app.get("/health", tags=["Health"])
async def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/", tags=["Health"])
async def root() -> dict[str, str]:
    return {
        "message": "EduAI backend is running",
        "health": "/health",
        "docs": "/docs",
    }


app.include_router(api_router)
