import { SparklesIcon } from "lucide-react"

export function ExplanationCard({ explanation }: { explanation: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2">
        <SparklesIcon className="size-4 text-primary" />
        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Engineering Interpretation
        </span>
      </div>
      <p className="text-sm text-foreground">{explanation}</p>
    </div>
  )
}
