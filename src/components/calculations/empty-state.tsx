import { CalculatorIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export function EmptyState({ onRun }: { onRun: () => void }) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <CalculatorIcon className="size-6" />
      </div>
      <div className="flex flex-col gap-1.5">
        <h2 className="text-lg font-semibold">
          Ready to perform engineering calculations
        </h2>
        <p className="text-sm text-muted-foreground">
          Engineering calculations are deterministic and based on validated
          engineering formulas.
        </p>
      </div>
      <Button size="lg" onClick={onRun} className="w-full">
        Run Calculation
      </Button>
    </div>
  )
}
