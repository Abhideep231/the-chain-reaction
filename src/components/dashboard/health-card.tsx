import { AlertTriangleIcon, CheckCircle2Icon, XCircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import type { SystemComponentStatus, SystemHealthComponent } from "@/types/dashboard"

const statusConfig: Record<
  SystemComponentStatus,
  { label: string; icon: typeof CheckCircle2Icon; className: string }
> = {
  operational: {
    label: "Operational",
    icon: CheckCircle2Icon,
    className: "text-status-good",
  },
  degraded: {
    label: "Degraded",
    icon: AlertTriangleIcon,
    className: "text-status-warning",
  },
  down: {
    label: "Down",
    icon: XCircleIcon,
    className: "text-status-critical",
  },
}

export function HealthCard({ component }: { component: SystemHealthComponent }) {
  const config = statusConfig[component.status]
  const Icon = config.icon

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{component.name}</h3>
        <span className={cn("flex items-center gap-1 text-xs font-medium", config.className)}>
          <Icon className="size-3.5" />
          {config.label}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        {component.metricLabel}:{" "}
        <span className="font-medium text-foreground">{component.metricValue}</span>
      </p>
      <p className="text-xs text-muted-foreground">
        Checked {component.lastChecked}
      </p>
    </div>
  )
}
