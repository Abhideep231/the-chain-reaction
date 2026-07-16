"""Pydantic models for the Claude API integration service."""

from pydantic import BaseModel


class Citation(BaseModel):
    document_id: str
    filename: str
    page_number: int
    chunk_id: str
    similarity_score: float


class AskResponse(BaseModel):
    answer: str
    citations: list[Citation]
    confidence: float
    response_time_ms: float
    model: str
