"use client"

import * as React from "react"

import { adaptCalculationInput, adaptCalculationResult } from "@/lib/api/adapters"
import { runChainSelectionCalculation } from "@/lib/api/calculations"
import { friendlyErrorMessage } from "@/lib/api/errors"
import { LOADING_STEPS, defaultCalculationInput } from "@/lib/calculation-mock"
import type {
  CalculationInput,
  CalculationResult,
  CalculationSummary,
} from "@/types/calculation"

export type CalculationStatus = "idle" | "loading" | "complete" | "error"

const STEP_DELAY_MS = 450

const COMPLETED_STEPS = [
  "Input Validation",
  "Load Calculation",
  "Safety Factor",
  "Chain Selection",
  "Life Estimation",
  "Final Recommendation",
]

export function useCalculation() {
  const [input, setInput] = React.useState<CalculationInput>(
    defaultCalculationInput
  )
  const [status, setStatus] = React.useState<CalculationStatus>("idle")
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0)
  const [result, setResult] = React.useState<CalculationResult | null>(null)
  const [summary, setSummary] = React.useState<CalculationSummary | null>(null)
  const [explanation, setExplanation] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

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
    setExplanation(null)
    setError(null)
    setCurrentStepIndex(0)

    // Purely a progress animation while the real (fast, but genuinely
    // asynchronous) backend call is in flight — cleared the moment a
    // real response or error arrives, never gating it.
    const timeouts: number[] = LOADING_STEPS.map((_, index) =>
      window.setTimeout(() => setCurrentStepIndex(index), index * STEP_DELAY_MS)
    )
    const startedAt = performance.now()

    runChainSelectionCalculation(adaptCalculationInput(input))
      .then((response) => {
        timeouts.forEach((id) => window.clearTimeout(id))
        setCurrentStepIndex(LOADING_STEPS.length - 1)
        setResult(adaptCalculationResult(response.result))
        setSummary({
          completedSteps: COMPLETED_STEPS,
          executionTimeMs: Math.round(performance.now() - startedAt),
        })
        setExplanation(response.explanation)
        setStatus("complete")
      })
      .catch((caught: unknown) => {
        timeouts.forEach((id) => window.clearTimeout(id))
        setError(friendlyErrorMessage(caught))
        setStatus("error")
      })
  }, [input])

  return {
    input,
    updateField,
    status,
    currentStepIndex,
    result,
    summary,
    explanation,
    error,
    runCalculation,
  }
}
