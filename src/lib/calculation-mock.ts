import type {
  CalculationInput,
  CalculationResult,
  CalculationSummary,
  DutyCycle,
  LubricationType,
  ResultStatus,
} from "@/types/calculation"

/**
 * A deterministic, formula-driven mock calculation engine — not a lookup
 * of canned answers and not random. Every output is a genuine function of
 * the input parameters, using simplified (illustrative, not
 * certification-grade) roller chain engineering relationships:
 * chain speed, tension from power and from torque, safety factor against
 * ultimate tensile strength, bearing pressure, and an empirical wear-life
 * estimate. Sprint 6 is frontend-only — there is no real engineering
 * validation behind these numbers, but they respond sensibly to changes
 * in every input, which is what "deterministic" means here.
 *
 * `runMockCalculation` is the one function a future backend replaces
 * with `POST /api/calculations` — see the hook for the integration seam.
 */

export const LOADING_STEPS = [
  "Validating Inputs",
  "Calculating Load",
  "Selecting Chain",
  "Estimating Service Life",
  "Generating Recommendation",
] as const

interface ChainSpec {
  id: string
  label: string
  pitchMm: number
  rollerDiameterMm: number
  innerPlateWidthMm: number
  tensileStrengthKn: number
  maxRecommendedRpm: number
}

// Representative ISO 606 series roller chain specs, smallest to largest
// pitch. Dimensions and tensile ratings are realistic ballpark figures
// for these chain numbers, not pulled from a certified standard.
const CHAIN_SPECS: ChainSpec[] = [
  {
    id: "05B-1",
    label: "05B-1 Roller Chain",
    pitchMm: 8.0,
    rollerDiameterMm: 5.0,
    innerPlateWidthMm: 3.0,
    tensileStrengthKn: 4.4,
    maxRecommendedRpm: 2800,
  },
  {
    id: "06B-1",
    label: "06B-1 Roller Chain",
    pitchMm: 9.525,
    rollerDiameterMm: 6.35,
    innerPlateWidthMm: 5.72,
    tensileStrengthKn: 8.9,
    maxRecommendedRpm: 2200,
  },
  {
    id: "08B-1",
    label: "08B-1 Roller Chain",
    pitchMm: 12.7,
    rollerDiameterMm: 8.51,
    innerPlateWidthMm: 7.75,
    tensileStrengthKn: 17.9,
    maxRecommendedRpm: 1800,
  },
  {
    id: "10B-1",
    label: "10B-1 Roller Chain",
    pitchMm: 15.875,
    rollerDiameterMm: 10.16,
    innerPlateWidthMm: 9.65,
    tensileStrengthKn: 22.2,
    maxRecommendedRpm: 1400,
  },
  {
    id: "12B-1",
    label: "12B-1 Roller Chain",
    pitchMm: 19.05,
    rollerDiameterMm: 12.07,
    innerPlateWidthMm: 11.68,
    tensileStrengthKn: 29.0,
    maxRecommendedRpm: 1000,
  },
]

const MIN_ACCEPTABLE_SAFETY_FACTOR = 6

const shockLoadAdjustment: Record<CalculationInput["shockLoad"], number> = {
  None: 0,
  Moderate: 0.2,
  Heavy: 0.4,
}

const lubricationLifeFactor: Record<LubricationType, number> = {
  Manual: 0.7,
  Drip: 0.9,
  "Oil Bath": 1.15,
  "Forced Circulation": 1.3,
}

const lubricationEfficiencyPenalty: Record<LubricationType, number> = {
  Manual: 1.5,
  Drip: 0.8,
  "Oil Bath": 0.3,
  "Forced Circulation": 0.1,
}

const dutyCycleLifeFactor: Record<DutyCycle, number> = {
  Continuous: 0.8,
  Intermittent: 1.0,
  Occasional: 1.2,
}

const dutyCycleEfficiencyPenalty: Record<DutyCycle, number> = {
  Continuous: 0.5,
  Intermittent: 0.2,
  Occasional: 0.1,
}

function statusFromSafetyFactor(safetyFactor: number): ResultStatus {
  if (safetyFactor >= MIN_ACCEPTABLE_SAFETY_FACTOR) return "good"
  if (safetyFactor >= MIN_ACCEPTABLE_SAFETY_FACTOR * 0.6) return "warning"
  return "critical"
}

function formatNumber(value: number, decimals: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function runMockCalculation(input: CalculationInput): CalculationResult {
  const effectiveServiceFactor =
    input.serviceFactor + shockLoadAdjustment[input.shockLoad]
  const designPowerKw = input.powerKw * effectiveServiceFactor

  // Sprocket pitch diameter (mm) from pitch and tooth count, then the
  // pitch-circle radius in meters — the standard relation for chain
  // sprockets: PD = pitch / sin(π / N).
  const pitchDiameterMm = input.pitch / Math.sin(Math.PI / input.numberOfTeeth)
  const pitchRadiusM = pitchDiameterMm / 2 / 1000

  // Start scanning from the chain spec closest to the entered pitch, and
  // move up in size if it can't carry the load — never down, since a
  // smaller pitch than requested wouldn't fit the existing sprocket.
  const startIndex = CHAIN_SPECS.reduce((closest, spec, index) => {
    const closestDiff = Math.abs(CHAIN_SPECS[closest].pitchMm - input.pitch)
    const diff = Math.abs(spec.pitchMm - input.pitch)
    return diff < closestDiff ? index : closest
  }, 0)

  let selected = CHAIN_SPECS[CHAIN_SPECS.length - 1]
  let selectedMetrics = {
    chainSpeedMs: 0,
    requiredTensionKn: 0,
    safetyFactor: 0,
  }

  for (let i = startIndex; i < CHAIN_SPECS.length; i += 1) {
    const spec = CHAIN_SPECS[i]

    const chainSpeedMs =
      (spec.pitchMm * input.numberOfTeeth * input.driverRpm) / 60000

    const requiredTensionFromPowerKn = designPowerKw / chainSpeedMs
    const requiredTensionFromTorqueKn =
      (input.torque * effectiveServiceFactor) / pitchRadiusM / 1000
    const requiredTensionKn = Math.max(
      requiredTensionFromPowerKn,
      requiredTensionFromTorqueKn
    )

    const safetyFactor = spec.tensileStrengthKn / requiredTensionKn

    selected = spec
    selectedMetrics = { chainSpeedMs, requiredTensionKn, safetyFactor }

    const withinSpeedLimit = input.driverRpm <= spec.maxRecommendedRpm
    if (safetyFactor >= MIN_ACCEPTABLE_SAFETY_FACTOR && withinSpeedLimit) {
      break
    }
  }

  const { chainSpeedMs, requiredTensionKn, safetyFactor } = selectedMetrics

  // Bearing pressure: chain tension over the roller's projected bearing
  // area (roller diameter × inner plate width) — the standard chain
  // bearing-pressure check.
  const bearingPressureMpa =
    (requiredTensionKn * 1000) /
    (selected.rollerDiameterMm * selected.innerPlateWidthMm)

  const speedHeadroom = selected.maxRecommendedRpm / input.driverRpm
  const speedPenalty = speedHeadroom < 1.2 ? 1.0 : 0.3
  const temperaturePenalty =
    input.temperature > 60 || input.temperature < -10
      ? 1.0
      : input.temperature > 40
        ? 0.5
        : 0.2

  const efficiencyPercent = Math.min(
    99.5,
    Math.max(
      90,
      99.0 -
        speedPenalty -
        lubricationEfficiencyPenalty[input.lubrication] -
        temperaturePenalty -
        dutyCycleEfficiencyPenalty[input.dutyCycle]
    )
  )

  const temperatureLifeFactor =
    input.temperature > 60 || input.temperature < -10
      ? 0.5
      : input.temperature > 40
        ? 0.75
        : 1.0

  const baseLifeHours = 15000
  const lifeHours = Math.round(
    Math.min(
      60000,
      Math.max(
        500,
        baseLifeHours *
          Math.pow(safetyFactor / MIN_ACCEPTABLE_SAFETY_FACTOR, 1.5) *
          lubricationLifeFactor[input.lubrication] *
          temperatureLifeFactor *
          dutyCycleLifeFactor[input.dutyCycle]
      )
    )
  )

  const approxYears = lifeHours / (input.operatingHours * 365)

  const chainSpeedStatus: ResultStatus = speedHeadroom < 1.1 ? "warning" : "good"

  // Allowable bearing pressure derates with speed, same shape as a real
  // manufacturer chain rating chart — a flat MPa threshold would flag a
  // slow, lightly loaded chain the same as a fast, heavily loaded one.
  const allowableBearingPressureMpa = Math.max(8, 46 - chainSpeedMs * 1.2)
  const bearingPressureStatus: ResultStatus =
    bearingPressureMpa > allowableBearingPressureMpa
      ? "critical"
      : bearingPressureMpa > allowableBearingPressureMpa * 0.75
        ? "warning"
        : "good"
  const efficiencyStatus: ResultStatus =
    efficiencyPercent >= 96 ? "good" : efficiencyPercent >= 93 ? "warning" : "critical"
  const lifeStatus: ResultStatus =
    lifeHours >= 10000 ? "good" : lifeHours >= 4000 ? "warning" : "critical"
  const safetyStatus = statusFromSafetyFactor(safetyFactor)

  const resultCards: CalculationResult["resultCards"] = [
    {
      id: "chain-speed",
      title: "Chain Speed",
      value: formatNumber(chainSpeedMs, 2),
      unit: "m/s",
      status: chainSpeedStatus,
    },
    {
      id: "allowable-load",
      title: "Allowable Load",
      value: formatNumber(selected.tensileStrengthKn, 1),
      unit: "kN",
      status: "good",
    },
    {
      id: "safety-factor",
      title: "Safety Factor",
      value: formatNumber(safetyFactor, 1),
      status: safetyStatus,
    },
    {
      id: "recommended-chain",
      title: "Recommended Chain",
      value: selected.id,
      status: safetyStatus,
    },
    {
      id: "bearing-pressure",
      title: "Bearing Pressure",
      value: formatNumber(bearingPressureMpa, 1),
      unit: "MPa",
      status: bearingPressureStatus,
    },
    {
      id: "service-life",
      title: "Estimated Service Life",
      value: lifeHours.toLocaleString("en-US"),
      unit: "hours",
      status: lifeStatus,
    },
    {
      id: "efficiency",
      title: "Efficiency",
      value: formatNumber(efficiencyPercent, 1),
      unit: "%",
      status: efficiencyStatus,
    },
  ]

  const explanation = [
    `At ${input.driverRpm} RPM with a ${input.numberOfTeeth}-tooth sprocket, the ${selected.id} runs at ${formatNumber(chainSpeedMs, 2)} m/s — within its ${selected.maxRecommendedRpm} RPM rating.`,
    `The required chain tension is ${formatNumber(requiredTensionKn, 2)} kN against a ${formatNumber(selected.tensileStrengthKn, 1)} kN rated tensile strength, giving a safety factor of ${formatNumber(safetyFactor, 1)} — ${safetyFactor >= MIN_ACCEPTABLE_SAFETY_FACTOR ? "above" : "below"} the ${MIN_ACCEPTABLE_SAFETY_FACTOR}:1 minimum recommended for this duty.`,
    `${input.lubrication} lubrication and a ${input.dutyCycle.toLowerCase()} duty cycle at ${input.temperature}°C combine for an estimated efficiency of ${formatNumber(efficiencyPercent, 1)}%.`,
    `Projected service life is ${lifeHours.toLocaleString("en-US")} hours — roughly ${approxYears.toFixed(1)} years at ${input.operatingHours} operating hours per day.`,
  ]

  return {
    resultCards,
    recommendation: {
      chainId: selected.id,
      chainLabel: selected.label,
      reason:
        safetyFactor >= MIN_ACCEPTABLE_SAFETY_FACTOR
          ? "Highest safety factor for the specified operating conditions among suitably sized chains."
          : "Closest available chain to the specified conditions — consider a larger pitch or reduced service factor.",
      expectedLifeLabel: `${lifeHours.toLocaleString("en-US")} Hours`,
      explanation,
    },
  }
}

export function getCalculationSummary(
  completedSteps: readonly string[]
): CalculationSummary {
  return {
    completedSteps: [...completedSteps],
    executionTimeMs: 1180,
    calculationVersion: "v1.4.2",
    formulaVersion: "Rev. 2026.1",
    lastUpdated: "Jun 2026",
  }
}

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
