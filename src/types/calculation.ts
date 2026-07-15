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

export interface CalculationSummary {
  completedSteps: string[]
  executionTimeMs: number
  calculationVersion: string
  formulaVersion: string
  lastUpdated: string
}
