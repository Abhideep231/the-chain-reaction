"""Static project metadata shared across the application."""

APP_NAME: str = "The Chain Reaction API"
APP_DESCRIPTION: str = (
    "Backend API for The Chain Reaction — an AI-powered engineering "
    "intelligence platform."
)
API_VERSION: str = "0.1.0"

# PDF upload validation
PDF_EXTENSION: str = ".pdf"
PDF_MAGIC_BYTES: bytes = b"%PDF-"
ALLOWED_PDF_CONTENT_TYPES: frozenset[str] = frozenset({"application/pdf", "application/x-pdf"})
