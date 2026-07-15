"""Documents (Knowledge Library) routes.

GET/POST /documents remain placeholders (no vector storage yet — that
is implemented in a future sprint). POST /documents/upload validates
and parses an uploaded PDF via the parser service. POST
/documents/chunk splits an already-parsed document into overlapping
text chunks via the chunker service. POST /documents/embed generates
OpenAI embeddings for an already-chunked document via the embedding
service; embeddings are returned in memory only, never persisted.
"""

import uuid
from pathlib import Path

from fastapi import APIRouter, HTTPException, UploadFile, status

from app.core.config import get_settings
from app.core.constants import ALLOWED_PDF_CONTENT_TYPES, PDF_EXTENSION, PDF_MAGIC_BYTES
from app.core.logging import get_logger
from app.schemas.documents import (
    ChunkRequest,
    DocumentListResponse,
    DocumentUploadRequest,
    DocumentUploadResponse,
    DocumentUploadResult,
)
from app.services.chunker.chunker import chunk_document
from app.services.chunker.exceptions import ChunkingError
from app.services.chunker.models import ChunkingResult
from app.services.embeddings.embedding_service import generate_embeddings
from app.services.embeddings.exceptions import (
    EmbeddingApiError,
    EmbeddingAuthenticationError,
    EmbeddingError,
    EmbeddingRateLimitError,
    EmbeddingTimeoutError,
    EmptyChunkListError,
    InvalidChunkDataError,
    InvalidModelError,
    MissingApiKeyError,
)
from app.services.embeddings.models import EmbeddingResult
from app.services.parser.exceptions import PdfParsingError
from app.services.parser.pdf_parser import parse_pdf

_EMBEDDING_ERROR_STATUS: dict[type[EmbeddingError], int] = {
    EmptyChunkListError: status.HTTP_422_UNPROCESSABLE_ENTITY,
    InvalidChunkDataError: status.HTTP_422_UNPROCESSABLE_ENTITY,
    MissingApiKeyError: status.HTTP_500_INTERNAL_SERVER_ERROR,
    InvalidModelError: status.HTTP_500_INTERNAL_SERVER_ERROR,
    EmbeddingAuthenticationError: status.HTTP_500_INTERNAL_SERVER_ERROR,
    EmbeddingRateLimitError: status.HTTP_429_TOO_MANY_REQUESTS,
    EmbeddingTimeoutError: status.HTTP_504_GATEWAY_TIMEOUT,
    EmbeddingApiError: status.HTTP_502_BAD_GATEWAY,
}

router = APIRouter(tags=["documents"])
logger = get_logger(__name__)


@router.get("/documents", response_model=DocumentListResponse)
def list_documents() -> DocumentListResponse:
    return DocumentListResponse(documents=[], total=0)


@router.post("/documents", response_model=DocumentUploadResponse)
def upload_document(request: DocumentUploadRequest) -> DocumentUploadResponse:
    return DocumentUploadResponse(
        id=str(uuid.uuid4()),
        filename=request.filename,
        status="received",
    )


@router.post(
    "/documents/upload",
    response_model=DocumentUploadResult,
    status_code=status.HTTP_201_CREATED,
)
async def upload_pdf(file: UploadFile) -> DocumentUploadResult:
    settings = get_settings()
    filename = file.filename or ""

    logger.info("upload started: filename=%s content_type=%s", filename, file.content_type)

    if not filename.lower().endswith(PDF_EXTENSION):
        raise HTTPException(
            status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            "Only .pdf files are accepted.",
        )

    if file.content_type not in ALLOWED_PDF_CONTENT_TYPES:
        raise HTTPException(
            status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            f"Unsupported content type: {file.content_type}.",
        )

    content = await file.read()

    if not content:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Uploaded file is empty.")

    max_bytes = settings.max_upload_size_mb * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(
            status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            f"File exceeds the {settings.max_upload_size_mb}MB limit.",
        )

    if not content.startswith(PDF_MAGIC_BYTES):
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            "File does not appear to be a valid PDF.",
        )

    try:
        parse_result = parse_pdf(content, filename)
    except PdfParsingError as exc:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, str(exc)) from exc

    document_id = str(uuid.uuid4())
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    (upload_dir / f"{document_id}{PDF_EXTENSION}").write_bytes(content)

    logger.info(
        "upload completed: id=%s filename=%s pages=%d",
        document_id,
        filename,
        parse_result.metadata.total_pages,
    )

    return DocumentUploadResult(
        id=document_id,
        filename=filename,
        status="parsed",
        parse_result=parse_result,
    )


@router.post("/documents/chunk", response_model=ChunkingResult)
def chunk_pdf(request: ChunkRequest) -> ChunkingResult:
    settings = get_settings()
    try:
        return chunk_document(
            request.parse_result,
            request.document_id,
            chunk_size=settings.chunk_size,
            chunk_overlap=settings.chunk_overlap,
        )
    except ChunkingError as exc:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, str(exc)) from exc


@router.post("/documents/embed", response_model=EmbeddingResult)
def embed_chunks(request: ChunkingResult) -> EmbeddingResult:
    try:
        return generate_embeddings(request)
    except EmbeddingError as exc:
        status_code = _EMBEDDING_ERROR_STATUS.get(
            type(exc), status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        raise HTTPException(status_code, str(exc)) from exc
