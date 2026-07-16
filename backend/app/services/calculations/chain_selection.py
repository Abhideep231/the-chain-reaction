"""Deterministic roller-chain selection and service-life calculation —
the first (and, this sprint, only) engine behind `POST /calculations`.

Pure Python arithmetic only. No AI is involved anywhere in this module:
every number returned is a direct function of the caller's own inputs.
Claude is never asked to calculate anything — see
`app.services.claude.claude_service` for the separate, optional
explanation step that runs *after* this module has already produced a
result.

Ported 1:1 from the Sprint 6 frontend prototype
(`src/lib/calculation-mock.ts`) so the real engine returns exactly the
numbers the UI has shown since Sprint 6 — this sprint makes the formula
real and server-side; it does not change what it computes. Simplified,
illustrative roller-chain relationships (chain speed, tension from
power and from torque, safety factor against tensile strength, bearing
pressure, an empirical wear-life estimate) — not certification-grade
engineering, exactly as documented at the prototype's origin.
"""

import math
import time

from pydantic import BaseModel

from app.core.logging import get_logger
from app.services.calculations.exceptions import InvalidCalculationInputError
from app.services.calculations.models import (
    ChainSelectionInput,
    ChainSelectionResult,
    DutyCycle,
    LubricationType,
    Recommendation,
    ResultCard,
    ResultStatus,
    ShockLoad,
)

logger = get_logger(__name__)

MIN_ACCEPTABLE_SAFETY_FACTOR = 6.0

# Mirrors the min/max already enforced on each field's <input> in
# src/components/calculations/calculation-workspace.tsx — that UI is
# the authoritative source for this domain's valid ranges, so the
# backend validates against the exact same bounds rather than inventing
# new ones.
_INPUT_BOUNDS: dict[str, tuple[float, float]] = {
    "pitch": (4, 50),
    "number_of_teeth": (9, 120),
    "driver_rpm": (1, 10000),
    "driven_rpm": (1, 10000),
    "power_kw": (0.1, 1000),
    "torque": (0, 5000),
    "service_factor": (1, 3),
    "temperature": (-40, 200),
    "operating_hours": (1, 24),
}

_SHOCK_LOAD_ADJUSTMENT: dict[ShockLoad, float] = {
    "None": 0,
    "Moderate": 0.2,
    "Heavy": 0.4,
}

_LUBRICATION_LIFE_FACTOR: dict[LubricationType, float] = {
    "Manual": 0.7,
    "Drip": 0.9,
    "Oil Bath": 1.15,
    "Forced Circulation": 1.3,
}

_LUBRICATION_EFFICIENCY_PENALTY: dict[LubricationType, float] = {
    "Manual": 1.5,
    "Drip": 0.8,
    "Oil Bath": 0.3,
    "Forced Circulation": 0.1,
}

_DUTY_CYCLE_LIFE_FACTOR: dict[DutyCycle, float] = {
    "Continuous": 0.8,
    "Intermittent": 1.0,
    "Occasional": 1.2,
}

_DUTY_CYCLE_EFFICIENCY_PENALTY: dict[DutyCycle, float] = {
    "Continuous": 0.5,
    "Intermittent": 0.2,
    "Occasional": 0.1,
}


class _ChainSpec(BaseModel):
    """Representative ISO 606 series roller chain specs, smallest to
    largest pitch. Dimensions and tensile ratings are realistic ballpark
    figures for these chain numbers, not pulled from a certified
    standard — internal to this engine, never part of the API contract.
    """

    id: str
    label: str
    pitch_mm: float
    roller_diameter_mm: float
    inner_plate_width_mm: float
    tensile_strength_kn: float
    max_recommended_rpm: float


_CHAIN_SPECS: list[_ChainSpec] = [
    _ChainSpec(
        id="05B-1",
        label="05B-1 Roller Chain",
        pitch_mm=8.0,
        roller_diameter_mm=5.0,
        inner_plate_width_mm=3.0,
        tensile_strength_kn=4.4,
        max_recommended_rpm=2800,
    ),
    _ChainSpec(
        id="06B-1",
        label="06B-1 Roller Chain",
        pitch_mm=9.525,
        roller_diameter_mm=6.35,
        inner_plate_width_mm=5.72,
        tensile_strength_kn=8.9,
        max_recommended_rpm=2200,
    ),
    _ChainSpec(
        id="08B-1",
        label="08B-1 Roller Chain",
        pitch_mm=12.7,
        roller_diameter_mm=8.51,
        inner_plate_width_mm=7.75,
        tensile_strength_kn=17.9,
        max_recommended_rpm=1800,
    ),
    _ChainSpec(
        id="10B-1",
        label="10B-1 Roller Chain",
        pitch_mm=15.875,
        roller_diameter_mm=10.16,
        inner_plate_width_mm=9.65,
        tensile_strength_kn=22.2,
        max_recommended_rpm=1400,
    ),
    _ChainSpec(
        id="12B-1",
        label="12B-1 Roller Chain",
        pitch_mm=19.05,
        roller_diameter_mm=12.07,
        inner_plate_width_mm=11.68,
        tensile_strength_kn=29.0,
        max_recommended_rpm=1000,
    ),
]


def _validate(chain_input: ChainSelectionInput) -> None:
    """Reject missing, negative, zero, or out-of-range values.

    Categorical fields (chain type/standard, shock load, lubrication,
    duty cycle) are already restricted to a closed set of valid values
    by their `Literal` type on `ChainSelectionInput`, and a field with
    no value at all is already rejected by Pydantic before this
    function runs — so only numeric range checks remain here.

    Raises:
        InvalidCalculationInputError: a field's value falls outside its
            valid range.
    """
    for field_name, (minimum, maximum) in _INPUT_BOUNDS.items():
        value = getattr(chain_input, field_name)
        if not (minimum <= value <= maximum):
            raise InvalidCalculationInputError(
                f"{field_name} must be between {minimum} and {maximum}, got {value}."
            )


def _status_from_safety_factor(safety_factor: float) -> ResultStatus:
    if safety_factor >= MIN_ACCEPTABLE_SAFETY_FACTOR:
        return "good"
    if safety_factor >= MIN_ACCEPTABLE_SAFETY_FACTOR * 0.6:
        return "warning"
    return "critical"


def _format_number(value: float, decimals: int) -> str:
    return f"{value:,.{decimals}f}"


class _SelectedChain(BaseModel):
    spec: _ChainSpec
    chain_speed_ms: float
    required_tension_kn: float
    safety_factor: float


def _select_chain(chain_input: ChainSelectionInput) -> _SelectedChain:
    """Pick the smallest chain spec (starting from whichever is closest
    to the requested pitch, moving up in size only — never down, since
    a smaller pitch wouldn't fit the existing sprocket) that meets the
    minimum safety factor and stays within its speed rating; falls back
    to the largest available spec if none qualifies.
    """
    effective_service_factor = (
        chain_input.service_factor + _SHOCK_LOAD_ADJUSTMENT[chain_input.shock_load]
    )
    design_power_kw = chain_input.power_kw * effective_service_factor

    # Sprocket pitch diameter (mm) from pitch and tooth count, then the
    # pitch-circle radius in meters — the standard relation for chain
    # sprockets: PD = pitch / sin(pi / N).
    pitch_diameter_mm = chain_input.pitch / math.sin(math.pi / chain_input.number_of_teeth)
    pitch_radius_m = pitch_diameter_mm / 2 / 1000

    start_index = min(
        range(len(_CHAIN_SPECS)),
        key=lambda i: abs(_CHAIN_SPECS[i].pitch_mm - chain_input.pitch),
    )

    selected = _CHAIN_SPECS[-1]
    chain_speed_ms = 0.0
    required_tension_kn = 0.0
    safety_factor = 0.0

    for spec in _CHAIN_SPECS[start_index:]:
        chain_speed_ms = (
            spec.pitch_mm * chain_input.number_of_teeth * chain_input.driver_rpm
        ) / 60000

        required_tension_from_power_kn = design_power_kw / chain_speed_ms
        required_tension_from_torque_kn = (
            (chain_input.torque * effective_service_factor) / pitch_radius_m / 1000
        )
        required_tension_kn = max(required_tension_from_power_kn, required_tension_from_torque_kn)

        safety_factor = spec.tensile_strength_kn / required_tension_kn

        selected = spec
        within_speed_limit = chain_input.driver_rpm <= spec.max_recommended_rpm
        if safety_factor >= MIN_ACCEPTABLE_SAFETY_FACTOR and within_speed_limit:
            break

    return _SelectedChain(
        spec=selected,
        chain_speed_ms=chain_speed_ms,
        required_tension_kn=required_tension_kn,
        safety_factor=safety_factor,
    )


def calculate_chain_selection(chain_input: ChainSelectionInput) -> ChainSelectionResult:
    """Select a roller chain for the given drive conditions and
    estimate its bearing pressure, efficiency, and service life.

    Raises:
        InvalidCalculationInputError: a field's value is missing (via
            Pydantic, before this function runs) or out of its valid
            range (see `_validate`).
    """
    logger.info(
        "calculation started: type=chain_selection pitch=%s number_of_teeth=%d driver_rpm=%s",
        chain_input.pitch,
        chain_input.number_of_teeth,
        chain_input.driver_rpm,
    )
    start = time.monotonic()

    _validate(chain_input)

    selected = _select_chain(chain_input)
    spec = selected.spec
    chain_speed_ms = selected.chain_speed_ms
    required_tension_kn = selected.required_tension_kn
    safety_factor = selected.safety_factor

    # Bearing pressure: chain tension over the roller's projected
    # bearing area (roller diameter x inner plate width) — the
    # standard chain bearing-pressure check.
    bearing_pressure_mpa = (required_tension_kn * 1000) / (
        spec.roller_diameter_mm * spec.inner_plate_width_mm
    )

    speed_headroom = spec.max_recommended_rpm / chain_input.driver_rpm
    speed_penalty = 1.0 if speed_headroom < 1.2 else 0.3
    if chain_input.temperature > 60 or chain_input.temperature < -10:
        temperature_penalty = 1.0
    elif chain_input.temperature > 40:
        temperature_penalty = 0.5
    else:
        temperature_penalty = 0.2

    efficiency_percent = min(
        99.5,
        max(
            90.0,
            99.0
            - speed_penalty
            - _LUBRICATION_EFFICIENCY_PENALTY[chain_input.lubrication]
            - temperature_penalty
            - _DUTY_CYCLE_EFFICIENCY_PENALTY[chain_input.duty_cycle],
        ),
    )

    if chain_input.temperature > 60 or chain_input.temperature < -10:
        temperature_life_factor = 0.5
    elif chain_input.temperature > 40:
        temperature_life_factor = 0.75
    else:
        temperature_life_factor = 1.0

    base_life_hours = 15000
    life_hours = round(
        min(
            60000,
            max(
                500,
                base_life_hours
                * (safety_factor / MIN_ACCEPTABLE_SAFETY_FACTOR) ** 1.5
                * _LUBRICATION_LIFE_FACTOR[chain_input.lubrication]
                * temperature_life_factor
                * _DUTY_CYCLE_LIFE_FACTOR[chain_input.duty_cycle],
            ),
        )
    )

    approx_years = life_hours / (chain_input.operating_hours * 365)

    chain_speed_status: ResultStatus = "warning" if speed_headroom < 1.1 else "good"

    # Allowable bearing pressure derates with speed, same shape as a
    # real manufacturer chain rating chart — a flat MPa threshold would
    # flag a slow, lightly loaded chain the same as a fast, heavily
    # loaded one.
    allowable_bearing_pressure_mpa = max(8.0, 46 - chain_speed_ms * 1.2)
    if bearing_pressure_mpa > allowable_bearing_pressure_mpa:
        bearing_pressure_status: ResultStatus = "critical"
    elif bearing_pressure_mpa > allowable_bearing_pressure_mpa * 0.75:
        bearing_pressure_status = "warning"
    else:
        bearing_pressure_status = "good"

    if efficiency_percent >= 96:
        efficiency_status: ResultStatus = "good"
    elif efficiency_percent >= 93:
        efficiency_status = "warning"
    else:
        efficiency_status = "critical"

    if life_hours >= 10000:
        life_status: ResultStatus = "good"
    elif life_hours >= 4000:
        life_status = "warning"
    else:
        life_status = "critical"

    safety_status = _status_from_safety_factor(safety_factor)

    result_cards = [
        ResultCard(
            id="chain-speed",
            title="Chain Speed",
            value=_format_number(chain_speed_ms, 2),
            unit="m/s",
            status=chain_speed_status,
        ),
        ResultCard(
            id="allowable-load",
            title="Allowable Load",
            value=_format_number(spec.tensile_strength_kn, 1),
            unit="kN",
            status="good",
        ),
        ResultCard(
            id="safety-factor",
            title="Safety Factor",
            value=_format_number(safety_factor, 1),
            status=safety_status,
        ),
        ResultCard(
            id="recommended-chain",
            title="Recommended Chain",
            value=spec.id,
            status=safety_status,
        ),
        ResultCard(
            id="bearing-pressure",
            title="Bearing Pressure",
            value=_format_number(bearing_pressure_mpa, 1),
            unit="MPa",
            status=bearing_pressure_status,
        ),
        ResultCard(
            id="service-life",
            title="Estimated Service Life",
            value=f"{life_hours:,}",
            unit="hours",
            status=life_status,
        ),
        ResultCard(
            id="efficiency",
            title="Efficiency",
            value=_format_number(efficiency_percent, 1),
            unit="%",
            status=efficiency_status,
        ),
    ]

    explanation = [
        f"At {chain_input.driver_rpm:g} RPM with a {chain_input.number_of_teeth}-tooth sprocket, "
        f"the {spec.id} runs at {_format_number(chain_speed_ms, 2)} m/s — within its "
        f"{spec.max_recommended_rpm:g} RPM rating.",
        f"The required chain tension is {_format_number(required_tension_kn, 2)} kN against a "
        f"{_format_number(spec.tensile_strength_kn, 1)} kN rated tensile strength, giving a safety "
        f"factor of {_format_number(safety_factor, 1)} — "
        f"{'above' if safety_factor >= MIN_ACCEPTABLE_SAFETY_FACTOR else 'below'} the "
        f"{MIN_ACCEPTABLE_SAFETY_FACTOR:g}:1 minimum recommended for this duty.",
        f"{chain_input.lubrication} lubrication and a {chain_input.duty_cycle.lower()} duty cycle "
        f"at {chain_input.temperature:g}°C combine for an estimated efficiency of "
        f"{_format_number(efficiency_percent, 1)}%.",
        f"Projected service life is {life_hours:,} hours — roughly {approx_years:.1f} years at "
        f"{chain_input.operating_hours:g} operating hours per day.",
    ]

    duration_ms = (time.monotonic() - start) * 1000
    logger.info(
        "calculation completed: chain=%s safety_factor=%.1f life_hours=%d duration_ms=%.2f",
        spec.id,
        safety_factor,
        life_hours,
        duration_ms,
    )

    return ChainSelectionResult(
        result_cards=result_cards,
        recommendation=Recommendation(
            chain_id=spec.id,
            chain_label=spec.label,
            reason=(
                "Highest safety factor for the specified operating conditions among suitably "
                "sized chains."
                if safety_factor >= MIN_ACCEPTABLE_SAFETY_FACTOR
                else "Closest available chain to the specified conditions — consider a larger "
                "pitch or reduced service factor."
            ),
            expected_life_label=f"{life_hours:,} Hours",
            explanation=explanation,
        ),
    )
