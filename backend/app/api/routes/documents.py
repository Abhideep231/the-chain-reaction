"""Documents (Knowledge Library) routes.

GET/POST /documents remain placeholders (no chunking, embeddings, or
storage yet — those are implemented in a future sprint). POST
/documents/upload is real: it validates and parses an uploaded PDF via
the parser service and persists the raw file to the upload directory.
"""

import uuid
from pathlib import Path

from fastapi import APIRouter, HTTPException, UploadFile, status

from app.core.config import get_settings
from app.core.constants import ALLOWED_PDF_CONTENT_TYPES, PDF_EXTENSION, PDF_MAGIC_BYTES
from app.core.logging import get_logger
from app.schemas.documents import (
    DocumentListResponse,
    DocumentUploadRequest,
    DocumentUploadResponse,
    DocumentUploadResult,
)
from app.services.parser.exceptions import PdfParsingError
from app.services.parser.pdf_parser import parse_pdf

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
