"""Dashboard analytics route.

Read-only surface for the real Ask AI usage stats accumulated by
app.services.analytics.analytics_service — see that module for what is
and isn't tracked, and why it's in-memory for this MVP.
"""

from fastapi import APIRouter

from app.services.analytics.analytics_service import get_analytics_service
from app.services.analytics.models import AnalyticsSnapshot

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/analytics", response_model=AnalyticsSnapshot)
def get_dashboard_analytics() -> AnalyticsSnapshot:
    return get_analytics_service().get_snapshot()
