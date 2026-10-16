"""Unit fixtures plus optional golden checks against the user's original PDF."""

import os
import re
import tempfile
import unittest
from datetime import UTC, datetime
from pathlib import Path
from unittest.mock import patch

import fitz

from app.schemas.pdf import PdfMetadata, PdfPageContent, PdfParseResult
from app.services.chunker.chunker import chunk_document
from app.services.embeddings.models import Embedding, EmbeddingResult
from app.services.parser.pdf_parser import parse_pdf
from app.services.parser.tables import extract_table_rows
from app.services.retrieval.designations import designation_patterns
from app.services.retrieval.retrieval_service import retrieve
from app.services.vectorstore.vector_store import VectorStoreService


class TableTests(unittest.TestCase):
    def test_horizontal_headers_and_rows(self) -> None:
        with fitz.open() as doc:
            page = doc.new_page()
            page.insert_text((40, 40), "Roller chains ISO 606")
            for x in [40, 180, 320, 460]:
                page.draw_line((x, 80), (x, 170))
            for y in [80, 110, 140, 170]:
                page.draw_line((40, y), (460, y))
            for y, row in zip(
                [100, 130, 160],
                [
                    ["ISO", "Pitch (mm)", "Min strength (N)"],
                    ["16 B-1", "25.40", "60,000"],
                    ["12 B-1", "19.05", "28,900"],
                ],
                strict=True,
            ):
                for x, value in zip([45, 185, 325], row, strict=True):
                    page.insert_text((x, y), value, fontsize=10)
            rows, narrative = extract_table_rows(page)
            self.assertEqual(len(rows), 2)
            self.assertIn("Pitch (mm): 25.40", rows[0])
            self.assertIn("Min strength (N): 60,000", rows[0])
            self.assertNotIn("25.40", narrative or "")

    def test_table_row_remains_atomic(self) -> None:
        row = "Structured table row\nISO: 16 B-1\n" + "Verified unit: 123 mm\n" * 80
        parsed = PdfParseResult(
            metadata=PdfMetadata(filename="catalogue.pdf", total_pages=1),
            pages=[
                PdfPageContent(
                    page_number=1,
                    extracted_text="raw 25.40",
                    narrative_text="Roller chains",
                    table_rows=[row],
                    character_count=9,
                    word_count=2,
                )
            ],
        )
        chunks = chunk_document(parsed, "test")
        self.assertEqual(chunks.chunks[-1].text, row)
        self.assertNotIn("raw 25.40", "".join(c.text for c in chunks.chunks))

    def test_designation_variants_and_boundaries(self) -> None:
        patterns = designation_patterns("What is 16B-1?")
        for spelling in ["16 B-1", "16b–1", "16 B − 1"]:
            self.assertRegex(spelling, patterns[0])
        for wrong in ["116B-1", "16B-2", "16A-1", "16B-10"]:
            self.assertIsNone(re.search(patterns[0], wrong))
        self.assertEqual(len(designation_patterns("Compare 12B-1 and 16 B-1")), 2)
        self.assertEqual(
            designation_patterns("16B-1\nNow explain 12B-1"), designation_patterns("12B-1")
        )
        self.assertEqual(designation_patterns("What is a chain?"), [])

    def test_literal_search_works_with_real_chroma_and_preserves_scores(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            service = VectorStoreService(db_path=directory, collection_name="table_test")
            texts = [
                "Other chain narrative",
                "ISO: 16 B-1\nPitch: 25.40 mm",
                "ISO: 12 B-1\nPitch: 19.05 mm",
                "ISO: 116 B-1\nDifferent chain",
            ]
            vectors = [[1.0, 0.0], [0.1, 1.0], [0.2, 1.0], [1.0, 0.0]]
            embeddings = [
                Embedding(
                    embedding_id=str(i),
                    chunk_id=str(i),
                    document_id="catalogue",
                    chunk_index=i,
                    chunk_text=text,
                    filename="catalogue.pdf",
                    page_number=16,
                    embedding_model="test-vectors",
                    vector_dimension=2,
                    embedding=vector,
                    created_at=datetime.now(UTC),
                )
                for i, (text, vector) in enumerate(zip(texts, vectors, strict=True))
            ]
            service.store_embeddings(
                EmbeddingResult(
                    total_embeddings=4,
                    embedding_model="test-vectors",
                    vector_dimension=2,
                    embeddings=embeddings,
                )
            )
            with (
                patch(
                    "app.services.retrieval.retrieval_service.generate_query_embedding",
                    return_value=[1.0, 0.0],
                ),
                patch(
                    "app.services.retrieval.retrieval_service.get_vector_store_service",
                    return_value=service,
                ),
            ):
                result = retrieve("What is 16B-1?", top_k=2)
                self.assertEqual(result.results[0].chunk_id, "1")
                self.assertLess(result.results[0].similarity_score, 0.5)
                comparison = retrieve("Compare 12B-1 and 16B-1", top_k=2)
                self.assertEqual({r.chunk_id for r in comparison.results}, {"1", "2"})
                filtered = retrieve("16B-1", top_k=2, similarity_threshold=0.8)
                self.assertNotIn("1", [r.chunk_id for r in filtered.results])


@unittest.skipUnless(
    os.environ.get("CHAIN_CATALOGUE_PDF"), "Set CHAIN_CATALOGUE_PDF for golden PDF checks"
)
class OriginalCatalogueTests(unittest.TestCase):
    def test_original_catalogue_rows_and_variants(self) -> None:
        path = Path(os.environ["CHAIN_CATALOGUE_PDF"])
        with fitz.open(path) as document:
            for number in [16, 22, 26, 57]:
                rows, _ = extract_table_rows(document[number - 1])
                row = next(row for row in rows if "ISO: 16 B-1\n" in row)
                self.assertIn(f"PDF page {number};", row)
                if number == 16:
                    for expected in [
                        "Pitch p (mm): 25.40",
                        "Min. tensile strength FU (N): 60,000",
                        "iwis reference: M 1611*",
                        "Table section: Simplex",
                    ]:
                        self.assertIn(expected, row)
                if number == 57:
                    self.assertIn("Min. tensile strength FU (N): 40,000", row)
                    self.assertIn("CF Stainless Steel Chains", row)
            # A layout with fragmented body cells must fall back, not mislabel values.
            rows, narrative = extract_table_rows(document[43])
            self.assertEqual(rows, [])
            self.assertIsNone(narrative)

    def test_complete_pdf_parse_and_chunks(self) -> None:
        path = Path(os.environ["CHAIN_CATALOGUE_PDF"])
        parsed = parse_pdf(path.read_bytes(), path.name)
        self.assertEqual(len(parsed.pages), 148)
        chunks = chunk_document(parsed, "original-catalogue")
        row = next(
            c
            for c in chunks.chunks
            if c.page_number == 16
            and "Structured table row" in c.text
            and "ISO: 16 B-1\n" in c.text
        )
        self.assertIn("Min. tensile strength FU (N): 60,000", row.text)
        self.assertIn("Pitch p (mm): 25.40", row.text)
        self.assertEqual(row.metadata.page_number, 16)
