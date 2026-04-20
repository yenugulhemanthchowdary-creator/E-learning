from pydantic import BaseModel


class CodeFeedbackRequest(BaseModel):
    language: str
    code: str


class CodeFeedbackResponse(BaseModel):
    feedback: str
    suggestions: list[str]
