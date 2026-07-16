"""Semantic retrieval service — the single source of similarity search
for the RAG pipeline.

    Embedding Vector -> ChromaDB -> Similarity Search -> Top-K Results
    -> Metadata -> REST API

Embeds a natural-language query (reusing the embedding service) and
searches the existing vector store for its nearest neighbors, returning
each match's similarity score, source text, and metadata. No Claude
API, no prompt construction, no chat generation — retrieval only.
"""

import time

from app.core.logging import get_logger
from app.services.embeddings.embedding_service import generate_query_embedding
from app.services.retrieval.exceptions import (
    EmptyQueryError,
    InvalidTopKError,
    VectorStoreUnavailableError,
)
from app.services.retrieval.models import RetrievalMetadata, RetrievalResponse, RetrievalResult
from app.services.vectorstore.vector_store import get_vector_store_service

logger = get_logger(__name__)

DEFAULT_TOP_K = 5
MAX_TOP_K = 100


def retrieve(
    query: str,
    top_k: int | None = None,
    similarity_threshold: float | None = None,
) -> RetrievalResponse:
    """Run semantic retrieval for a natural-language query.

    Workflow: validate the request, embed the query (same embedding
    model used at indexing time, so the vectors are comparable),
    search the vector store for its nearest neighbors, sort by
    similarity, optionally filter by `similarity_threshold`, and
    return the results with full source metadata.

    A query that matches nothing (empty vector store, or every match
    below `similarity_threshold`) is not an error — it returns a
    `RetrievalResponse` with an empty `results` list.

    Raises:
        EmptyQueryError: `query` is blank.
        InvalidTopKError: `top_k` is not a positive integer within range.
        EmbeddingError (and subtypes): the query could not be embedded
            (missing/invalid API key, rate limit, timeout, etc.) —
            propagated as-is from the embedding service, not wrapped,
            so callers get the same granular error as /documents/embed.
        VectorStoreUnavailableError: the vector store could not be queried.
    """
    if not query.strip():
        raise EmptyQueryError("Query text must not be empty.")

    resolved_top_k = top_k if top_k is not None else DEFAULT_TOP_K
    if resolved_top_k < 1 or resolved_top_k > MAX_TOP_K:
        raise InvalidTopKError(f"top_k must be between 1 and {MAX_TOP_K}, got {resolved_top_k}.")

    logger.info("retrieval started: query=%r top_k=%d", query, resolved_top_k)
    start = time.monotonic()

    query_embedding = generate_query_embedding(query)
    logger.info("embedding generated: dimension=%d", len(query_embedding))

    logger.info("vector search started: top_k=%d", resolved_top_k)
    try:
        matches = get_vector_store_service().query_similar(query_embedding, resolved_top_k)
    except Exception as exc:
        logger.warning("retrieval failed: reason=vector_store_error error=%s", exc)
        raise VectorStoreUnavailableError(f"Vector store query failed: {exc}") from exc

    matches.sort(key=lambda match: match.similarity_score, reverse=True)

    if similarity_threshold is not None:
        matches = [match for match in matches if match.similarity_score >= similarity_threshold]

    logger.info("matches found: count=%d", len(matches))

    results = [
        RetrievalResult(
            document_id=match.document_id,
            chunk_id=match.chunk_id,
            chunk_index=match.chunk_index,
            page_number=match.page_number,
            similarity_score=match.similarity_score,
            chunk_text=match.chunk_text,
            embedding_model=match.embedding_model,
            metadata=RetrievalMetadata(filename=match.filename, created_at=match.created_at),
        )
        for match in matches
    ]

    duration = time.monotonic() - start
    logger.info(
        "retrieval completed: query=%r results=%d duration_s=%.3f",
        query,
        len(results),
        duration,
    )
    return RetrievalResponse(query=query, results=results)
