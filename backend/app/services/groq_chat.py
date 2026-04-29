import json

import httpx

from app.core.config import settings


class GroqChatError(Exception):
    """Raised when Groq chat generation fails."""

    def __init__(self, message: str, status_code: int | None = None) -> None:
        super().__init__(message)
        self.status_code = status_code


class GroqChatService:
    """Simple Groq OpenAI-compatible chat wrapper for tutor-style chat."""

    def __init__(
        self,
        api_key: str | None = None,
        model: str | None = None,
        timeout_seconds: float = 20.0,
    ) -> None:
        resolved_key = (api_key or settings.groq_api_key or "").strip()
        resolved_model = (model or settings.groq_model or "llama-3.1-8b-instant").strip()

        self._api_key = resolved_key
        self._model = resolved_model
        self._timeout_seconds = timeout_seconds

    @staticmethod
    def _extract_answer(payload: object) -> str | None:
        if not isinstance(payload, dict):
            return None

        choices = payload.get("choices")
        if not isinstance(choices, list) or not choices:
            return None

        first_choice = choices[0]
        if not isinstance(first_choice, dict):
            return None

        message = first_choice.get("message")
        if not isinstance(message, dict):
            return None

        content = message.get("content")
        if not isinstance(content, str):
            return None

        return content.strip() or None

    @staticmethod
    def _extract_error_message(payload: object, fallback: str) -> str:
        if not isinstance(payload, dict):
            return fallback

        error = payload.get("error")
        if not isinstance(error, dict):
            return fallback

        message = error.get("message")
        if isinstance(message, str) and message.strip():
            return message.strip()

        return fallback

    async def chat(self, message: str, system_prompt: str) -> str:
        trimmed = (message or "").strip()
        if not trimmed:
            raise GroqChatError("Message cannot be empty", status_code=400)

        if not self._api_key:
            raise GroqChatError("Missing Groq API key", status_code=400)

        url = "https://api.groq.com/openai/v1/chat/completions"
        payload = {
            "model": self._model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": trimmed},
            ],
            "max_completion_tokens": 512,
            "temperature": 0.7,
        }
        headers = {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
        }

        timeout = httpx.Timeout(self._timeout_seconds)
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, headers=headers, json=payload)

        if response.status_code >= 400:
            fallback = response.text or "Groq request failed."
            try:
                detail = self._extract_error_message(json.loads(response.text), fallback)
            except Exception:  # noqa: BLE001
                detail = fallback
            raise GroqChatError(
                f"Groq request failed ({response.status_code}): {detail}",
                status_code=response.status_code,
            )

        try:
            data = response.json()
        except Exception as exc:  # noqa: BLE001
            raise GroqChatError("Groq returned invalid JSON response") from exc

        answer = self._extract_answer(data)
        if not answer:
            raise GroqChatError("Groq response did not include any text")

        return answer
