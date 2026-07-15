"""Schemas for the documents (Knowledge Library) endpoints."""

from pydantic import BaseModel


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
