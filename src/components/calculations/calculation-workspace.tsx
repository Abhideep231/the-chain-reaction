"use client"

import * as React from "react"

import { EmptyState } from "@/components/calculations/empty-state"
import { ErrorState } from "@/components/calculations/error-state"
import { ExplanationCard } from "@/components/calculations/explanation-card"
import { LoadingState } from "@/components/calculations/loading-state"
import { ParameterGroup } from "@/components/calculations/parameter-group"
import { ParameterInput } from "@/components/calculations/parameter-input"
import { RecommendationCard } from "@/components/calculations/recommendation-card"
import { ResultCard } from "@/components/calculations/result-card"
import { SummaryPanel } from "@/components/calculations/summary-panel"
import { useUtilityPanelContent } from "@/components/layout/utility-panel-provider"
import { Button } from "@/components/ui/button"
import { useCalculation } from "@/hooks/use-calculation"

const CHAIN_TYPE_OPTIONS = [
  "Roller Chain",
  "Conveyor Chain",
  "Attachment Chain",
  "Engineering Class Chain",
] as const
const CHAIN_STANDARD_OPTIONS = ["ISO 606", "ANSI B29.1"] as const
const SHOCK_LOAD_OPTIONS = ["None", "Moderate", "Heavy"] as const
const LUBRICATION_OPTIONS = [
  "Manual",
  "Drip",
  "Oil Bath",
  "Forced Circulation",
] as const
const DUTY_CYCLE_OPTIONS = ["Continuous", "Intermittent", "Occasional"] as const

export function CalculationWorkspace() {
  const {
    input,
    updateField,
    status,
    currentStepIndex,
    result,
    summary,
    explanation,
    error,
    runCalculation,
  } = useCalculation()

  const panelContent = React.useMemo(
    () => <SummaryPanel summary={summary} />,
    [summary]
  )
  useUtilityPanelContent(panelContent, { openOnMount: true })

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold">Chain Calculations</h1>
        <p className="text-sm text-muted-foreground">
          Industrial roller chain sizing and service life estimation.
        </p>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-y-auto lg:flex-row lg:overflow-hidden">
        <aside className="flex w-full shrink-0 flex-col gap-3 lg:w-80 lg:overflow-y-auto lg:pr-1">
          <ParameterGroup title="Basic Parameters">
            <ParameterInput
              type="select"
              label="Chain Type"
              value={input.chainType}
              onChange={(value) =>
                updateField("chainType", value as typeof input.chainType)
              }
              options={CHAIN_TYPE_OPTIONS}
            />
            <ParameterInput
              type="select"
              label="Chain Standard"
              value={input.chainStandard}
              onChange={(value) =>
                updateField("chainStandard", value as typeof input.chainStandard)
              }
              options={CHAIN_STANDARD_OPTIONS}
            />
            <ParameterInput
              type="number"
              label="Pitch"
              unit="mm"
              value={input.pitch}
              onChange={(value) => updateField("pitch", value)}
              min={4}
              max={50}
              step={0.1}
            />
            <ParameterInput
              type="number"
              label="Number of Teeth"
              value={input.numberOfTeeth}
              onChange={(value) => updateField("numberOfTeeth", value)}
              min={9}
              max={120}
              step={1}
            />
            <ParameterInput
              type="number"
              label="Driver RPM"
              value={input.driverRpm}
              onChange={(value) => updateField("driverRpm", value)}
              min={1}
              max={10000}
              step={1}
            />
            <ParameterInput
              type="number"
              label="Driven RPM"
              value={input.drivenRpm}
              onChange={(value) => updateField("drivenRpm", value)}
              min={1}
              max={10000}
              step={1}
            />
          </ParameterGroup>

          <ParameterGroup title="Load Conditions">
            <ParameterInput
              type="number"
              label="Power"
              unit="kW"
              value={input.powerKw}
              onChange={(value) => updateField("powerKw", value)}
              min={0.1}
              max={1000}
              step={0.1}
            />
            <ParameterInput
              type="number"
              label="Torque"
              unit="N·m"
              value={input.torque}
              onChange={(value) => updateField("torque", value)}
              min={0}
              max={5000}
              step={1}
            />
            <ParameterInput
              type="number"
              label="Service Factor"
              value={input.serviceFactor}
              onChange={(value) => updateField("serviceFactor", value)}
              min={1}
              max={3}
              step={0.1}
            />
            <ParameterInput
              type="select"
              label="Shock Load"
              value={input.shockLoad}
              onChange={(value) =>
                updateField("shockLoad", value as typeof input.shockLoad)
              }
              options={SHOCK_LOAD_OPTIONS}
            />
          </ParameterGroup>

          <ParameterGroup title="Operating Conditions">
            <ParameterInput
              type="number"
              label="Temperature"
              unit="°C"
              value={input.temperature}
              onChange={(value) => updateField("temperature", value)}
              min={-40}
              max={200}
              step={1}
            />
            <ParameterInput
              type="select"
              label="Lubrication"
              value={input.lubrication}
              onChange={(value) =>
                updateField("lubrication", value as typeof input.lubrication)
              }
              options={LUBRICATION_OPTIONS}
            />
            <ParameterInput
              type="number"
              label="Operating Hours"
              unit="hrs/day"
              value={input.operatingHours}
              onChange={(value) => updateField("operatingHours", value)}
              min={1}
              max={24}
              step={1}
            />
            <ParameterInput
              type="select"
              label="Duty Cycle"
              value={input.dutyCycle}
              onChange={(value) =>
                updateField("dutyCycle", value as typeof input.dutyCycle)
              }
              options={DUTY_CYCLE_OPTIONS}
            />
          </ParameterGroup>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 lg:overflow-y-auto lg:pr-1">
          {status === "idle" && <EmptyState onRun={runCalculation} />}
          {status === "loading" && (
            <LoadingState currentStepIndex={currentStepIndex} />
          )}
          {status === "error" && (
            <ErrorState
              message={error ?? "Something went wrong. Please try again."}
              onRetry={runCalculation}
            />
          )}
          {status === "complete" && result && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold">Calculation Results</h2>
                <Button variant="outline" size="sm" onClick={runCalculation}>
                  Recalculate
                </Button>
              </div>

              <RecommendationCard recommendation={result.recommendation} />

              <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
                {result.resultCards.map((card) => (
                  <ResultCard key={card.id} data={card} />
                ))}
              </div>

              {explanation && <ExplanationCard explanation={explanation} />}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
