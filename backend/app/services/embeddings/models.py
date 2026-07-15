"""Pydantic models for the embeddings produced by the embedding service."""

from datetime import datetime

from pydantic import BaseModel


class Embedding(BaseModel):
    embedding_id: str
    document_id: str
    chunk_id: str
    chunk_index: int
    embedding_model: str
    vector_dimension: int
    embedding: list[float]
    created_at: datetime


class EmbeddingResult(BaseModel):
    total_embeddings: int
    embedding_model: str
    vector_dimension: int
    embeddings: list[Embedding]
