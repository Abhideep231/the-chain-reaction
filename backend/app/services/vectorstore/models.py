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


class StoredDocumentSummary(BaseModel):
    """One document's aggregate metadata, derived entirely from its
    stored chunks (Sprint 20) — the vector store's own view of "what
    documents exist," independent of anything the upload/parse stage
    knew. `page_count` is the highest page number that produced a
    chunk, not `PdfMetadata.total_pages` directly, though the two agree
    for any document that made it through chunking (every page must
    have extractable text or chunking itself fails).
    """

    document_id: str
    filename: str
    chunk_count: int
    page_count: int
    embedding_model: str
    first_stored_at: datetime
