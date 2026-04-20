import asyncio
import json
from typing import Any, Literal

from openai import AsyncOpenAI

from app.core.config import settings

SkillLevel = Literal["beginner", "intermediate", "advanced"]


class AITutorError(Exception):
    """Raised when AI tutor content generation fails."""


class AITutor:
    """Generate personalized learning paths with OpenAI using structured JSON output."""

    def __init__(self, api_key: str | None = None, retries: int = 3) -> None:
        resolved_key = api_key or settings.openai_api_key
        self._client = AsyncOpenAI(api_key=resolved_key) if resolved_key else None
        self._retries = retries

    @staticmethod
    def _fallback_path(topic: str, skill_level: SkillLevel) -> dict[str, Any]:
        """Return deterministic content when API key is unavailable in local demos."""

        return {
            "steps": [
                f"Review {topic} fundamentals for {skill_level} level",
                f"Practice 3 guided examples in {topic}",
                f"Build a small {topic} mini-project",
                "Complete a checkpoint quiz and reflect on mistakes",
            ],
            "estimated_time": "2-3 hours",
            "resources": [
                "Official docs",
                "Interactive coding exercise",
                "Short concept recap video",
            ],
            "quiz_questions": [
                f"What is the core concept behind {topic}?",
                f"When should you use {topic} in real projects?",
                f"Identify one common pitfall in {topic}.",
            ],
        }

    async def generate_learning_path(self, topic: str, skill_level: SkillLevel) -> dict[str, Any]:
        """Create a structured adaptive learning path with steps, resources, and quiz prompts.

        Args:
            topic: Subject to teach.
            skill_level: Student competency level.

        Returns:
            Structured JSON-like dict with keys: steps, estimated_time, resources, quiz_questions.

        Raises:
            AITutorError: If generation fails after retries.
        """

        if self._client is None:
            return self._fallback_path(topic=topic, skill_level=skill_level)

        schema = {
            "type": "object",
            "properties": {
                "steps": {"type": "array", "items": {"type": "string"}},
                "estimated_time": {"type": "string"},
                "resources": {"type": "array", "items": {"type": "string"}},
                "quiz_questions": {"type": "array", "items": {"type": "string"}},
            },
            "required": ["steps", "estimated_time", "resources", "quiz_questions"],
            "additionalProperties": False,
        }

        for attempt in range(1, self._retries + 1):
            try:
                response = await self._client.responses.create(
                    model="gpt-4o",
                    input=[
                        {
                            "role": "system",
                            "content": [
                                {
                                    "type": "text",
                                    "text": "You are an AI tutor that returns only valid JSON.",
                                }
                            ],
                        },
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "text",
                                    "text": (
                                        f"Generate a personalized learning path for topic '{topic}' "
                                        f"for a {skill_level} student."
                                    ),
                                }
                            ],
                        },
                    ],
                    text={
                        "format": {
                            "type": "json_schema",
                            "name": "learning_path",
                            "schema": schema,
                        }
                    },
                )

                output_text = response.output_text
                payload = json.loads(output_text)
                return payload
            except Exception as exc:  # noqa: BLE001
                if attempt == self._retries:
                    raise AITutorError("Failed to generate learning path after retries") from exc
                await asyncio.sleep(0.5 * attempt)

        raise AITutorError("Unexpected tutor generation failure")
