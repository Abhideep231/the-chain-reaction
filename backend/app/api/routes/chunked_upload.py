"""Receive large PDFs in 1 MiB requests through forwarded-port body limits."""

import tempfile
import threading
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Annotated, BinaryIO
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Form, HTTPException, UploadFile

from app.api.routes.documents import accept_pdf
from app.core.config import get_settings
from app.core.constants import ALLOWED_PDF_CONTENT_TYPES, PDF_MAGIC_BYTES
from app.schemas.documents import DocumentUploadAccepted

CHUNK_BYTES = 1024 * 1024
SESSION_TTL_SECONDS = 30 * 60
MAX_SESSIONS = 8
router = APIRouter(tags=["documents"])


@dataclass
class UploadSession:
    filename: str
    total_size: int
    stream: BinaryIO
    touched: float
    next_index: int = 0


class UploadSessions:
    """Bounded, ordered temporary uploads; stale sessions close on the next request.

    Temporary files are never catalogued as documents. A restart discards these
    in-flight sessions, so a client must restart an interrupted upload.
    """

    def __init__(self) -> None:
        self.lock = threading.Lock()
        self.sessions: dict[UUID, UploadSession] = {}

    def append(
        self, upload_id: UUID, index: int, filename: str, total: int, chunk: bytes
    ) -> bytes | None:
        with self.lock:
            now = time.monotonic()
            for key, stale in list(self.sessions.items()):
                if now - stale.touched > SESSION_TTL_SECONDS:
                    stale.stream.close()
                    del self.sessions[key]

            session = self.sessions.get(upload_id)
            if session is None:
                if index != 0:
                    raise HTTPException(409, "Upload expired or missing; upload the file again.")
                if not chunk.startswith(PDF_MAGIC_BYTES):
                    raise HTTPException(422, "File does not appear to be a valid PDF.")
                if len(self.sessions) >= MAX_SESSIONS:
                    raise HTTPException(429, "Too many active uploads; try again later.")
                upload_dir = Path(get_settings().upload_dir)
                upload_dir.mkdir(parents=True, exist_ok=True)
                session = UploadSession(
                    filename, total, tempfile.TemporaryFile(dir=upload_dir), now
                )
                self.sessions[upload_id] = session

            if (session.filename, session.total_size) != (filename, total):
                raise HTTPException(409, "Upload metadata does not match the first chunk.")
            if index != session.next_index:
                raise HTTPException(409, "Upload chunks must arrive in order, without duplicates.")

            remaining = total - session.stream.tell()
            if len(chunk) != min(CHUNK_BYTES, remaining):
                raise HTTPException(422, "Chunk size does not match the declared file size.")
            session.stream.write(chunk)
            session.next_index += 1
            session.touched = now
            if session.stream.tell() != total:
                return None

            try:
                session.stream.seek(0)
                return session.stream.read()
            finally:
                session.stream.close()
                del self.sessions[upload_id]


uploads = UploadSessions()


@router.post("/documents/upload-chunk", status_code=202)
async def upload_chunk(
    file: UploadFile,
    background_tasks: BackgroundTasks,
    upload_id: Annotated[UUID, Form()],
    chunk_index: Annotated[int, Form(ge=0)],
    total_size: Annotated[int, Form(gt=0)],
) -> DocumentUploadAccepted | dict[str, str]:
    filename = file.filename or ""
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(415, "Only .pdf files are accepted.")
    # Browser Blob slices use application/octet-stream rather than the PDF's MIME.
    if file.content_type not in ALLOWED_PDF_CONTENT_TYPES | {"application/octet-stream"}:
        raise HTTPException(415, "Unsupported chunk content type.")
    max_mb = get_settings().max_upload_size_mb
    if total_size > max_mb * 1024 * 1024:
        raise HTTPException(413, f"File exceeds the {max_mb}MB limit.")
    chunk = await file.read(CHUNK_BYTES + 1)
    if len(chunk) > CHUNK_BYTES:
        raise HTTPException(413, "Upload chunks must not exceed 1 MB.")
    if not chunk:
        raise HTTPException(400, "Uploaded chunk is empty.")
    content = uploads.append(upload_id, chunk_index, filename, total_size, chunk)
    if content is None:
        return {"status": "uploading"}
    return accept_pdf(content, filename, background_tasks)
