from openai import AsyncOpenAI

from app.core.config import settings


class CodeFeedbackService:
    """Provide AI feedback for sandbox code snippets."""

    def __init__(self) -> None:
        self._client = AsyncOpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None

    @staticmethod
    def _fallback_feedback(language: str) -> dict[str, list[str] | str]:
        return {
            "feedback": f"Solid {language} draft. Focus on correctness first, then optimize.",
            "suggestions": [
                "Add edge-case handling for empty and invalid inputs.",
                "Use clearer variable names for readability.",
                "Add at least two tests for happy-path and failure-path.",
            ],
        }

    async def analyze(self, language: str, code: str) -> dict[str, list[str] | str]:
        if self._client is None:
            return self._fallback_feedback(language)

        response = await self._client.responses.create(
            model="gpt-4o",
            input=(
                "You are a strict code reviewer. Return concise feedback and 3 suggestions. "
                f"Language: {language}\nCode:\n{code}"
            ),
        )
        text = response.output_text or "No feedback available."
        return {
            "feedback": text.split("\n")[0],
            "suggestions": [
                "Add edge-case handling.",
                "Improve naming clarity.",
                "Include tests for core logic.",
            ],
        }
