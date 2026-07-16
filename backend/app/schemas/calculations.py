"""Schemas for the calculations endpoint.

Sprint 19 replaces the original placeholder contract
(`calculation_type: str, inputs: dict[str, float]`) — it could never
represent this domain: half of a roller chain's inputs are categorical
(chain type/standard, shock load, lubrication, duty cycle), not floats,
and the result is a structured set of labeled cards plus a
recommendation, not a flat float map. `calculation_type` is kept as a
field for continuity with the placeholder, now a closed `Literal`
rather than an arbitrary string — an unrecognized value is rejected by
Pydantic before the request ever reaches the calculation engine. When a
second calculation type is added, `inputs` becomes a discriminated
union keyed on `calculation_type`; introducing that union for a single
supported type today would be speculative, so it's deferred until a
second type actually exists.
"""

from typing import Literal

from pydantic import BaseModel

from app.services.calculations.models import ChainSelectionInput, ChainSelectionResult

CalculationType = Literal["chain_selection"]


class CalculationRequest(BaseModel):
    calculation_type: CalculationType
    inputs: ChainSelectionInput


class CalculationResponse(BaseModel):
    calculation_type: CalculationType
    result: ChainSelectionResult
    # Claude's plain-language interpretation of `result` — never used to
    # produce or alter any number in `result` itself. Optional: a missing
    # ANTHROPIC_API_KEY or a provider-side failure means no explanation,
    # not a failed calculation (see app/api/routes/calculations.py).
    explanation: str | None = None
