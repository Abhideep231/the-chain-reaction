import { CheckCircle2Icon, CircleAlertIcon, CircleHelpIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import type { ConfidenceLevel, EngineeringAnswer } from "@/types/chat"

const confidenceConfig: Record<
  ConfidenceLevel,
  { label: string; icon: typeof CheckCircle2Icon; className: string }
> = {
  high: {
    label: "High confidence",
    icon: CheckCircle2Icon,
    className:
      "border-emerald-600/20 bg-emerald-600/10 text-emerald-700 dark:text-emerald-400",
  },
  medium: {
    label: "Medium confidence",
    icon: CircleHelpIcon,
    className:
      "border-amber-600/20 bg-amber-600/10 text-amber-700 dark:text-amber-400",
  },
  low: {
    label: "Low confidence",
    icon: CircleAlertIcon,
    className:
      "border-destructive/20 bg-destructive/10 text-destructive",
  },
}

export function ConfidenceIndicator({
  confidence,
  className,
}: {
  confidence?: ConfidenceLevel
  className?: string
}) {
  if (!confidence) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground",
          className
        )}
      >
        <CircleHelpIcon className="size-3.5" />
        Awaiting analysis
      </span>
    )
  }

  const config = confidenceConfig[confidence]
  const Icon = config.icon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        config.className,
        className
      )}
    >
      <Icon className="size-3.5" />
      {config.label}
    </span>
  )
}

export function AnswerCard({ answer }: { answer: EngineeringAnswer }) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 text-card-foreground">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold">Engineering Answer</span>
        <ConfidenceIndicator confidence={answer.confidence} />
      </div>

      <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
        {answer.summary}
      </p>

      {answer.parameters && answer.parameters.length > 0 && (
        <div className="rounded-md border bg-muted/40">
          <dl className="divide-y divide-border">
            {answer.parameters.map((parameter) => (
              <div
                key={parameter.label}
                className="flex items-center justify-between gap-4 px-3 py-2 text-sm"
              >
                <dt className="text-muted-foreground">{parameter.label}</dt>
                <dd className="font-medium tabular-nums">{parameter.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {answer.citations.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 border-t pt-3">
          <span className="text-xs text-muted-foreground">Sources:</span>
          {answer.citations.map((citation, index) => (
            <span
              key={citation.id}
              className="inline-flex size-5 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground"
              title={citation.title}
            >
              {index + 1}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
