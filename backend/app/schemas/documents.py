"""Schemas for the documents (Knowledge Library) endpoints."""

from datetime import datetime

from pydantic import BaseModel

from app.schemas.pdf import PdfParseResult


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


class DocumentUploadResult(BaseModel):
    id: str
    filename: str
    status: str
    parse_result: PdfParseResult


class ChunkRequest(BaseModel):
    document_id: str
    parse_result: PdfParseResult


class RetrievalRequest(BaseModel):
    query: str
    top_k: int | None = None
    similarity_threshold: float | None = None
