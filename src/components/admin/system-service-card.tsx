import { AlertTriangleIcon, CheckCircle2Icon, XCircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import type { ServiceStatus, SystemHealthService } from "@/types/admin"

const statusConfig: Record<
  ServiceStatus,
  { label: string; icon: typeof CheckCircle2Icon; className: string }
> = {
  operational: {
    label: "Operational",
    icon: CheckCircle2Icon,
    className: "text-status-good",
  },
  warning: {
    label: "Warning",
    icon: AlertTriangleIcon,
    className: "text-status-warning",
  },
  offline: {
    label: "Offline",
    icon: XCircleIcon,
    className: "text-status-critical",
  },
}

export function SystemServiceCard({
  service,
}: {
  service: SystemHealthService
}) {
  const config = statusConfig[service.status]
  const Icon = config.icon

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{service.name}</h3>
        <span className={cn("flex items-center gap-1 text-xs font-medium", config.className)}>
          <Icon className="size-3.5" />
          {config.label}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        Response time:{" "}
        <span className="font-medium text-foreground">{service.responseTime}</span>
      </p>
      <p className="text-xs text-muted-foreground">
        Checked {service.lastChecked}
      </p>
    </div>
  )
}
