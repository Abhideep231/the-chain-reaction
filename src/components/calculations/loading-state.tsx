import { CalculationProgress } from "@/components/calculations/calculation-progress"
import { LOADING_STEPS } from "@/lib/calculation-mock"

export function LoadingState({ currentStepIndex }: { currentStepIndex: number }) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 py-16">
      <div className="flex flex-col items-center gap-1.5 text-center">
        <h2 className="text-lg font-semibold">Running calculation…</h2>
        <p className="text-sm text-muted-foreground">
          This won&apos;t take long.
        </p>
      </div>
      <div className="w-full rounded-lg border bg-card p-4">
        <CalculationProgress
          steps={LOADING_STEPS}
          currentStepIndex={currentStepIndex}
        />
      </div>
    </div>
  )
}
