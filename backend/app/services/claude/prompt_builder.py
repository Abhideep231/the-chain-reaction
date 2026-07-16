"""Builds the system and user prompts sent to Claude for single-turn RAG.

Pure string formatting only — no API calls, no business logic beyond
shaping retrieved chunks into the context block Claude reads.
"""

from app.services.retrieval.models import RetrievalResult

SYSTEM_PROMPT = (
    "You are a technical assistant for The Chain Reaction, an engineering "
    "document intelligence platform. Answer the user's question using ONLY "
    "the information in the document excerpts supplied below.\n\n"
    "Rules:\n"
    "- Answer strictly from the supplied context. Never use external or "
    "prior knowledge.\n"
    "- Never hallucinate. Never invent, estimate, or infer engineering "
    "values, specifications, measurements, or facts that are not "
    "explicitly stated in the context.\n"
    "- If the supplied context does not contain enough information to "
    "answer the question, respond with exactly this sentence and nothing "
    "else: \"The uploaded documents do not contain enough information to "
    "answer this question.\"\n"
    "- Always remain technical and precise."
)


def build_context(results: list[RetrievalResult]) -> str:
    """Format retrieved chunks into the context block sent to Claude, one
    `Document / Page / Chunk / Content` section per chunk.
    """
    sections = [
        f"Document: {result.metadata.filename}\n"
        f"Page: {result.page_number}\n"
        f"Chunk: {result.chunk_id}\n\n"
        f"Content:\n{result.chunk_text}"
        for result in results
    ]
    return "\n\n---\n\n".join(sections)


def build_user_message(question: str, results: list[RetrievalResult]) -> str:
    """Build the full user message: retrieved context followed by the
    question.
    """
    context = build_context(results)
    return f"Context:\n\n{context}\n\n---\n\nQuestion: {question}"
