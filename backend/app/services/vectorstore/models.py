"""Pydantic models for the vector store service."""

from datetime import datetime

from pydantic import BaseModel


class StoredVectorMetadata(BaseModel):
    document_id: str
    chunk_id: str
    chunk_index: int
    filename: str
    page_number: int
    chunk_text: str
    embedding_model: str
    vector_dimension: int
    created_at: datetime


class StoreEmbeddingsResult(BaseModel):
    stored_vectors: int
    collection_name: str
    database_path: str


class VectorStoreStatus(BaseModel):
    collection_exists: bool
    collection_name: str
    total_vectors: int
    embedding_model: str | None
    vector_dimension: int | None
    database_path: str
    health: str


class DeleteDocumentResult(BaseModel):
    document_id: str
    deleted_count: int


class ResetDatabaseResult(BaseModel):
    status: str
    collection_name: str


class QueryMatch(BaseModel):
    """One nearest-neighbor match from a similarity query, ordered by
    the collection's distance metric (most similar first).
    """

    chunk_id: str
    document_id: str
    chunk_index: int
    page_number: int
    filename: str
    chunk_text: str
    embedding_model: str
    vector_dimension: int
    created_at: datetime
    distance: float
    similarity_score: float
