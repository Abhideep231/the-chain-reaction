"""Pydantic models for the chunks produced by the chunking service."""

from datetime import datetime

from pydantic import BaseModel


class ChunkMetadata(BaseModel):
    source_filename: str
    page_number: int
    total_pages: int
    created_at: datetime


class Chunk(BaseModel):
    chunk_id: str
    document_id: str
    chunk_index: int
    page_number: int
    text: str
    character_count: int
    estimated_token_count: int
    metadata: ChunkMetadata


class ChunkingResult(BaseModel):
    total_chunks: int
    chunks: list[Chunk]
