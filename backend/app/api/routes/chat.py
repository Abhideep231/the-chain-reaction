"""Chat routes.

POST /chat remains a placeholder (no conversation memory implemented —
this sprint's RAG integration is single-turn only, at /chat/ask).
POST /chat/ask runs single-turn RAG: retrieval + Claude, via the
Claude integration service.
"""

import uuid

from fastapi import APIRouter, HTTPException, status

from app.api.routes.documents import EMBEDDING_ERROR_STATUS, RETRIEVAL_ERROR_STATUS
from app.schemas.chat import AskRequest, ChatRequest, ChatResponse
from app.services.claude.claude_service import ask
from app.services.claude.exceptions import (
    ClaudeApiError,
    ClaudeAuthenticationError,
    ClaudeError,
    ClaudeRateLimitError,
    ClaudeTimeoutError,
    EmptyRetrievalError,
    MissingApiKeyError,
    PromptTooLargeError,
)
from app.services.claude.models import AskResponse
from app.services.conversation.exceptions import ConversationError, InvalidSessionIdError
from app.services.embeddings.exceptions import EmbeddingError
from app.services.retrieval.exceptions import RetrievalError

CLAUDE_ERROR_STATUS: dict[type[ClaudeError], int] = {
    EmptyRetrievalError: status.HTTP_404_NOT_FOUND,
    MissingApiKeyError: status.HTTP_500_INTERNAL_SERVER_ERROR,
    ClaudeAuthenticationError: status.HTTP_500_INTERNAL_SERVER_ERROR,
    ClaudeRateLimitError: status.HTTP_429_TOO_MANY_REQUESTS,
    ClaudeTimeoutError: status.HTTP_504_GATEWAY_TIMEOUT,
    PromptTooLargeError: status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
    ClaudeApiError: status.HTTP_502_BAD_GATEWAY,
}

CONVERSATION_ERROR_STATUS: dict[type[ConversationError], int] = {
    InvalidSessionIdError: status.HTTP_422_UNPROCESSABLE_ENTITY,
}

router = APIRouter(tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
def post_chat(request: ChatRequest) -> ChatResponse:
    return ChatResponse(
        conversation_id=request.conversation_id or str(uuid.uuid4()),
        reply=(
            "This is a placeholder response. Chat functionality will be "
            "implemented in a future sprint."
        ),
        citations=[],
        confidence=None,
    )


@router.post("/chat/ask", response_model=AskResponse)
def ask_question(request: AskRequest) -> AskResponse:
    try:
        return ask(request.question, session_id=request.session_id)
    except ConversationError as exc:
        status_code = CONVERSATION_ERROR_STATUS.get(
            type(exc), status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        raise HTTPException(status_code, str(exc)) from exc
    except ClaudeError as exc:
        status_code = CLAUDE_ERROR_STATUS.get(type(exc), status.HTTP_500_INTERNAL_SERVER_ERROR)
        raise HTTPException(status_code, str(exc)) from exc
    except RetrievalError as exc:
        status_code = RETRIEVAL_ERROR_STATUS.get(
            type(exc), status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        raise HTTPException(status_code, str(exc)) from exc
    except EmbeddingError as exc:
        status_code = EMBEDDING_ERROR_STATUS.get(
            type(exc), status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        raise HTTPException(status_code, str(exc)) from exc
