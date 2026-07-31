"""Pydantic models for real Ask AI usage analytics.

Every field here is populated from an actual /chat/ask call as it
happens (see app.services.analytics.analytics_service) — nothing is
estimated, sampled, or backfilled.
"""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel

ExchangeStatus = Literal["answered", "refused"]


class ConversationExchange(BaseModel):
    """One real question/answer exchange, as recorded at the moment it
    happened.
    """

    id: str
    question: str
    answer: str
    status: ExchangeStatus
    response_time_ms: float
    documents_referenced: int
    timestamp: datetime


class AnalyticsSnapshot(BaseModel):
    """Aggregate Ask AI usage, plus the most recent exchanges.

    `average_response_time_ms` is `None` rather than `0` when no
    question has ever been asked — there is no real average to report
    yet, and `0` would misleadingly read as "instant".
    """

    total_questions: int
    successful_answers: int
    refused_answers: int
    average_response_time_ms: float | None
    documents_referenced: int
    recent_conversations: list[ConversationExchange]
