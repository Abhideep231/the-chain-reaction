"""Chat (Ask AI) route.

Placeholder only — no LLM, retrieval, or Claude API integration. Those
are implemented in a future sprint.
"""

import uuid

from fastapi import APIRouter

from app.schemas.chat import ChatRequest, ChatResponse

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
