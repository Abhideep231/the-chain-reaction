"""Schemas for the admin status endpoint."""

from pydantic import BaseModel


class AdminStatusResponse(BaseModel):
    status: str
    app_name: str
    version: str
    environment: str
    uptime_seconds: float
