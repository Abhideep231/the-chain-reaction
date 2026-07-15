"""Documents (Knowledge Library) routes.

Placeholder only — no parsing, chunking, embeddings, or storage. Those
are implemented in a future sprint.
"""

import uuid

from fastapi import APIRouter

from app.schemas.documents import (
    DocumentListResponse,
    DocumentUploadRequest,
    DocumentUploadResponse,
)

router = APIRouter(tags=["documents"])


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
