"""Schemas for the chat (Ask AI) endpoint."""

from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str
    conversation_id: str | None = None


class ChatCitation(BaseModel):
    document_id: str
    page: int
    excerpt: str


class ChatResponse(BaseModel):
    conversation_id: str
    reply: str
    citations: list[ChatCitation]
    confidence: float | None = None


class AskRequest(BaseModel):
    question: str
