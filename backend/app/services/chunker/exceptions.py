"""Exceptions raised by the chunking service.

These represent validation failures on the parsed-document input — a
distinct concern from the parser's own exceptions in
`app.services.parser.exceptions`, which relate to reading the raw PDF
rather than chunking already-extracted text.
"""


class ChunkingError(Exception):
    """Base class for all chunking failures."""


class EmptyDocumentError(ChunkingError):
    """The document has zero pages, or no page has any extractable text."""
