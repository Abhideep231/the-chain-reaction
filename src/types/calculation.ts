export type ChainType =
  | "Roller Chain"
  | "Conveyor Chain"
  | "Attachment Chain"
  | "Engineering Class Chain"

export type ChainStandard = "ISO 606" | "ANSI B29.1"

export type ShockLoad = "None" | "Moderate" | "Heavy"

export type LubricationType = "Manual" | "Drip" | "Oil Bath" | "Forced Circulation"

export type DutyCycle = "Continuous" | "Intermittent" | "Occasional"

export interface CalculationInput {
  chainType: ChainType
  chainStandard: ChainStandard
  pitch: number
  numberOfTeeth: number
  driverRpm: number
  drivenRpm: number
  powerKw: number
  torque: number
  serviceFactor: number
  shockLoad: ShockLoad
  temperature: number
  lubrication: LubricationType
  operatingHours: number
  dutyCycle: DutyCycle
}

export type ResultStatus = "good" | "warning" | "critical"

export interface ResultCardData {
  id: string
  title: string
  value: string
  unit?: string
  status: ResultStatus
}

export interface Recommendation {
  chainId: string
  chainLabel: string
  reason: string
  expectedLifeLabel: string
  explanation: string[]
}

export interface CalculationResult {
  resultCards: ResultCardData[]
  recommendation: Recommendation
}

/** `calculationVersion`/`formulaVersion`/`lastUpdated` (Sprint 6 mock)
 * were dropped in Sprint 19 — the real backend has no engine or
 * formula versioning concept, and inventing one would fabricate data
 * alongside a now-genuine calculation result. Both remaining fields are
 * real: `completedSteps` describes the actual stages the backend ran,
 * `executionTimeMs` is the measured round-trip time of the real call. */
export interface CalculationSummary {
  completedSteps: string[]
  executionTimeMs: number
}
