"""Run with: .venv/bin/python -m unittest discover -s tests."""

import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from uuid import uuid4

from fastapi.testclient import TestClient

from app.api.routes import chunked_upload, documents
from app.core.config import Settings
from app.main import app


class ChunkedUploadTests(unittest.TestCase):
    def setUp(self) -> None:
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        settings = Settings(upload_dir=self.directory.name)
        for target in (chunked_upload, documents):
            mock = patch.object(target, "get_settings", return_value=settings)
            mock.start()
            self.addCleanup(mock.stop)
        store = patch.object(chunked_upload, "uploads", chunked_upload.UploadSessions())
        store.start()
        self.addCleanup(store.stop)
        pipeline = patch.object(documents, "run_indexing_pipeline")
        self.pipeline = pipeline.start()
        self.addCleanup(pipeline.stop)
        self.client = TestClient(app)
        self.upload_id = str(uuid4())
        self.addCleanup(self.close_sessions)

    def close_sessions(self) -> None:
        for session in chunked_upload.uploads.sessions.values():
            session.stream.close()

    def send(self, content: bytes, index: int, total: int):
        return self.client.post(
            "/documents/upload-chunk",
            files={"file": ("catalogue.pdf", content, "application/octet-stream")},
            data={"upload_id": self.upload_id, "chunk_index": index, "total_size": total},
        )

    def test_reassembles_and_starts_indexing_once(self) -> None:
        content = b"%PDF-" + b"x" * chunked_upload.CHUNK_BYTES
        response = self.send(content[:chunked_upload.CHUNK_BYTES], 0, len(content))
        self.assertEqual(response.status_code, 202)
        self.assertEqual(response.json(), {"status": "uploading"})
        self.pipeline.assert_not_called()
        response = self.send(content[chunked_upload.CHUNK_BYTES:], 1, len(content))
        self.assertEqual(response.status_code, 202)
        result = response.json()
        self.assertEqual(result["status"], "processing")
        saved = Path(self.directory.name, result["id"] + ".pdf")
        self.assertEqual(saved.read_bytes(), content)
        self.pipeline.assert_called_once_with(result["id"], "catalogue.pdf", content)
        self.assertFalse(chunked_upload.uploads.sessions)

    def test_accepts_exactly_25_mib(self) -> None:
        total = 25 * chunked_upload.CHUNK_BYTES
        first = b"%PDF-" + b"x" * (chunked_upload.CHUNK_BYTES - 5)
        for index in range(25):
            chunk = first if index == 0 else b"x" * chunked_upload.CHUNK_BYTES
            response = self.send(chunk, index, total)
            self.assertEqual(response.status_code, 202)
        self.assertEqual(response.json()["status"], "processing")
        self.assertEqual(len(self.pipeline.call_args.args[2]), total)

    def test_rejects_file_above_total_limit(self) -> None:
        self.assertEqual(self.send(b"%PDF-", 0, 25 * 1024 * 1024 + 1).status_code, 413)
        self.assertFalse(chunked_upload.uploads.sessions)

    def test_rejects_oversized_chunk(self) -> None:
        content = b"%PDF-" + b"x" * chunked_upload.CHUNK_BYTES
        self.assertEqual(self.send(content, 0, len(content)).status_code, 413)

    def test_rejects_invalid_pdf_and_incorrect_length(self) -> None:
        self.assertEqual(self.send(b"hello", 0, 5).status_code, 422)
        self.assertEqual(self.send(b"%PDF-", 0, 10).status_code, 422)
        self.pipeline.assert_not_called()

    def test_rejects_missing_and_duplicate_chunks(self) -> None:
        self.assertEqual(self.send(b"%PDF-", 1, 5).status_code, 409)
        chunk = b"%PDF-" + b"x" * (chunked_upload.CHUNK_BYTES - 5)
        self.assertEqual(self.send(chunk, 0, len(chunk) + 1).status_code, 202)
        self.assertEqual(self.send(chunk, 0, len(chunk) + 1).status_code, 409)
        self.assertEqual(self.send(b"x", 1, len(chunk) + 2).status_code, 409)
        self.pipeline.assert_not_called()

    def test_expired_upload_is_removed(self) -> None:
        chunk = b"%PDF-" + b"x" * (chunked_upload.CHUNK_BYTES - 5)
        self.send(chunk, 0, len(chunk) + 1)
        session = chunked_upload.uploads.sessions[next(iter(chunked_upload.uploads.sessions))]
        session.touched -= chunked_upload.SESSION_TTL_SECONDS + 1
        self.assertEqual(self.send(b"x", 1, len(chunk) + 1).status_code, 409)
        self.assertTrue(session.stream.closed)
        self.assertFalse(chunked_upload.uploads.sessions)


if __name__ == "__main__":
    unittest.main()
