"""ChromaDB-backed vector store — the single source of vector
persistence for the RAG pipeline.

Wraps a `chromadb.PersistentClient` pointed at a single collection.
Every write goes through `upsert`, so re-storing a chunk_id replaces
its existing vector/metadata rather than creating a duplicate —
chunk_id is the collection's primary identifier.
"""

import time
from collections.abc import Sequence
from datetime import UTC, datetime
from functools import lru_cache
from pathlib import Path

import chromadb
from chromadb.config import Settings as ChromaSettings
from chromadb.types import Metadata

from app.core.config import get_settings
from app.core.logging import get_logger
from app.services.embeddings.models import EmbeddingResult
from app.services.vectorstore.exceptions import (
    DimensionMismatchError,
    DuplicateChunkIdError,
    EmptyEmbeddingListError,
    MissingMetadataError,
)
from app.services.vectorstore.models import (
    DeleteDocumentResult,
    QueryMatch,
    ResetDatabaseResult,
    StoredDocumentSummary,
    StoreEmbeddingsResult,
    VectorStoreStatus,
)

logger = get_logger(__name__)

COLLECTION_NAME = "chain_reaction_documents"


def _metadata_int(value: object) -> int:
    """Safely coerce a ChromaDB metadata value to int, defaulting to 0
    for anything that isn't already a plain number.
    """
    if isinstance(value, int) and not isinstance(value, bool):
        return value
    if isinstance(value, float):
        return int(value)
    return 0


class VectorStoreService:
    """Owns one ChromaDB collection at a fixed on-disk path."""

    def __init__(self, db_path: str | None = None, collection_name: str = COLLECTION_NAME) -> None:
        settings = get_settings()
        self.db_path = db_path or settings.vector_db_path
        self.collection_name = collection_name
        Path(self.db_path).mkdir(parents=True, exist_ok=True)
        self._client = chromadb.PersistentClient(
            path=self.db_path, settings=ChromaSettings(allow_reset=True)
        )

    def collection_exists(self) -> bool:
        return any(c.name == self.collection_name for c in self._client.list_collections())

    def create_collection(
        self, embedding_model: str, vector_dimension: int
    ) -> chromadb.Collection:
        """Get-or-create the collection, tagging it with the given
        embedding model/dimension only if it doesn't already exist —
        an existing collection's metadata is never overwritten.

        `hnsw:space` is fixed to cosine distance at creation time (it
        cannot be changed afterward): cosine similarity is the standard,
        documented comparison metric for OpenAI's embedding models, and
        is what makes `query_similar`'s similarity_score meaningful.
        """
        existed = self.collection_exists()
        collection = self._client.get_or_create_collection(
            name=self.collection_name,
            metadata={
                "embedding_model": embedding_model,
                "vector_dimension": vector_dimension,
                "created_at": datetime.now(UTC).isoformat(),
                "hnsw:space": "cosine",
            },
        )
        if existed:
            logger.info("collection reused: name=%s", self.collection_name)
        else:
            logger.info(
                "collection created: name=%s embedding_model=%s vector_dimension=%d",
                self.collection_name,
                embedding_model,
                vector_dimension,
            )
        return collection

    def get_embedding_count(self) -> int:
        if not self.collection_exists():
            return 0
        return self._client.get_collection(name=self.collection_name).count()

    def store_embeddings(self, embedding_result: EmbeddingResult) -> StoreEmbeddingsResult:
        """Upsert every embedding, keyed by chunk_id, into the collection.

        Raises:
            EmptyEmbeddingListError: `embedding_result.embeddings` is empty.
            DuplicateChunkIdError: the same chunk_id appears twice in this request.
            MissingMetadataError: an embedding is missing required identifying fields.
            DimensionMismatchError: a declared dimension doesn't match its vector,
                or embeddings in the same request disagree on dimension.
        """
        if not embedding_result.embeddings:
            raise EmptyEmbeddingListError("Cannot store an empty embedding list.")

        chunk_ids = [e.chunk_id for e in embedding_result.embeddings]
        seen: set[str] = set()
        for chunk_id in chunk_ids:
            if chunk_id in seen:
                raise DuplicateChunkIdError(
                    f"Duplicate chunk_id '{chunk_id}' within the same request."
                )
            seen.add(chunk_id)

        for embedding in embedding_result.embeddings:
            if not embedding.document_id or not embedding.chunk_id or not embedding.filename:
                raise MissingMetadataError(
                    f"Embedding '{embedding.embedding_id}' is missing required metadata."
                )
            if len(embedding.embedding) != embedding.vector_dimension:
                raise DimensionMismatchError(
                    f"Embedding '{embedding.embedding_id}' declares vector_dimension="
                    f"{embedding.vector_dimension} but has {len(embedding.embedding)} values."
                )

        dimensions = {e.vector_dimension for e in embedding_result.embeddings}
        if len(dimensions) > 1:
            raise DimensionMismatchError(
                f"Mixed vector dimensions in the same request: {sorted(dimensions)}."
            )

        logger.info("storage started: total_vectors=%d", len(embedding_result.embeddings))
        start = time.monotonic()

        collection = self.create_collection(
            embedding_result.embedding_model, embedding_result.vector_dimension
        )
        vectors: list[Sequence[float]] = [e.embedding for e in embedding_result.embeddings]
        collection.upsert(
            ids=chunk_ids,
            embeddings=vectors,
            metadatas=[
                {
                    "document_id": e.document_id,
                    "chunk_id": e.chunk_id,
                    "chunk_index": e.chunk_index,
                    "filename": e.filename,
                    "page_number": e.page_number,
                    "embedding_model": e.embedding_model,
                    "vector_dimension": e.vector_dimension,
                    "created_at": e.created_at.isoformat(),
                }
                for e in embedding_result.embeddings
            ],
            documents=[e.chunk_text for e in embedding_result.embeddings],
        )

        duration = time.monotonic() - start
        logger.info(
            "storage completed: stored_vectors=%d collection=%s duration_s=%.3f",
            len(embedding_result.embeddings),
            self.collection_name,
            duration,
        )
        return StoreEmbeddingsResult(
            stored_vectors=len(embedding_result.embeddings),
            collection_name=self.collection_name,
            database_path=self.db_path,
        )

    def list_documents(self) -> list[StoredDocumentSummary]:
        """Aggregate every stored chunk into one summary per document_id
        — the Knowledge Library's real, canonical document list (Sprint
        20). A document only appears here once it has been fully
        stored; nothing midway through upload/chunk/embed is included,
        since that data doesn't exist in the collection yet.

        Returns an empty list if the collection doesn't exist yet —
        not an error, same convention as `query_similar`.
        """
        if not self.collection_exists():
            return []
        collection = self._client.get_collection(name=self.collection_name)
        if collection.count() == 0:
            return []

        metadatas = collection.get(include=["metadatas"])["metadatas"] or []
        grouped: dict[str, list[Metadata]] = {}
        for metadata in metadatas:
            document_id = str(metadata.get("document_id", ""))
            if not document_id:
                continue
            grouped.setdefault(document_id, []).append(metadata)

        summaries = [
            StoredDocumentSummary(
                document_id=document_id,
                filename=str(chunks[0].get("filename", "")),
                chunk_count=len(chunks),
                page_count=max(_metadata_int(chunk.get("page_number")) for chunk in chunks),
                embedding_model=str(chunks[0].get("embedding_model", "")),
                first_stored_at=min(
                    datetime.fromisoformat(str(chunk.get("created_at"))) for chunk in chunks
                ),
            )
            for document_id, chunks in grouped.items()
        ]
        logger.info("documents listed: total=%d", len(summaries))
        return summaries

    def delete_document_embeddings(self, document_id: str) -> DeleteDocumentResult:
        if not self.collection_exists():
            return DeleteDocumentResult(document_id=document_id, deleted_count=0)
        collection = self._client.get_collection(name=self.collection_name)
        result = collection.delete(where={"document_id": document_id})
        deleted_count = result["deleted"]
        logger.info(
            "document deleted: document_id=%s deleted_count=%d", document_id, deleted_count
        )
        return DeleteDocumentResult(document_id=document_id, deleted_count=deleted_count)

    def reset_database(self) -> ResetDatabaseResult:
        self._client.reset()
        logger.info("database reset: collection=%s", self.collection_name)
        return ResetDatabaseResult(status="reset", collection_name=self.collection_name)

    def health_check(self) -> str:
        try:
            self._client.heartbeat()
        except Exception:
            return "unhealthy"
        return "ok"

    def get_status(self) -> VectorStoreStatus:
        exists = self.collection_exists()
        total_vectors = 0
        embedding_model: str | None = None
        vector_dimension: int | None = None
        if exists:
            collection = self._client.get_collection(name=self.collection_name)
            total_vectors = collection.count()
            metadata = collection.metadata or {}
            raw_model = metadata.get("embedding_model")
            raw_dimension = metadata.get("vector_dimension")
            embedding_model = raw_model if isinstance(raw_model, str) else None
            vector_dimension = raw_dimension if isinstance(raw_dimension, int) else None
        return VectorStoreStatus(
            collection_exists=exists,
            collection_name=self.collection_name,
            total_vectors=total_vectors,
            embedding_model=embedding_model,
            vector_dimension=vector_dimension,
            database_path=self.db_path,
            health=self.health_check(),
        )

    def query_similar(self, query_embedding: Sequence[float], top_k: int) -> list[QueryMatch]:
        """Return up to `top_k` nearest-neighbor matches for
        `query_embedding`, ordered most similar first.

        Returns an empty list if the collection doesn't exist yet
        (nothing has ever been stored) — this is a valid, non-exceptional
        state, not an error. `top_k` larger than the collection size is
        handled gracefully by ChromaDB itself (returns however many
        vectors exist).
        """
        if not self.collection_exists():
            return []

        collection = self._client.get_collection(name=self.collection_name)
        query_vector: list[Sequence[float]] = [list(query_embedding)]
        result = collection.query(
            query_embeddings=query_vector,
            n_results=top_k,
            include=["metadatas", "documents", "distances"],
        )

        ids = result["ids"][0]
        distances = result["distances"][0] if result["distances"] is not None else []
        metadatas = result["metadatas"][0] if result["metadatas"] is not None else []
        documents = result["documents"][0] if result["documents"] is not None else []

        matches: list[QueryMatch] = []
        for chunk_id, distance, metadata, document in zip(
            ids, distances, metadatas, documents, strict=True
        ):
            matches.append(
                QueryMatch(
                    chunk_id=chunk_id,
                    document_id=str(metadata.get("document_id", "")),
                    chunk_index=_metadata_int(metadata.get("chunk_index")),
                    page_number=_metadata_int(metadata.get("page_number")),
                    filename=str(metadata.get("filename", "")),
                    chunk_text=document or "",
                    embedding_model=str(metadata.get("embedding_model", "")),
                    vector_dimension=_metadata_int(metadata.get("vector_dimension")),
                    created_at=datetime.fromisoformat(str(metadata.get("created_at"))),
                    distance=distance,
                    # The collection is created with hnsw:space=cosine, so
                    # `distance` is cosine distance (1 - cosine similarity).
                    similarity_score=1.0 - distance,
                )
            )
        return matches


@lru_cache
def get_vector_store_service() -> VectorStoreService:
    """Return the cached, process-wide VectorStoreService instance."""
    return VectorStoreService()
