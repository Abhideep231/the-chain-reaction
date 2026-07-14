import { CheckCircle2Icon, PencilLineIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import type { DocumentStatus } from "@/types/library"

const statusConfig: Record<
  DocumentStatus,
  { label: string; icon: typeof CheckCircle2Icon; className: string }
> = {
  approved: {
    label: "Approved",
    icon: CheckCircle2Icon,
    className:
      "border-emerald-600/20 bg-emerald-600/10 text-emerald-700 dark:text-emerald-400",
  },
  draft: {
    label: "Draft",
    icon: PencilLineIcon,
    className:
      "border-amber-600/20 bg-amber-600/10 text-amber-700 dark:text-amber-400",
  },
}

export function StatusBadge({
  status,
  className,
}: {
  status: DocumentStatus
  className?: string
}) {
  const config = statusConfig[status]
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
