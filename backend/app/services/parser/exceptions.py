"""Exceptions raised by the PDF parser service.

Kept distinct from request-validation failures (missing filename, wrong
extension, oversized upload), which are rejected by the route before a
document ever reaches this service. These represent failures that can
only be discovered by actually attempting to open/read the PDF.
"""


class PdfParsingError(Exception):
    """Base class for all PDF parsing failures."""


class CorruptedPdfError(PdfParsingError):
    """The file could not be opened as a valid PDF document."""


class EncryptedPdfError(PdfParsingError):
    """The PDF requires a password to read its contents."""


class EmptyPdfError(PdfParsingError):
    """The PDF opened successfully but contains zero pages."""
