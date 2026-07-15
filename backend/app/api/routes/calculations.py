"""Calculations route.

Placeholder only — no engineering formulas or calculation logic. Those
are implemented in a future sprint.
"""

from fastapi import APIRouter

from app.schemas.calculations import CalculationRequest, CalculationResponse

router = APIRouter(tags=["calculations"])


@router.post("/calculations", response_model=CalculationResponse)
def post_calculation(request: CalculationRequest) -> CalculationResponse:
    return CalculationResponse(
        calculation_type=request.calculation_type,
        status="not_implemented",
        result=None,
    )
