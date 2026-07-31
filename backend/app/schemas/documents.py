"""Schemas for the documents (Knowledge Library) endpoints."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class DocumentSummary(BaseModel):
    id: str
    filename: str
    status: str
    page_count: int | None = None
    # Sprint 20 (Knowledge Library): derived from the document's stored
    # chunks (see VectorStoreService.list_documents) plus, for
    # file_size_bytes, the uploaded PDF still on disk — see
    # api/routes/documents.py. All three are 0/None only if the source
    # data is itself unavailable, never fabricated.
    chunk_count: int = 0
    file_size_bytes: int | None = None
    uploaded_at: datetime | None = None


class DocumentListResponse(BaseModel):
    documents: list[DocumentSummary]
    total: int


class DocumentUploadRequest(BaseModel):
    filename: str
    content_type: str


class DocumentUploadResponse(BaseModel):
    id: str
    filename: str
    status: str


class DocumentUploadAccepted(BaseModel):
    """POST /documents/upload's immediate response — the file is saved
    and validated, but parsing/chunking/embedding/storing all happen
    afterward in a background task (see
    app.services.indexing.indexing_service). Poll
    GET /documents/{id}/status for progress.
    """

    id: str
    filename: str
    status: Literal["processing"]


class RetrievalRequest(BaseModel):
    query: str
    top_k: int | None = None
    similarity_threshold: float | None = None
