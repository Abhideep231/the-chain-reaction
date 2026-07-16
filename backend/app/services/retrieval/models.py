"""Pydantic models for the semantic retrieval service."""

from datetime import datetime

from pydantic import BaseModel


class RetrievalMetadata(BaseModel):
    filename: str
    created_at: datetime


class RetrievalResult(BaseModel):
    document_id: str
    chunk_id: str
    chunk_index: int
    page_number: int
    similarity_score: float
    chunk_text: str
    metadata: RetrievalMetadata
    embedding_model: str


class RetrievalResponse(BaseModel):
    query: str
    results: list[RetrievalResult]
