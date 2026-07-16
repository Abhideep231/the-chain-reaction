"""Claude API integration service — the single source of Claude answer
generation for the whole app. Two entry points share the same client
resolution and provider-error mapping:

- `ask()` — single-turn RAG Q&A, threaded with session-scoped
  conversation memory (Sprint 18): retrieval-grounded answers with
  citations. No streaming, no prompt caching, no agent framework.
- `explain_calculation()` (Sprint 19) — explains an already-computed
  engineering calculation result in plain language. Claude never
  performs, checks, or adjusts the arithmetic itself; the calculation
  engine (`app.services.calculations.chain_selection`) has already
  produced every number by the time Claude sees it.

    Question -> Conversation Context -> Query Embedding ->
    Semantic Retrieval -> Top Relevant Chunks -> Prompt Builder ->
    Claude API -> Final Answer -> Return Sources

Retrieval and query embedding are reused as-is from Sprints 12 and 14
(`app.services.retrieval.retrieval_service.retrieve`) — this module
adds only conversation memory, prompt construction, and the Claude call
on top.
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
from anthropic.types import Message, MessageParam

from app.core.config import Settings, get_settings
from app.core.logging import get_logger
from app.services.calculations.models import ChainSelectionInput, ChainSelectionResult
from app.services.claude.calculation_prompt_builder import (
    CALCULATION_EXPLANATION_SYSTEM_PROMPT,
    build_calculation_explanation_message,
)
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
from app.services.conversation.conversation_service import (
    build_retrieval_query,
    get_conversation_store,
)
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


def _resolve_client(client: Anthropic | None, settings: Settings) -> Anthropic:
    """Return `client` unchanged, or build one from settings if none
    was supplied — the one place a real network client gets created,
    shared by every entry point in this service.
    """
    if client is not None:
        return client
    if not settings.anthropic_api_key:
        raise MissingApiKeyError(
            "ANTHROPIC_API_KEY is not configured; Claude integration requires it."
        )
    return Anthropic(api_key=settings.anthropic_api_key)


def _create_message(
    client: Anthropic,
    *,
    model: str,
    max_tokens: int,
    temperature: float,
    system: str,
    messages: list[MessageParam],
) -> Message:
    """Call the Anthropic API, mapping provider errors to the domain
    exceptions shared by every Claude entry point in this service.
    """
    try:
        return client.messages.create(
            model=model,
            max_tokens=max_tokens,
            temperature=temperature,
            system=system,
            messages=messages,
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


def ask(
    question: str, session_id: str | None = None, client: Anthropic | None = None
) -> AskResponse:
    """Answer `question` using RAG grounded in the current document set,
    plus this session's recent conversation history: resolve the
    session, retrieve relevant chunks (using recent questions to
    disambiguate a pronoun-dependent follow-up), build a
    context-grounded prompt, and ask Claude to answer from it and the
    prior turns.

    `client` is injectable so callers (and tests) can supply a
    pre-configured or fake Anthropic client instead of one built from
    settings — the service never reads a global client singleton.

    Raises:
        InvalidSessionIdError: `session_id` was supplied but is blank or
            unreasonably long.
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
    store = get_conversation_store()
    resolved_session_id = store.start_or_validate_session(session_id)
    history = store.get_history(resolved_session_id)

    logger.info(
        "question received: session_id=%s question=%r history_turns=%d",
        resolved_session_id,
        question,
        len(history),
    )
    start = time.monotonic()

    retrieval_query = build_retrieval_query(history, question)
    logger.info("retrieval started: session_id=%s query=%r", resolved_session_id, retrieval_query)
    retrieval_response = retrieve(retrieval_query, top_k=CONTEXT_TOP_K)
    logger.info("retrieval completed: results=%d", len(retrieval_response.results))

    if not retrieval_response.results:
        raise EmptyRetrievalError("No relevant document chunks were found for this question.")

    client = _resolve_client(client, settings)

    user_message = build_user_message(question, retrieval_response.results)
    history_messages: list[MessageParam] = [
        {"role": turn.role, "content": turn.content} for turn in history
    ]
    messages: list[MessageParam] = [
        *history_messages,
        {"role": "user", "content": user_message},
    ]

    logger.info(
        "claude request started: model=%s session_id=%s history_turns=%d",
        settings.claude_model,
        resolved_session_id,
        len(history),
    )
    message = _create_message(
        client,
        model=settings.claude_model,
        max_tokens=settings.claude_max_tokens,
        temperature=settings.claude_temperature,
        system=SYSTEM_PROMPT,
        messages=messages,
    )
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

    store.append_exchange(resolved_session_id, question, answer)

    duration_ms = (time.monotonic() - start) * 1000
    logger.info(
        "answer generated: session_id=%s question=%r citations=%d confidence=%.4f duration_ms=%.1f",
        resolved_session_id,
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
        session_id=resolved_session_id,
        model=settings.claude_model,
    )


def explain_calculation(
    chain_input: ChainSelectionInput,
    result: ChainSelectionResult,
    client: Anthropic | None = None,
) -> str:
    """Ask Claude to explain an already-computed calculation result in
    plain engineering language. Claude receives the inputs and the
    result exactly as the calculation engine computed them — it never
    performs, checks, or adjusts any of the arithmetic itself.

    `client` is injectable, matching every other entry point in this
    service.

    Raises:
        MissingApiKeyError: no client was given and ANTHROPIC_API_KEY is unset.
        ClaudeAuthenticationError: the provider rejected the API key.
        ClaudeRateLimitError: the provider's rate limit was exceeded.
        ClaudeTimeoutError: the request to the provider timed out.
        PromptTooLargeError: the built prompt exceeded the provider's size limit.
        ClaudeApiError: any other provider-side failure.
    """
    settings = get_settings()
    client = _resolve_client(client, settings)

    user_message = build_calculation_explanation_message(chain_input, result)

    logger.info("calculation explanation request started: model=%s", settings.claude_model)
    message = _create_message(
        client,
        model=settings.claude_model,
        max_tokens=settings.claude_max_tokens,
        temperature=settings.claude_temperature,
        system=CALCULATION_EXPLANATION_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_message}],
    )
    logger.info("calculation explanation received: stop_reason=%s", message.stop_reason)

    return "".join(block.text for block in message.content if block.type == "text")
