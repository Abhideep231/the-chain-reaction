"""Schemas for the documents (Knowledge Library) endpoints."""

from pydantic import BaseModel

from app.schemas.pdf import PdfParseResult


class DocumentSummary(BaseModel):
    id: str
    filename: str
    status: str
    page_count: int | None = None


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
