"""Claude API integration service — the single source of RAG answer
generation. Single-turn only: no streaming, no conversation memory, no
prompt caching, no agent framework.

    User Question -> Query Embedding -> Semantic Retrieval ->
    Top Relevant Chunks -> Prompt Builder -> Claude API ->
    Final Answer -> Return Sources

Retrieval and query embedding are reused as-is from Sprints 12 and 14
(`app.services.retrieval.retrieval_service.retrieve`) — this module
adds only the prompt construction and Claude call on top.
"""

import time

from anthropic import (
    Anthropic,
    APIError,
    APITimeoutError,
    AuthenticationError,
    RateLimitError,
    RequestTooLargeError,
)

from app.core.config import get_settings
from app.core.logging import get_logger
from app.services.claude.exceptions import (
    ClaudeApiError,
    ClaudeAuthenticationError,
    ClaudeRateLimitError,
    ClaudeTimeoutError,
    EmptyRetrievalError,
    MissingApiKeyError,
    PromptTooLargeError,
)
from app.services.claude.models import AskResponse, Citation
from app.services.claude.prompt_builder import SYSTEM_PROMPT, build_user_message
from app.services.retrieval.retrieval_service import retrieve

logger = get_logger(__name__)

# Number of top retrieval matches used as Claude's context. Not
# user-configurable per request — this sprint is single-turn RAG with a
# fixed context window, not a tunable search API (that's /documents/retrieve).
CONTEXT_TOP_K = 5

# Sprint 17 (source citations): a citation snippet is a short preview for
# the UI, not the full retrieved chunk — this caps it well below a typical
# chunk's length (chunk_size=1000 characters, see app.core.config).
CITATION_SNIPPET_MAX_CHARS = 200


def _build_snippet(chunk_text: str) -> str:
    """Truncate a retrieved chunk down to a short citation preview."""
    stripped = chunk_text.strip()
    if len(stripped) <= CITATION_SNIPPET_MAX_CHARS:
        return stripped
    return stripped[:CITATION_SNIPPET_MAX_CHARS].rstrip() + "…"


def ask(question: str, client: Anthropic | None = None) -> AskResponse:
    """Answer `question` using single-turn RAG: retrieve relevant chunks,
    build a context-grounded prompt, and ask Claude to answer from it.

    `client` is injectable so callers (and tests) can supply a
    pre-configured or fake Anthropic client instead of one built from
    settings — the service never reads a global client singleton.

    Raises:
        EmptyRetrievalError: no relevant document chunks were found.
        MissingApiKeyError: no client was given and ANTHROPIC_API_KEY is unset.
        ClaudeAuthenticationError: the provider rejected the API key.
        ClaudeRateLimitError: the provider's rate limit was exceeded.
        ClaudeTimeoutError: the request to the provider timed out.
        PromptTooLargeError: the built prompt exceeded the provider's size limit.
        ClaudeApiError: any other provider-side failure.

    Also propagates, unwrapped, any exception raised by `retrieve()` —
    including its own EmptyQueryError/InvalidTopKError/
    VectorStoreUnavailableError and the embedding service's EmbeddingError
    subtypes — so callers get the exact same status-code mapping already
    used by /documents/retrieve and /documents/embed.
    """
    settings = get_settings()
    logger.info("question received: question=%r", question)
    start = time.monotonic()

    logger.info("retrieval started: question=%r", question)
    retrieval_response = retrieve(question, top_k=CONTEXT_TOP_K)
    logger.info("retrieval completed: results=%d", len(retrieval_response.results))

    if not retrieval_response.results:
        raise EmptyRetrievalError("No relevant document chunks were found for this question.")

    if client is None:
        if not settings.anthropic_api_key:
            raise MissingApiKeyError(
                "ANTHROPIC_API_KEY is not configured; Claude integration requires it."
            )
        client = Anthropic(api_key=settings.anthropic_api_key)

    user_message = build_user_message(question, retrieval_response.results)

    logger.info("claude request started: model=%s", settings.claude_model)
    try:
        message = client.messages.create(
            model=settings.claude_model,
            max_tokens=settings.claude_max_tokens,
            temperature=settings.claude_temperature,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_message}],
        )
    except RateLimitError as exc:
        logger.warning("claude request failed: reason=rate_limited error=%s", exc)
        raise ClaudeRateLimitError("Anthropic rate limit exceeded.") from exc
    except APITimeoutError as exc:
        logger.warning("claude request failed: reason=timeout error=%s", exc)
        raise ClaudeTimeoutError("The request to Claude timed out.") from exc
    except AuthenticationError as exc:
        logger.warning("claude request failed: reason=authentication error=%s", exc)
        raise ClaudeAuthenticationError("Anthropic rejected the configured API key.") from exc
    except RequestTooLargeError as exc:
        logger.warning("claude request failed: reason=prompt_too_large error=%s", exc)
        raise PromptTooLargeError("The built prompt exceeded Claude's request size limit.") from exc
    except APIError as exc:
        logger.warning("claude request failed: reason=api_error error=%s", exc)
        raise ClaudeApiError(f"Claude API error: {exc}") from exc

    logger.info("claude response received: stop_reason=%s", message.stop_reason)

    answer = "".join(block.text for block in message.content if block.type == "text")

    citations = [
        Citation(
            document_id=result.document_id,
            filename=result.metadata.filename,
            page_number=result.page_number,
            chunk_id=result.chunk_id,
            similarity_score=result.similarity_score,
            snippet=_build_snippet(result.chunk_text),
        )
        for result in retrieval_response.results
    ]
    # A retrieval-derived confidence proxy (the best-matching chunk's own
    # similarity score) rather than asking Claude to self-report a
    # number — an LLM-invented confidence score would itself be exactly
    # the kind of unsupported, hallucinated value this service must avoid.
    confidence = max(result.similarity_score for result in retrieval_response.results)

    duration_ms = (time.monotonic() - start) * 1000
    logger.info(
        "answer generated: question=%r citations=%d confidence=%.4f duration_ms=%.1f",
        question,
        len(citations),
        confidence,
        duration_ms,
    )
    return AskResponse(
        answer=answer,
        citations=citations,
        confidence=confidence,
        response_time_ms=duration_ms,
        model=settings.claude_model,
    )
