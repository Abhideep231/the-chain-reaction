"""Centralized logging configuration."""

import logging
import sys

_LOG_FORMAT = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
_DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

_configured = False


def configure_logging(log_level: str = "INFO") -> None:
    """Configure the root logger with a single console handler.

    Idempotent: safe to call multiple times (e.g. once at startup and
    again in tests) without installing duplicate handlers.
    """
    global _configured

    root_logger = logging.getLogger()
    root_logger.setLevel(log_level.upper())

    if _configured:
        return

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter(fmt=_LOG_FORMAT, datefmt=_DATE_FORMAT))
    root_logger.addHandler(handler)

    _configured = True


def get_logger(name: str) -> logging.Logger:
    """Return a module-scoped logger, e.g. `get_logger(__name__)`."""
    return logging.getLogger(name)
