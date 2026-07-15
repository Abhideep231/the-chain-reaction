import { AlertTriangleIcon, CheckCircle2Icon, XCircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import type { ResultCardData, ResultStatus } from "@/types/calculation"

const statusConfig: Record<
  ResultStatus,
  { icon: typeof CheckCircle2Icon; className: string }
> = {
  good: { icon: CheckCircle2Icon, className: "text-status-good" },
  warning: { icon: AlertTriangleIcon, className: "text-status-warning" },
  critical: { icon: XCircleIcon, className: "text-status-critical" },
}

export function ResultCard({ data }: { data: ResultCardData }) {
  const config = statusConfig[data.status]
  const Icon = config.icon

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-muted-foreground">{data.title}</span>
        <Icon className={cn("size-4 shrink-0", config.className)} />
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-semibold tabular-nums">{data.value}</span>
        {data.unit && (
          <span className="text-sm text-muted-foreground">{data.unit}</span>
        )}
      </div>
    </div>
  )
}
