"""End-to-end RAG pipeline diagnostic.

Traces every stage against the real, currently-configured backend —
real uploaded PDFs on disk, the real ChromaDB collection, real OpenAI
embeddings, and a real Claude call — so a "no relevant information"
answer can be root-caused from actual evidence instead of guesswork.

Usage (inside the backend's venv or container):

    python scripts/diagnose_rag.py "What is 16B-2 chain?"

Run from the `backend/` directory (or with it on PYTHONPATH) so the
`app` package resolves the same way the server itself imports it.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.config import get_settings
from app.services.claude.claude_service import ask
from app.services.claude.prompt_builder import SYSTEM_PROMPT, build_user_message
from app.services.parser.pdf_parser import parse_pdf
from app.services.retrieval.models import RetrievalResponse
from app.services.retrieval.retrieval_service import retrieve
from app.services.vectorstore.vector_store import get_vector_store_service


def section(title: str) -> None:
    print(f"\n{'=' * 70}\n{title}\n{'=' * 70}")


def step1_uploaded_files() -> None:
    section("STEP 1: PDF UPLOAD — files on disk")
    settings = get_settings()
    upload_dir = Path(settings.upload_dir)
    print(f"UPLOAD_DIR: {upload_dir}")
    if not upload_dir.exists():
        print("Directory does not exist — nothing has ever been uploaded.")
        return
    files = sorted(upload_dir.glob("*.pdf"))
    if not files:
        print("Directory exists but contains no PDFs.")
        return
    for f in files:
        print(f"  {f.name}  ({f.stat().st_size:,} bytes)")


def step2_parsing() -> None:
    section("STEP 2: PDF PARSING — re-parse every stored file")
    settings = get_settings()
    upload_dir = Path(settings.upload_dir)
    if not upload_dir.exists():
        return
    for f in sorted(upload_dir.glob("*.pdf")):
        try:
            result = parse_pdf(f.read_bytes(), f.name)
        except Exception as exc:  # noqa: BLE001 - diagnostic script, report and continue
            print(f"{f.name}: FAILED TO PARSE — {exc}")
            continue
        print(f"\n{f.name}: {result.metadata.total_pages} page(s)")
        for page in result.pages:
            flag = "EMPTY" if not page.extracted_text.strip() else "ok"
            print(f"  page {page.page_number}: {page.character_count} chars [{flag}]")
        first_page_text = result.pages[0].extracted_text[:500] if result.pages else ""
        print(f"  first page text (first 500 chars):\n  {first_page_text!r}")


def step3_to_5_vector_store() -> None:
    section("STEP 3-5: CHROMADB — real collection contents")
    store = get_vector_store_service()
    status = store.get_status()
    print(f"database_path: {status.database_path}")
    print(f"collection_exists: {status.collection_exists}")
    print(f"collection_name: {status.collection_name}")
    print(f"total_vectors: {status.total_vectors}")
    print(f"embedding_model: {status.embedding_model}")
    print(f"vector_dimension: {status.vector_dimension}")
    print(f"health: {status.health}")

    if not status.collection_exists or status.total_vectors == 0:
        print("\nCollection is empty — no document has ever been fully embedded")
        print("and stored (upload/parse succeeding is not enough; chunk +")
        print("embed + store must all have completed for a document to")
        print("appear here).")
        return

    print("\nPer-document summary (chunk count derived from real stored metadata):")
    for doc in store.list_documents():
        print(
            f"  {doc.filename}  chunks={doc.chunk_count}  pages={doc.page_count}  "
            f"embedding_model={doc.embedding_model}  first_stored_at={doc.first_stored_at}"
        )

    raw = store._client.get_collection(name=store.collection_name).get(  # noqa: SLF001
        include=["metadatas", "documents"], limit=1
    )
    raw_metadatas = raw["metadatas"] or []
    raw_documents = raw["documents"] or []
    print("\nSample stored chunk (raw ChromaDB read):")
    if raw_metadatas:
        print(f"  metadata: {raw_metadatas[0]}")
    if raw_documents:
        print(f"  text: {raw_documents[0][:300]!r}")


def step6_retrieval(response: RetrievalResponse | None) -> None:
    section(f"STEP 6: RETRIEVAL — query={response.query!r}" if response else "STEP 6: RETRIEVAL")
    if response is None:
        print("Retrieval could not run — see the error above.")
        return
    if not response.results:
        print("NO CHUNKS RETRIEVED. Either the collection is empty (see Step")
        print("3-5 above) or the query could not be embedded. This is the")
        print("exact condition that makes /chat/ask return HTTP 404")
        print("EmptyRetrievalError — a DIFFERENT failure than Claude's own")
        print('"not enough information" sentence, which only happens when')
        print("chunks WERE retrieved but Claude judged them irrelevant.")
        return
    for i, result in enumerate(response.results, start=1):
        print(f"\n#{i}  similarity={result.similarity_score:.4f}")
        print(f"    document: {result.metadata.filename}")
        print(f"    page: {result.page_number}")
        print(f"    chunk_id: {result.chunk_id}")
        print(f"    text: {result.chunk_text[:300]!r}")


def step7_prompt(question: str, response: RetrievalResponse | None) -> None:
    section("STEP 7: EXACT CLAUDE PROMPT")
    if response is None:
        print("Retrieval could not run — see the error above. No prompt was built.")
        return
    print("--- system ---")
    print(SYSTEM_PROMPT)
    print("\n--- user message (retrieved context + question) ---")
    print(build_user_message(question, response.results))


def step8_full_trace(question: str) -> None:
    section(f"STEP 8: FULL TRACE — ask({question!r})")
    try:
        response = ask(question)
    except Exception as exc:  # noqa: BLE001 - diagnostic script, report the real error
        print(f"ask() raised: {type(exc).__name__}: {exc}")
        return
    print(f"answer: {response.answer}")
    print(f"confidence: {response.confidence:.4f}")
    print(f"citations: {len(response.citations)}")
    for c in response.citations:
        print(f"  - {c.filename} p.{c.page_number} (similarity={c.similarity_score:.4f})")


def main() -> None:
    question = sys.argv[1] if len(sys.argv) > 1 else "What is 16B-2 chain?"
    step1_uploaded_files()
    step2_parsing()
    step3_to_5_vector_store()

    try:
        retrieval_response: RetrievalResponse | None = retrieve(question, top_k=5)
    except Exception as exc:  # noqa: BLE001 - diagnostic script, report the real error
        print(f"\nretrieve({question!r}) raised: {type(exc).__name__}: {exc}")
        retrieval_response = None

    step6_retrieval(retrieval_response)
    step7_prompt(question, retrieval_response)
    step8_full_trace(question)


if __name__ == "__main__":
    main()
