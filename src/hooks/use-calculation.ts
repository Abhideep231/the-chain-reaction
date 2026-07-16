"use client"

import * as React from "react"

import {
  LOADING_STEPS,
  defaultCalculationInput,
  getCalculationSummary,
  runMockCalculation,
} from "@/lib/calculation-mock"
import type {
  CalculationInput,
  CalculationResult,
  CalculationSummary,
} from "@/types/calculation"

export type CalculationStatus = "idle" | "loading" | "complete"

const STEP_DELAY_MS = 450

export function useCalculation() {
  const [input, setInput] = React.useState<CalculationInput>(
    defaultCalculationInput
  )
  const [status, setStatus] = React.useState<CalculationStatus>("idle")
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0)
  const [result, setResult] = React.useState<CalculationResult | null>(null)
  const [summary, setSummary] = React.useState<CalculationSummary | null>(null)

  const updateField = React.useCallback(
    <K extends keyof CalculationInput>(field: K, value: CalculationInput[K]) => {
      setInput((prev) => ({ ...prev, [field]: value }))
    },
    []
  )

  const runCalculation = React.useCallback(() => {
    setStatus("loading")
    setResult(null)
    setSummary(null)
    setCurrentStepIndex(0)

    const timeouts: number[] = LOADING_STEPS.map((_, index) =>
      window.setTimeout(() => setCurrentStepIndex(index), index * STEP_DELAY_MS)
    )

    const finalTimeout = window.setTimeout(
      () => {
        // Sprint 16 (frontend-backend integration) deliberately left this
        // on the local engine: the real POST /calculations is still a
        // non-functional placeholder (always returns
        // {status: "not_implemented", result: null}, see
        // backend/app/api/routes/calculations.py) with no engineering
        // formulas behind it. Wiring this call to that endpoint would
        // replace a working feature with one that always fails.
        const calculationResult = runMockCalculation(input)
        setResult(calculationResult)
        setSummary(
          getCalculationSummary([
            "Input Validation",
            "Load Calculation",
            "Safety Factor",
            "Chain Selection",
            "Life Estimation",
            "Final Recommendation",
          ])
        )
        setStatus("complete")
      },
      LOADING_STEPS.length * STEP_DELAY_MS
    )
    timeouts.push(finalTimeout)

    return () => timeouts.forEach((id) => window.clearTimeout(id))
  }, [input])

  return {
    input,
    updateField,
    status,
    currentStepIndex,
    result,
    summary,
    runCalculation,
  }
}
