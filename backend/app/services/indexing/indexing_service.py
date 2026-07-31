"""Server-owned document indexing pipeline.

    Upload -> Parse -> Chunk -> Embed -> Store

Before this, each stage was a separate, client-driven REST call: the
frontend received a stage's full output and re-POSTed it as the next
stage's input — including, for /documents/embed's response and
/documents/store's request, every chunk's actual embedding vector.
For a real multi-hundred-page document that meant tens of megabytes of
chunk text and embedding vectors round-tripping through the browser on
every upload — slow, and exactly the kind of payload an intermediate
proxy (a GitHub Codespaces forwarded port, in practice) can reject
with 413, independent of anything this app's own code does.

The whole pipeline now runs entirely server-side, in one background
task kicked off by POST /documents/upload (see api/routes/documents.py):
the frontend sends the raw file once and polls GET
/documents/{id}/status — this module's `IndexingJob` — for progress.
GET /documents itself (backed directly by ChromaDB) remains the source
of truth for what's actually indexed; this job store only tracks
in-flight/recently-finished progress, and is allowed to lose that
state on a restart without affecting correctness.
"""

import threading
import time
from functools import lru_cache

from app.core.config import get_settings
from app.core.logging import get_logger
from app.services.chunker.chunker import chunk_document
from app.services.chunker.exceptions import ChunkingError
from app.services.embeddings.embedding_service import generate_embeddings
from app.services.embeddings.exceptions import EmbeddingError
from app.services.indexing.models import IndexingJob
from app.services.parser.exceptions import PdfParsingError
from app.services.parser.pdf_parser import parse_pdf
from app.services.vectorstore.exceptions import VectorStoreError
from app.services.vectorstore.vector_store import get_vector_store_service

logger = get_logger(__name__)


class IndexingJobStore:
    """Owns one process-wide record of every document's indexing job,
    keyed by document_id.
    """

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._jobs: dict[str, IndexingJob] = {}

    def create(self, document_id: str, filename: str) -> IndexingJob:
        job = IndexingJob(id=document_id, filename=filename, status="processing", stage="parsing")
        with self._lock:
            self._jobs[document_id] = job
        return job

    def update(self, document_id: str, **changes: object) -> None:
        with self._lock:
            job = self._jobs.get(document_id)
            if job is None:
                return
            self._jobs[document_id] = job.model_copy(update=changes)

    def get(self, document_id: str) -> IndexingJob | None:
        with self._lock:
            return self._jobs.get(document_id)


@lru_cache
def get_indexing_job_store() -> IndexingJobStore:
    """Return the cached, process-wide IndexingJobStore instance."""
    return IndexingJobStore()


def run_indexing_pipeline(document_id: str, filename: str, content: bytes) -> None:
    """Parse, chunk, embed, and store one uploaded PDF, entirely
    server-side. Runs as a FastAPI background task, after the upload
    request has already responded — any failure here is recorded on
    the job rather than raised, since there is no request left to
    raise it to.
    """
    jobs = get_indexing_job_store()
    settings = get_settings()
    start = time.monotonic()

    try:
        jobs.update(document_id, stage="parsing")
        parse_result = parse_pdf(content, filename)

        jobs.update(document_id, stage="chunking", page_count=parse_result.metadata.total_pages)
        chunking_result = chunk_document(
            parse_result,
            document_id,
            chunk_size=settings.chunk_size,
            chunk_overlap=settings.chunk_overlap,
        )

        jobs.update(document_id, stage="embedding", chunk_count=chunking_result.total_chunks)
        embedding_result = generate_embeddings(chunking_result)

        jobs.update(document_id, stage="storing")
        get_vector_store_service().store_embeddings(embedding_result)

        jobs.update(document_id, stage="completed", status="indexed")
        logger.info(
            "indexing completed: document_id=%s filename=%s duration_s=%.3f",
            document_id,
            filename,
            time.monotonic() - start,
        )
    except (PdfParsingError, ChunkingError, EmbeddingError, VectorStoreError) as exc:
        logger.warning(
            "indexing failed: document_id=%s filename=%s stage_error=%s", document_id, filename, exc
        )
        jobs.update(document_id, status="failed", error=str(exc))
