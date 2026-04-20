from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]
PROJECT_ROOT = BACKEND_DIR.parent


def _default_database_url() -> str:
    database_path = (PROJECT_ROOT / "eduai.db").resolve()
    return f"sqlite+aiosqlite:///{database_path.as_posix()}"


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str = _default_database_url()
    redis_url: str = "redis://localhost:6379/0"
    openai_api_key: str = ""
    jwt_secret_key: str = "change-me"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    @field_validator("database_url", mode="before")
    @classmethod
    def normalize_relative_sqlite_url(cls, value: str) -> str:
        if not isinstance(value, str):
            return value

        prefix = "sqlite+aiosqlite:///"
        if not value.startswith(prefix):
            return value

        raw_path = value[len(prefix) :]
        if raw_path.startswith("/") or ":" in raw_path[:3]:
            return value

        resolved = (PROJECT_ROOT / raw_path).resolve()
        return f"{prefix}{resolved.as_posix()}"

    @property
    def cors_origin_list(self) -> list[str]:
        items = [item.strip() for item in self.cors_origins.split(",")]
        return [item for item in items if item]


settings = Settings()
