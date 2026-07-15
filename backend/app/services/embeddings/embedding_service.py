"""Embedding generation service — the single source of embedding
creation for the RAG pipeline.

Consumes the Chunk objects produced by the chunker (Sprint 11) and
calls the OpenAI embeddings API to generate a vector for each one.
Embeddings are returned in memory only; persistence is a future
sprint's concern.
"""

import time
import uuid
from datetime import UTC, datetime

from openai import (
    APIError,
    APITimeoutError,
    AuthenticationError,
    BadRequestError,
    OpenAI,
    RateLimitError,
)

from app.core.config import get_settings
from app.core.logging import get_logger
from app.services.chunker.models import ChunkingResult
from app.services.embeddings.exceptions import (
    EmbeddingApiError,
    EmbeddingAuthenticationError,
    EmbeddingRateLimitError,
    EmbeddingTimeoutError,
    EmptyChunkListError,
    InvalidChunkDataError,
    InvalidModelError,
    MissingApiKeyError,
)
from app.services.embeddings.models import Embedding, EmbeddingResult

logger = get_logger(__name__)

DEFAULT_EMBEDDING_MODEL = "text-embedding-3-large"

# Chunks per OpenAI request. Comfortably under the API's per-request
# input-count limit; batching keeps a large document to a handful of
# requests instead of one per chunk.
_BATCH_SIZE = 100


def generate_embeddings(
    chunking_result: ChunkingResult,
    model: str | None = None,
    client: OpenAI | None = None,
) -> EmbeddingResult:
    """Generate an embedding for every chunk in `chunking_result`.

    `client` is injectable so callers (and tests) can supply a
    pre-configured or fake OpenAI client instead of one built from
    settings — the service never reads a global client singleton.

    Raises:
        EmptyChunkListError: `chunking_result.chunks` is empty.
        InvalidChunkDataError: a chunk has no text to embed.
        MissingApiKeyError: no client was given and OPENAI_API_KEY is unset.
        InvalidModelError: the provider rejected the embedding model.
        EmbeddingAuthenticationError: the provider rejected the API key.
        EmbeddingRateLimitError: the provider's rate limit was exceeded.
        EmbeddingTimeoutError: the request to the provider timed out.
        EmbeddingApiError: any other provider-side failure.
    """
    settings = get_settings()
    embedding_model = model or settings.embedding_model

    if not chunking_result.chunks:
        raise EmptyChunkListError("Cannot generate embeddings for an empty chunk list.")

    for chunk in chunking_result.chunks:
        if not chunk.text.strip():
            raise InvalidChunkDataError(f"Chunk '{chunk.chunk_id}' has no text to embed.")

    logger.info(
        "embedding started: total_chunks=%d model=%s",
        len(chunking_result.chunks),
        embedding_model,
    )
    start = time.monotonic()

    if client is None:
        if not settings.openai_api_key:
            raise MissingApiKeyError(
                "OPENAI_API_KEY is not configured; embedding generation requires it."
            )
        client = OpenAI(api_key=settings.openai_api_key)

    vectors: list[list[float]] = []
    for batch_start in range(0, len(chunking_result.chunks), _BATCH_SIZE):
        batch = chunking_result.chunks[batch_start : batch_start + _BATCH_SIZE]
        texts = [chunk.text for chunk in batch]
        try:
            response = client.embeddings.create(model=embedding_model, input=texts)
        except RateLimitError as exc:
            logger.warning("embedding failed: reason=rate_limited error=%s", exc)
            raise EmbeddingRateLimitError(
                "OpenAI rate limit exceeded while generating embeddings."
            ) from exc
        except APITimeoutError as exc:
            logger.warning("embedding failed: reason=timeout error=%s", exc)
            raise EmbeddingTimeoutError("The embedding request to OpenAI timed out.") from exc
        except AuthenticationError as exc:
            logger.warning("embedding failed: reason=authentication error=%s", exc)
            raise EmbeddingAuthenticationError(
                "OpenAI rejected the configured API key."
            ) from exc
        except BadRequestError as exc:
            logger.warning("embedding failed: reason=invalid_model error=%s", exc)
            raise InvalidModelError(
                f"'{embedding_model}' was rejected by OpenAI as an invalid embedding model."
            ) from exc
        except APIError as exc:
            logger.warning("embedding failed: reason=api_error error=%s", exc)
            raise EmbeddingApiError(f"OpenAI API error: {exc}") from exc

        ordered = sorted(response.data, key=lambda item: item.index)
        vectors.extend(item.embedding for item in ordered)

    vector_dimension = len(vectors[0]) if vectors else 0
    created_at = datetime.now(UTC)
    embeddings = [
        Embedding(
            embedding_id=str(uuid.uuid4()),
            document_id=chunk.document_id,
            chunk_id=chunk.chunk_id,
            chunk_index=chunk.chunk_index,
            embedding_model=embedding_model,
            vector_dimension=vector_dimension,
            embedding=vector,
            created_at=created_at,
        )
        for chunk, vector in zip(chunking_result.chunks, vectors, strict=True)
    ]

    duration = time.monotonic() - start
    logger.info(
        "embedding completed: total_embeddings=%d model=%s vector_dimension=%d duration_s=%.3f",
        len(embeddings),
        embedding_model,
        vector_dimension,
        duration,
    )
    return EmbeddingResult(
        total_embeddings=len(embeddings),
        embedding_model=embedding_model,
        vector_dimension=vector_dimension,
        embeddings=embeddings,
    )
