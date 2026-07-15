"""Exceptions raised by the embedding generation service.

Split into request-shape failures (empty chunk list, blank chunk text)
and provider failures (missing/invalid API key, invalid model, rate
limiting, timeouts, other OpenAI API errors) so the route can map each
to an appropriate, distinct HTTP status.
"""


class EmbeddingError(Exception):
    """Base class for all embedding generation failures."""


class EmptyChunkListError(EmbeddingError):
    """The chunk collection to embed is empty."""


class InvalidChunkDataError(EmbeddingError):
    """A chunk has no text to embed."""


class MissingApiKeyError(EmbeddingError):
    """OPENAI_API_KEY is not configured."""


class InvalidModelError(EmbeddingError):
    """The configured embedding model was rejected by the provider."""


class EmbeddingAuthenticationError(EmbeddingError):
    """The provider rejected the configured API key."""


class EmbeddingRateLimitError(EmbeddingError):
    """The provider's rate limit was exceeded."""


class EmbeddingTimeoutError(EmbeddingError):
    """The request to the provider timed out."""


class EmbeddingApiError(EmbeddingError):
    """A provider-side error not covered by a more specific exception."""
