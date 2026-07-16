"""Exceptions raised by the Claude API integration service.

Split into: a request-shape failure (no context to answer from),
configuration (missing API key), and provider failures (auth, rate
limiting, timeouts, oversized prompts, other API errors) — mirroring
the exception layering already established for the embedding and
retrieval services.
"""


class ClaudeError(Exception):
    """Base class for all Claude integration failures."""


class EmptyRetrievalError(ClaudeError):
    """No relevant document chunks were found to answer the question."""


class MissingApiKeyError(ClaudeError):
    """ANTHROPIC_API_KEY is not configured."""


class ClaudeAuthenticationError(ClaudeError):
    """The provider rejected the configured API key."""


class ClaudeRateLimitError(ClaudeError):
    """The provider's rate limit was exceeded."""


class ClaudeTimeoutError(ClaudeError):
    """The request to the provider timed out."""


class PromptTooLargeError(ClaudeError):
    """The built prompt exceeded the provider's request size limit."""


class ClaudeApiError(ClaudeError):
    """A provider-side error not covered by a more specific exception."""
