"""Exceptions raised by the vector store service."""


class VectorStoreError(Exception):
    """Base class for all vector store failures."""


class EmptyEmbeddingListError(VectorStoreError):
    """The embedding collection to store is empty."""


class DimensionMismatchError(VectorStoreError):
    """An embedding's declared vector_dimension doesn't match its actual
    vector length, or embeddings in the same request disagree on
    dimension.
    """


class MissingMetadataError(VectorStoreError):
    """An embedding is missing required identifying metadata."""


class DuplicateChunkIdError(VectorStoreError):
    """The same chunk_id appears more than once within a single request."""
