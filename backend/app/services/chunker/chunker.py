"""Recursive text chunking service — the single source of document
chunking for the RAG pipeline.

Splits each page's extracted text into overlapping chunks, preferring
to break on paragraph boundaries, then sentence boundaries, then word
boundaries, falling back to a hard character split only if a single
"word" is itself longer than the target chunk size. Splitting is
lossless by construction (every step slices the original string with
no characters added or removed), so concatenating chunks and
subtracting the intentional overlaps always reconstructs the original
page text exactly.
"""

import math
import re
import time
import uuid
from datetime import UTC, datetime

from app.core.logging import get_logger
from app.schemas.pdf import PdfParseResult
from app.services.chunker.exceptions import EmptyDocumentError, EmptyPageError
from app.services.chunker.models import Chunk, ChunkingResult, ChunkMetadata

logger = get_logger(__name__)

DEFAULT_CHUNK_SIZE = 1000
DEFAULT_CHUNK_OVERLAP = 200

# Tried in priority order: paragraph, line, sentence, word. Whatever is
# left after all four is split at a hard character boundary.
_PARAGRAPH_BOUNDARY = re.compile(r"\n\s*\n+")
_LINE_BOUNDARY = re.compile(r"\n")
_SENTENCE_BOUNDARY = re.compile(r"(?<=[.!?])\s+")
_WORD_BOUNDARY = re.compile(r"\s+")
_SPLIT_PATTERNS = (_PARAGRAPH_BOUNDARY, _LINE_BOUNDARY, _SENTENCE_BOUNDARY, _WORD_BOUNDARY)


def chunk_document(
    parse_result: PdfParseResult,
    document_id: str,
    chunk_size: int = DEFAULT_CHUNK_SIZE,
    chunk_overlap: int = DEFAULT_CHUNK_OVERLAP,
) -> ChunkingResult:
    """Chunk every page of a parsed document.

    Raises:
        EmptyDocumentError: the document has zero pages.
        EmptyPageError: a page has no extractable text.
    """
    logger.info(
        "chunking started: document_id=%s pages=%d chunk_size=%d chunk_overlap=%d",
        document_id,
        parse_result.metadata.total_pages,
        chunk_size,
        chunk_overlap,
    )
    start = time.monotonic()

    if not parse_result.pages:
        raise EmptyDocumentError(f"Document '{document_id}' has no pages to chunk.")

    for page in parse_result.pages:
        if not page.extracted_text.strip():
            raise EmptyPageError(
                f"Page {page.page_number} of document '{document_id}' has no extractable text."
            )

    created_at = datetime.now(UTC)
    chunks: list[Chunk] = []
    for page in parse_result.pages:
        for chunk_text in _chunk_text(page.extracted_text, chunk_size, chunk_overlap):
            chunks.append(
                Chunk(
                    chunk_id=str(uuid.uuid4()),
                    document_id=document_id,
                    chunk_index=len(chunks),
                    page_number=page.page_number,
                    text=chunk_text,
                    character_count=len(chunk_text),
                    estimated_token_count=_estimate_token_count(chunk_text),
                    metadata=ChunkMetadata(
                        source_filename=parse_result.metadata.filename,
                        page_number=page.page_number,
                        total_pages=parse_result.metadata.total_pages,
                        created_at=created_at,
                    ),
                )
            )

    duration = time.monotonic() - start
    average_chunk_size = sum(c.character_count for c in chunks) / len(chunks) if chunks else 0
    logger.info(
        "chunking completed: document_id=%s total_chunks=%d avg_chunk_size=%.1f duration_s=%.3f",
        document_id,
        len(chunks),
        average_chunk_size,
        duration,
    )
    return ChunkingResult(total_chunks=len(chunks), chunks=chunks)


def _chunk_text(text: str, chunk_size: int, chunk_overlap: int) -> list[str]:
    units = _split_recursive(text, chunk_size)
    return _merge_with_overlap(units, chunk_size, chunk_overlap)


def _split_recursive(text: str, max_size: int) -> list[str]:
    """Break `text` into pieces no longer than `max_size`, splitting on the
    highest-priority boundary available. Concatenating the returned pieces
    always reproduces `text` exactly — no characters are added, removed,
    or reordered.
    """
    if len(text) <= max_size:
        return [text]

    for pattern in _SPLIT_PATTERNS:
        pieces = _split_keep_boundary(text, pattern)
        if len(pieces) > 1:
            result: list[str] = []
            for piece in pieces:
                result.extend(_split_recursive(piece, max_size))
            return result

    # No natural boundary found (e.g. one long token) — hard character split.
    return [text[i : i + max_size] for i in range(0, len(text), max_size)]


def _split_keep_boundary(text: str, pattern: re.Pattern[str]) -> list[str]:
    """Split on `pattern`, attaching each matched separator to the piece
    that precedes it so the pieces can be rejoined with `''.join(...)`.
    """
    pieces: list[str] = []
    last_end = 0
    for match in pattern.finditer(text):
        pieces.append(text[last_end : match.end()])
        last_end = match.end()
    pieces.append(text[last_end:])
    return [piece for piece in pieces if piece]


def _merge_with_overlap(units: list[str], chunk_size: int, chunk_overlap: int) -> list[str]:
    """Greedily pack atomic units (each already <= chunk_size) into chunks,
    seeding each new chunk with the trailing `chunk_overlap` characters of
    the previous chunk. This is the only place text is intentionally
    duplicated.
    """
    chunks: list[str] = []
    current = ""
    for unit in units:
        if current and len(current) + len(unit) > chunk_size:
            chunks.append(current)
            current = current[-chunk_overlap:] if chunk_overlap > 0 else ""
        current += unit
    if current:
        chunks.append(current)
    return chunks


def _estimate_token_count(text: str) -> int:
    """Rough token estimate (~4 characters per token), avoiding a tokenizer
    dependency for a value that's only ever used as an approximation.
    """
    return math.ceil(len(text) / 4)
