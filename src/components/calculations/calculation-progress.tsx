import { CheckCircle2Icon, LoaderCircleIcon, CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export function CalculationProgress({
  steps,
  currentStepIndex,
}: {
  steps: readonly string[]
  currentStepIndex: number
}) {
  return (
    <ol className="flex flex-col gap-3">
      {steps.map((step, index) => {
        const isComplete = index < currentStepIndex
        const isCurrent = index === currentStepIndex

        return (
          <li key={step} className="flex items-center gap-2.5 text-sm">
            {isComplete ? (
              <CheckCircle2Icon className="size-4 shrink-0 text-status-good" />
            ) : isCurrent ? (
              <LoaderCircleIcon className="size-4 shrink-0 animate-spin text-primary" />
            ) : (
              <CircleIcon className="size-4 shrink-0 text-muted-foreground" />
            )}
            <span
              className={cn(
                isComplete || isCurrent
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {step}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
