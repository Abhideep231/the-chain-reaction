import { CheckCircle2Icon } from "lucide-react"

import { KeyValueList } from "@/components/shared/key-value-list"
import type { CalculationSummary } from "@/types/calculation"

export function SummaryPanel({
  summary,
}: {
  summary: CalculationSummary | null
}) {
  return (
    <div className="flex w-80 flex-1 flex-col overflow-hidden">
      <div className="flex h-14 w-80 shrink-0 items-center border-b pr-12 pl-4">
        <span className="text-sm font-medium">Calculation Summary</span>
      </div>

      {!summary ? (
        <div className="flex w-80 flex-1 items-center p-4">
          <p className="text-sm text-muted-foreground">
            Run a calculation to see the completed steps and calculation
            metadata.
          </p>
        </div>
      ) : (
        <div className="flex w-80 flex-1 flex-col gap-6 overflow-auto p-4">
          <section className="flex flex-col gap-2">
            <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Completed Steps
            </h3>
            <ul className="flex flex-col gap-2">
              {summary.completedSteps.map((step) => (
                <li key={step} className="flex items-center gap-2 text-sm">
                  <CheckCircle2Icon className="size-4 shrink-0 text-status-good" />
                  {step}
                </li>
              ))}
            </ul>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Metadata
            </h3>
            <KeyValueList
              items={[
                {
                  label: "Execution Time",
                  value: `${summary.executionTimeMs.toLocaleString("en-US")} ms`,
                },
              ]}
            />
          </section>
        </div>
      )}
    </div>
  )
}
