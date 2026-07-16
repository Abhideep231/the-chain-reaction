"""Calculations route.

Runs the deterministic calculation engine
(`app.services.calculations.chain_selection`) and, if Claude is
configured, asks it to explain the already-computed result. Claude
never calculates anything here — see
`app.services.claude.claude_service.explain_calculation`.
"""

from fastapi import APIRouter, HTTPException, status

from app.core.logging import get_logger
from app.schemas.calculations import CalculationRequest, CalculationResponse
from app.services.calculations.chain_selection import calculate_chain_selection
from app.services.calculations.exceptions import CalculationError, InvalidCalculationInputError
from app.services.claude.claude_service import explain_calculation
from app.services.claude.exceptions import ClaudeError

router = APIRouter(tags=["calculations"])
logger = get_logger(__name__)

CALCULATION_ERROR_STATUS: dict[type[CalculationError], int] = {
    InvalidCalculationInputError: status.HTTP_422_UNPROCESSABLE_ENTITY,
}


@router.post("/calculations", response_model=CalculationResponse)
def post_calculation(request: CalculationRequest) -> CalculationResponse:
    try:
        result = calculate_chain_selection(request.inputs)
    except CalculationError as exc:
        status_code = CALCULATION_ERROR_STATUS.get(
            type(exc), status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        raise HTTPException(status_code, str(exc)) from exc

    # The explanation is explicitly optional (see CalculationResponse):
    # a missing API key or a provider-side failure means no explanation
    # is returned, never a failed calculation — the result above is
    # already correct and complete on its own.
    explanation: str | None = None
    try:
        explanation = explain_calculation(request.inputs, result)
    except ClaudeError as exc:
        logger.warning(
            "calculation explanation unavailable: reason=%s error=%s",
            type(exc).__name__,
            exc,
        )

    return CalculationResponse(
        calculation_type=request.calculation_type,
        result=result,
        explanation=explanation,
    )
