"""Admin status route.

Placeholder only — no real system metrics, auth, or database logic.
Those are implemented in a future sprint.
"""

import time

from fastapi import APIRouter, Request

from app.core.config import get_settings
from app.schemas.admin import AdminStatusResponse

router = APIRouter(tags=["admin"])


@router.get("/admin/status", response_model=AdminStatusResponse)
def get_admin_status(request: Request) -> AdminStatusResponse:
    settings = get_settings()
    uptime_seconds = time.monotonic() - request.app.state.start_time
    return AdminStatusResponse(
        status="ok",
        app_name=settings.app_name,
        version=settings.api_version,
        environment=settings.environment,
        uptime_seconds=round(uptime_seconds, 3),
    )
