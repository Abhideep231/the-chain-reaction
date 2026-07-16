"""Exceptions raised by the semantic retrieval service.

Split into request-shape failures (empty query, invalid top_k) and
infrastructure failures (the vector store itself misbehaving). Query
embedding failures are NOT re-wrapped here — `app.services.embeddings
.exceptions.EmbeddingError` and its subtypes propagate directly, so
callers get the exact same, already-granular status-code mapping used
by `/documents/embed` (rate limit, timeout, auth, etc.) rather than a
flattened generic error.
"""


class RetrievalError(Exception):
    """Base class for all retrieval failures raised directly by this service."""


class EmptyQueryError(RetrievalError):
    """The query text is empty or whitespace-only."""


class InvalidTopKError(RetrievalError):
    """top_k is not a positive integer within the allowed range."""


class VectorStoreUnavailableError(RetrievalError):
    """The vector store could not be queried (e.g. a database error)."""
