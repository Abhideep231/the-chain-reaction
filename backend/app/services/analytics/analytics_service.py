"""Ask AI usage analytics — the single source of real dashboard usage
statistics for the RAG chat pipeline.

In-memory only for this MVP: a server restart clears all history, the
same tradeoff already accepted by app.services.conversation's session
store. Every number is derived from an actual /chat/ask call as it
happens (see `record_exchange`'s call site in
app.services.claude.claude_service.ask) — nothing here is ever
estimated or fabricated; an unused app genuinely reports zero.

`AnalyticsService` is the only surface the rest of the app touches —
`record_exchange` from the Claude service, `get_snapshot` from the
dashboard route. Its storage is a private implementation detail, so a
later swap to a persistent database (the natural next step once this
needs to survive a restart) changes only this file, not either caller.
"""

import threading
import uuid
from collections import deque
from datetime import UTC, datetime
from functools import lru_cache

from app.services.analytics.models import AnalyticsSnapshot, ConversationExchange

# "Last 20 exchanges" per the product brief — older exchanges are
# dropped from the log, but the aggregate counters below are never
# trimmed and reflect the app's entire uptime.
MAX_RECENT_CONVERSATIONS = 20


class AnalyticsService:
    """Owns one process-wide record of real Ask AI usage."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._exchanges: deque[ConversationExchange] = deque(maxlen=MAX_RECENT_CONVERSATIONS)
        self._total_questions = 0
        self._successful_answers = 0
        self._refused_answers = 0
        self._total_response_time_ms = 0.0
        self._referenced_document_ids: set[str] = set()

    def record_exchange(
        self,
        *,
        question: str,
        answer: str,
        is_refusal: bool,
        response_time_ms: float,
        document_ids: list[str],
    ) -> None:
        """Record one real, completed /chat/ask exchange."""
        distinct_document_ids = set(document_ids)
        with self._lock:
            self._total_questions += 1
            if is_refusal:
                self._refused_answers += 1
            else:
                self._successful_answers += 1
            self._total_response_time_ms += response_time_ms
            self._referenced_document_ids.update(distinct_document_ids)
            self._exchanges.appendleft(
                ConversationExchange(
                    id=str(uuid.uuid4()),
                    question=question,
                    answer=answer,
                    status="refused" if is_refusal else "answered",
                    response_time_ms=response_time_ms,
                    documents_referenced=len(distinct_document_ids),
                    timestamp=datetime.now(UTC),
                )
            )

    def get_snapshot(self) -> AnalyticsSnapshot:
        """Return the current aggregate stats and recent exchange log."""
        with self._lock:
            average_response_time_ms = (
                self._total_response_time_ms / self._total_questions
                if self._total_questions
                else None
            )
            return AnalyticsSnapshot(
                total_questions=self._total_questions,
                successful_answers=self._successful_answers,
                refused_answers=self._refused_answers,
                average_response_time_ms=average_response_time_ms,
                documents_referenced=len(self._referenced_document_ids),
                recent_conversations=list(self._exchanges),
            )


@lru_cache
def get_analytics_service() -> AnalyticsService:
    """Return the cached, process-wide AnalyticsService instance."""
    return AnalyticsService()
