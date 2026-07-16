"""Pydantic models for the conversation memory service."""

from typing import Literal

from pydantic import BaseModel


class ConversationTurn(BaseModel):
    """One message in a session's history — never returned by an API
    route; this is internal server state, not a response schema.
    """

    role: Literal["user", "assistant"]
    content: str
