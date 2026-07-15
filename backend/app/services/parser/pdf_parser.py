"""PDF parsing service — the single source of PDF extraction for the app.

Opens a PDF from raw bytes, reads its metadata, and extracts text from
every page in reading order. Every other service that needs PDF content
(chunking, embeddings, etc., in future sprints) calls `parse_pdf` rather
than touching PyMuPDF directly.
"""

import time

import fitz

from app.core.logging import get_logger
from app.schemas.pdf import PdfMetadata, PdfPageContent, PdfParseResult
from app.services.parser.exceptions import (
    CorruptedPdfError,
    EmptyPdfError,
    EncryptedPdfError,
)

logger = get_logger(__name__)


def parse_pdf(content: bytes, filename: str) -> PdfParseResult:
    """Parse PDF bytes into structured metadata and per-page text.

    Raises:
        CorruptedPdfError: the bytes are not a readable PDF.
        EncryptedPdfError: the PDF requires a password to open.
        EmptyPdfError: the PDF opened but has zero pages.
    """
    logger.info("parsing started: filename=%s size_bytes=%d", filename, len(content))
    start = time.monotonic()

    try:
        document = fitz.open(stream=content, filetype="pdf")
    except Exception as exc:
        logger.warning("parsing failed: filename=%s reason=corrupted error=%s", filename, exc)
        raise CorruptedPdfError(f"'{filename}' could not be opened as a PDF.") from exc

    try:
        if document.needs_pass:
            logger.warning("parsing failed: filename=%s reason=encrypted", filename)
            raise EncryptedPdfError(f"'{filename}' is password-protected.")

        if document.page_count == 0:
            logger.warning("parsing failed: filename=%s reason=empty", filename)
            raise EmptyPdfError(f"'{filename}' contains no pages.")

        metadata = _extract_metadata(document, filename)
        pages = [_extract_page(document, index) for index in range(document.page_count)]
    finally:
        document.close()

    duration = time.monotonic() - start
    logger.info(
        "parsing completed: filename=%s pages=%d duration_s=%.3f",
        filename,
        metadata.total_pages,
        duration,
    )
    return PdfParseResult(metadata=metadata, pages=pages)


def _extract_metadata(document: fitz.Document, filename: str) -> PdfMetadata:
    info = document.metadata or {}
    return PdfMetadata(
        filename=filename,
        title=_clean(info.get("title")),
        author=_clean(info.get("author")),
        creator=_clean(info.get("creator")),
        producer=_clean(info.get("producer")),
        subject=_clean(info.get("subject")),
        creation_date=_clean(info.get("creationDate")),
        modification_date=_clean(info.get("modDate")),
        total_pages=document.page_count,
    )


def _extract_page(document: fitz.Document, index: int) -> PdfPageContent:
    page = document.load_page(index)
    text: str = page.get_text("text") or ""
    return PdfPageContent(
        page_number=index + 1,
        extracted_text=text,
        character_count=len(text),
        word_count=len(text.split()),
    )


def _clean(value: str | None) -> str | None:
    """Normalize PyMuPDF's empty-string-for-missing-field convention to None."""
    if value is None:
        return None
    stripped = value.strip()
    return stripped or None
