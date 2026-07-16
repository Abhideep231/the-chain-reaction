"""Vector store (ChromaDB) collection-level routes.

Status/delete/reset operate on the whole collection rather than a
single document's data; POST /documents/store (the write path) lives
in api/routes/documents.py alongside the rest of the document
pipeline. DELETE /document/{document_id} is also the Knowledge
Library's delete action (Sprint 20) — deleting a document's vectors
without also removing its uploaded PDF would leave an orphaned file on
disk, so this route cleans up both.
"""

from pathlib import Path

from fastapi import APIRouter

from app.core.config import get_settings
from app.core.constants import PDF_EXTENSION
from app.services.vectorstore.models import (
    DeleteDocumentResult,
    ResetDatabaseResult,
    VectorStoreStatus,
)
from app.services.vectorstore.vector_store import get_vector_store_service

router = APIRouter(prefix="/vectorstore", tags=["vectorstore"])


@router.get("/status", response_model=VectorStoreStatus)
def get_vector_store_status() -> VectorStoreStatus:
    return get_vector_store_service().get_status()


@router.delete("/document/{document_id}", response_model=DeleteDocumentResult)
def delete_document(document_id: str) -> DeleteDocumentResult:
    result = get_vector_store_service().delete_document_embeddings(document_id)
    upload_dir = Path(get_settings().upload_dir)
    (upload_dir / f"{document_id}{PDF_EXTENSION}").unlink(missing_ok=True)
    return result


@router.delete("/reset", response_model=ResetDatabaseResult)
def reset_vector_store() -> ResetDatabaseResult:
    return get_vector_store_service().reset_database()
