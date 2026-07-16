import type { CalculationInput } from "@/types/calculation"

/**
 * Sprint 19 connected the Calculation workspace to the real
 * `POST /calculations` backend (`app/services/calculations/chain_selection.py`),
 * which replaces this file's former deterministic engine — see
 * `src/hooks/use-calculation.ts`. What remains here is genuinely
 * frontend-only: the loading-stepper labels (a real async call still
 * benefits from staged progress feedback) and the form's initial
 * values (a sensible starting point, not a backend concept).
 */

export const LOADING_STEPS = [
  "Validating Inputs",
  "Calculating Load",
  "Selecting Chain",
  "Estimating Service Life",
  "Generating Recommendation",
] as const

export const defaultCalculationInput: CalculationInput = {
  chainType: "Roller Chain",
  chainStandard: "ISO 606",
  pitch: 12.7,
  numberOfTeeth: 19,
  driverRpm: 1450,
  drivenRpm: 500,
  powerKw: 7.5,
  torque: 50,
  serviceFactor: 1.5,
  shockLoad: "Moderate",
  temperature: 25,
  lubrication: "Oil Bath",
  operatingHours: 16,
  dutyCycle: "Continuous",
}
