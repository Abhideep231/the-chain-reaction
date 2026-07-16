"""Pydantic models for the engineering calculation service."""

from typing import Literal

from pydantic import BaseModel

ChainType = Literal[
    "Roller Chain", "Conveyor Chain", "Attachment Chain", "Engineering Class Chain"
]
ChainStandard = Literal["ISO 606", "ANSI B29.1"]
ShockLoad = Literal["None", "Moderate", "Heavy"]
LubricationType = Literal["Manual", "Drip", "Oil Bath", "Forced Circulation"]
DutyCycle = Literal["Continuous", "Intermittent", "Occasional"]
ResultStatus = Literal["good", "warning", "critical"]


class ChainSelectionInput(BaseModel):
    chain_type: ChainType
    chain_standard: ChainStandard
    pitch: float
    number_of_teeth: int
    driver_rpm: float
    driven_rpm: float
    power_kw: float
    torque: float
    service_factor: float
    shock_load: ShockLoad
    temperature: float
    lubrication: LubricationType
    operating_hours: float
    duty_cycle: DutyCycle


class ResultCard(BaseModel):
    id: str
    title: str
    value: str
    unit: str | None = None
    status: ResultStatus


class Recommendation(BaseModel):
    chain_id: str
    chain_label: str
    reason: str
    expected_life_label: str
    explanation: list[str]


class ChainSelectionResult(BaseModel):
    result_cards: list[ResultCard]
    recommendation: Recommendation
