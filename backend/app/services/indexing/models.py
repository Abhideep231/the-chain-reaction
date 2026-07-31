"""State for one document's server-owned indexing job.

See app.services.indexing.indexing_service for the pipeline this
tracks — this module is data only.
"""

from typing import Literal

from pydantic import BaseModel

IndexingStage = Literal["parsing", "chunking", "embedding", "storing", "completed"]
IndexingStatus = Literal["processing", "indexed", "failed"]


class IndexingJob(BaseModel):
    """One document's progress through parse -> chunk -> embed -> store.

    `page_count`/`chunk_count` fill in as the real values become known
    (after parsing and after chunking respectively) — 0/None beforehand,
    never estimated. `error` is only set when `status` is "failed", and
    is always the real exception message from whichever stage failed.
    """

    id: str
    filename: str
    status: IndexingStatus
    stage: IndexingStage
    page_count: int | None = None
    chunk_count: int = 0
    error: str | None = None
