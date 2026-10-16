"""Schemas describing the structured output of PDF parsing."""

from pydantic import BaseModel, Field


class PdfMetadata(BaseModel):
    filename: str
    title: str | None = None
    author: str | None = None
    creator: str | None = None
    producer: str | None = None
    subject: str | None = None
    creation_date: str | None = None
    modification_date: str | None = None
    total_pages: int


class PdfPageContent(BaseModel):
    page_number: int
    extracted_text: str
    character_count: int
    word_count: int
    table_rows: list[str] = Field(default_factory=list)
    narrative_text: str | None = None


class PdfParseResult(BaseModel):
    metadata: PdfMetadata
    pages: list[PdfPageContent]
