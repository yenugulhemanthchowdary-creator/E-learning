# EduAI

EduAI is a full-stack e-learning web application built for demos, college submissions, and early-stage product pitching. It combines a React frontend with a FastAPI backend to showcase:

- Student registration and login
- Course discovery and enrollment
- Course progress tracking
- Adaptive quiz workflows
- Learning analytics dashboards
- AI-assisted learning paths
- AI code feedback with local fallback behavior

## What Changed In This Build

This version is structured to be easier to run and present:

- Frontend auth and course flows now use the FastAPI backend consistently
- The previous Firebase dependency in core user flows has been removed from runtime behavior
- Backend startup upgrades older demo databases by adding course descriptions automatically
- AI features work with an OpenAI key, but still fall back gracefully for local demo use
- Vite dev server proxies API requests to FastAPI by default

## Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, Framer Motion
- Backend: FastAPI, SQLAlchemy, SQLite by default
- Optional AI: OpenAI Responses API

## Project Structure

```text
frontend/
  src/
    api/
    components/
    context/
    hooks/
    pages/
backend/
  app/
    core/
    db/
    models/
    routers/
    schemas/
    services/
eduai.db
```

## Local Run

### 1. Backend

```powershell
cd backend
copy .env.example .env
py -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --port 8000
```

Notes:

- `OPENAI_API_KEY` is optional for local demo mode
- If no OpenAI key is set, learning path and code feedback features still return fallback demo responses
- The default SQLite database is stored at the repository root as `eduai.db`
- `asyncpg` is only needed if you switch to PostgreSQL later:

```powershell
pip install -r requirements-postgres.txt
```

Optional development mode (auto-reload):

```powershell
uvicorn app.main:app --reload --reload-dir app --port 8000
```

### 2. Frontend

```powershell
cd frontend
copy .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:5173`.

By default, the frontend proxies `/api` requests to `http://127.0.0.1:8000`.

### One-Click Start

You can also run both servers together from the project root:

```powershell
.\start-dev.bat
```

This opens one terminal window for the backend and one for the frontend, then you can open `http://localhost:5173`.

## Environment Variables

### Backend `.env`

```env
DATABASE_URL=sqlite+aiosqlite:///eduai.db
REDIS_URL=redis://localhost:6379/0
OPENAI_API_KEY=
GROQ_API_KEY=
GROQ_MODEL=llama-3.1-8b-instant
JWT_SECRET_KEY=change-me
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=60
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### Frontend `.env.local`

```env
VITE_API_BASE_URL=
VITE_API_PROXY_TARGET=http://127.0.0.1:8000
VITE_GROQ_API_KEY=
```

Use `VITE_API_BASE_URL` only when the frontend is deployed separately from the backend.

## Demo Flow

For a clean presentation:

1. Open the home page and show the AI learning path and code feedback sections.
2. Register a fresh learner account.
3. Browse the course catalog and open a course detail page.
4. Enroll in a course and update progress.
5. Open the dashboard and quiz pages to show learner analytics and adaptive assessment.

## Submission Notes

This build is suitable for presentation and evaluation, but if you plan to sell it to a company, the next production steps should be:

1. Add automated tests for backend routes and frontend critical flows.
2. Replace demo leaderboard and static analytics blocks with persisted reporting data.
3. Add admin roles, content management, and audit logging.
4. Move secrets to production secret management and set a strong JWT secret.
5. Add deployment configuration for your target hosting platform.
