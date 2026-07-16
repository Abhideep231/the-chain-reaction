"""Exceptions raised by the conversation memory service.

Session-scoped in-memory history only — no persistence, no user
identity. The only failure mode is a malformed session id; storing or
retrieving turns for a valid id never fails.
"""


class ConversationError(Exception):
    """Base class for all conversation memory failures."""


class InvalidSessionIdError(ConversationError):
    """The supplied session id is blank or unreasonably long."""
