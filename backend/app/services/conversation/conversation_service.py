"""In-memory conversation history — the single source of session-scoped
chat memory for the RAG pipeline.

    Question -> Conversation Context -> Semantic Retrieval -> Claude ->
    Answer + Citations

Session-based only: history lives in a process-wide dict keyed by
session id, is never written to disk or a database, and a server
restart clears it — by design, for this sprint's MVP scope. A session
id carries no relation to user identity or authentication; it is an
opaque, client-supplied (or server-minted) string.
"""

import threading
import uuid
from collections import OrderedDict
from functools import lru_cache

from app.services.conversation.exceptions import InvalidSessionIdError
from app.services.conversation.models import ConversationTurn

# "Last 5-10 exchanges" per the MVP brief — one exchange is a user turn
# plus an assistant turn.
MAX_EXCHANGES_PER_SESSION = 8
MAX_TURNS_PER_SESSION = MAX_EXCHANGES_PER_SESSION * 2

# Most recent user questions folded into the retrieval query (see
# build_retrieval_query) so a follow-up like "What are its advantages?"
# still retrieves the right chunks, without an extra LLM call to
# rewrite the question first.
RETRIEVAL_CONTEXT_TURNS = 2

# Upper bound on distinct in-memory sessions, so an unbounded stream of
# session ids can't grow this dict forever between restarts. The least
# recently active session is evicted first.
MAX_SESSIONS = 500

_MAX_SESSION_ID_LENGTH = 100


class ConversationStore:
    """Owns one process-wide, in-memory map of session id -> turn history."""

    def __init__(self) -> None:
        self._sessions: OrderedDict[str, list[ConversationTurn]] = OrderedDict()
        self._lock = threading.Lock()

    def start_or_validate_session(self, session_id: str | None) -> str:
        """Return `session_id` unchanged if it's a reasonable identifier,
        or mint a fresh one if none was given.

        Raises:
            InvalidSessionIdError: `session_id` was supplied but is blank
                or unreasonably long.
        """
        if session_id is None:
            return str(uuid.uuid4())
        if not session_id.strip() or len(session_id) > _MAX_SESSION_ID_LENGTH:
            raise InvalidSessionIdError(
                f"session_id must be a non-empty string of at most "
                f"{_MAX_SESSION_ID_LENGTH} characters."
            )
        return session_id

    def get_history(self, session_id: str) -> list[ConversationTurn]:
        """Return a copy of `session_id`'s turn history, oldest first.
        An unseen session id has no history — this is not an error.
        """
        with self._lock:
            return list(self._sessions.get(session_id, []))

    def append_exchange(self, session_id: str, question: str, answer: str) -> None:
        """Record one user/assistant exchange and trim to the rolling window."""
        with self._lock:
            history = self._sessions.setdefault(session_id, [])
            history.append(ConversationTurn(role="user", content=question))
            history.append(ConversationTurn(role="assistant", content=answer))
            if len(history) > MAX_TURNS_PER_SESSION:
                del history[: len(history) - MAX_TURNS_PER_SESSION]

            self._sessions.move_to_end(session_id)
            while len(self._sessions) > MAX_SESSIONS:
                self._sessions.popitem(last=False)


def build_retrieval_query(history: list[ConversationTurn], question: str) -> str:
    """Fold the most recent user questions into `question` so retrieval
    still finds the right chunks for a pronoun-dependent follow-up
    ("What are its advantages?") without rewriting the question via an
    extra Claude call first.
    """
    recent_user_questions = [turn.content for turn in history if turn.role == "user"][
        -RETRIEVAL_CONTEXT_TURNS:
    ]
    if not recent_user_questions:
        return question
    return "\n".join([*recent_user_questions, question])


@lru_cache
def get_conversation_store() -> ConversationStore:
    """Return the cached, process-wide ConversationStore instance."""
    return ConversationStore()
