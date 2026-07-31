"""Documents (Knowledge Library) routes.

GET /documents (Sprint 20) lists real, fully-indexed documents,
aggregated from their stored chunks via the vector store service — see
api/routes/vectorstore.py for the collection-level status/delete/reset
endpoints, including the per-document delete the Knowledge Library
uses. POST /documents remains a placeholder (unrelated legacy schema).

POST /documents/upload validates an uploaded PDF, saves it, and
schedules the rest of the pipeline (parse -> chunk -> embed -> store,
see app.services.indexing.indexing_service) as a background task —
the response returns immediately with status "processing". Poll
GET /documents/{id}/status for progress. Earlier sprints exposed
parse/chunk/embed/store as separate client-driven endpoints, which
meant the frontend had to receive and re-upload each stage's full
output (including every chunk's actual embedding vector) as the next
stage's input; that round-trip no longer exists.

POST /documents/retrieve runs semantic similarity search via the
retrieval service.
"""

import uuid
from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, HTTPException, Request, UploadFile, status

from app.core.config import get_settings
from app.core.constants import ALLOWED_PDF_CONTENT_TYPES, PDF_EXTENSION, PDF_MAGIC_BYTES
from app.core.logging import get_logger
from app.schemas.documents import (
    DocumentListResponse,
    DocumentSummary,
    DocumentUploadAccepted,
    DocumentUploadRequest,
    DocumentUploadResponse,
    RetrievalRequest,
)
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
from app.services.indexing.indexing_service import get_indexing_job_store, run_indexing_pipeline
from app.services.indexing.models import IndexingJob
from app.services.retrieval.exceptions import (
    EmptyQueryError,
    InvalidTopKError,
    RetrievalError,
    VectorStoreUnavailableError,
)
from app.services.retrieval.models import RetrievalResponse
from app.services.retrieval.retrieval_service import retrieve
from app.services.vectorstore.vector_store import get_vector_store_service

# Not underscore-prefixed: api/routes/chat.py's /chat/ask also imports these,
# since asking Claude reuses this same retrieval/embedding pipeline and
# should report the exact same status codes for the exact same failures.
EMBEDDING_ERROR_STATUS: dict[type[EmbeddingError], int] = {
    EmptyChunkListError: status.HTTP_422_UNPROCESSABLE_ENTITY,
    InvalidChunkDataError: status.HTTP_422_UNPROCESSABLE_ENTITY,
    MissingApiKeyError: status.HTTP_500_INTERNAL_SERVER_ERROR,
    InvalidModelError: status.HTTP_500_INTERNAL_SERVER_ERROR,
    EmbeddingAuthenticationError: status.HTTP_500_INTERNAL_SERVER_ERROR,
    EmbeddingRateLimitError: status.HTTP_429_TOO_MANY_REQUESTS,
    EmbeddingTimeoutError: status.HTTP_504_GATEWAY_TIMEOUT,
    EmbeddingApiError: status.HTTP_502_BAD_GATEWAY,
}

RETRIEVAL_ERROR_STATUS: dict[type[RetrievalError], int] = {
    EmptyQueryError: status.HTTP_422_UNPROCESSABLE_ENTITY,
    InvalidTopKError: status.HTTP_422_UNPROCESSABLE_ENTITY,
    VectorStoreUnavailableError: status.HTTP_503_SERVICE_UNAVAILABLE,
}

router = APIRouter(tags=["documents"])
logger = get_logger(__name__)


def _file_size_bytes(path: Path) -> int | None:
    """Real size of an uploaded PDF still on disk, or None if it's
    missing — never fabricated, and never fatal to listing documents."""
    try:
        return path.stat().st_size
    except OSError:
        return None


@router.get("/documents", response_model=DocumentListResponse)
def list_documents() -> DocumentListResponse:
    settings = get_settings()
    upload_dir = Path(settings.upload_dir)

    stored_documents = get_vector_store_service().list_documents()
    documents = [
        DocumentSummary(
            id=doc.document_id,
            filename=doc.filename,
            status="indexed",
            page_count=doc.page_count,
            chunk_count=doc.chunk_count,
            file_size_bytes=_file_size_bytes(upload_dir / f"{doc.document_id}{PDF_EXTENSION}"),
            uploaded_at=doc.first_stored_at,
        )
        for doc in stored_documents
    ]
    return DocumentListResponse(documents=documents, total=len(documents))


@router.post("/documents", response_model=DocumentUploadResponse)
def upload_document(request: DocumentUploadRequest) -> DocumentUploadResponse:
    return DocumentUploadResponse(
        id=str(uuid.uuid4()),
        filename=request.filename,
        status="received",
    )


@router.post(
    "/documents/upload",
    response_model=DocumentUploadAccepted,
    status_code=status.HTTP_202_ACCEPTED,
)
async def upload_pdf(
    request: Request, file: UploadFile, background_tasks: BackgroundTasks
) -> DocumentUploadAccepted:
    settings = get_settings()
    filename = file.filename or ""

    # TEMPORARY DEBUG — remove once the 413 investigation is resolved.
    print(
        "UPLOAD ENDPOINT HIT",
        "content_length=", request.headers.get("content-length"),
        "filename=", filename,
    )

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

    document_id = str(uuid.uuid4())
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    (upload_dir / f"{document_id}{PDF_EXTENSION}").write_bytes(content)

    get_indexing_job_store().create(document_id, filename)
    background_tasks.add_task(run_indexing_pipeline, document_id, filename, content)

    logger.info("upload accepted: id=%s filename=%s", document_id, filename)

    return DocumentUploadAccepted(id=document_id, filename=filename, status="processing")


@router.get("/documents/{document_id}/status", response_model=IndexingJob)
def get_document_status(document_id: str) -> IndexingJob:
    job = get_indexing_job_store().get(document_id)
    if job is None:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            f"No indexing job found for document '{document_id}'.",
        )
    return job


@router.post("/documents/retrieve", response_model=RetrievalResponse)
def retrieve_chunks(request: RetrievalRequest) -> RetrievalResponse:
    try:
        return retrieve(request.query, request.top_k, request.similarity_threshold)
    except RetrievalError as exc:
        status_code = RETRIEVAL_ERROR_STATUS.get(
            type(exc), status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        raise HTTPException(status_code, str(exc)) from exc
    except EmbeddingError as exc:
        status_code = EMBEDDING_ERROR_STATUS.get(
            type(exc), status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        raise HTTPException(status_code, str(exc)) from exc
