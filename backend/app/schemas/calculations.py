"""Schemas for the calculations endpoint."""

from pydantic import BaseModel


class CalculationRequest(BaseModel):
    calculation_type: str
    inputs: dict[str, float]


class CalculationResponse(BaseModel):
    calculation_type: str
    status: str
    result: dict[str, float] | None = None
