import { CheckCircle2Icon, CircleAlertIcon, CircleHelpIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import type { ConfidenceLevel } from "@/types/shared"

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
    className: "border-destructive/20 bg-destructive/10 text-destructive",
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
