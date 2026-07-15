import {
  CheckCircle2Icon,
  ClockIcon,
  EyeIcon,
  LoaderCircleIcon,
  RefreshCwIcon,
  Trash2Icon,
  UploadIcon,
  XCircleIcon,
} from "lucide-react"

import { EmptyState } from "@/components/admin/empty-state"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { AdminDocument, DocumentStatus } from "@/types/admin"

const statusConfig: Record<
  DocumentStatus,
  { label: string; icon: typeof CheckCircle2Icon; className: string }
> = {
  indexed: {
    label: "Indexed",
    icon: CheckCircle2Icon,
    className: "text-status-good",
  },
  processing: {
    label: "Processing",
    icon: LoaderCircleIcon,
    className: "text-status-warning",
  },
  pending: {
    label: "Pending",
    icon: ClockIcon,
    className: "text-muted-foreground",
  },
  failed: {
    label: "Failed",
    icon: XCircleIcon,
    className: "text-status-critical",
  },
}

function ActionButton({
  label,
  icon: Icon,
  destructive = false,
}: {
  label: string
  icon: typeof EyeIcon
  destructive?: boolean
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("size-8", destructive && "hover:text-destructive")}
          aria-label={label}
        >
          <Icon className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label} isn&apos;t connected yet</TooltipContent>
    </Tooltip>
  )
}

export function DocumentTable({ documents }: { documents: AdminDocument[] }) {
  if (documents.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 pr-4 font-medium">Document Name</th>
            <th className="py-2 pr-4 font-medium">Type</th>
            <th className="py-2 pr-4 font-medium">Version</th>
            <th className="py-2 pr-4 font-medium">Status</th>
            <th className="py-2 pr-4 text-right font-medium">Chunks</th>
            <th className="py-2 pr-4 font-medium">Last Updated</th>
            <th className="py-2 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((document) => {
            const status = statusConfig[document.status]
            const StatusIcon = status.icon
            return (
              <tr key={document.id} className="border-b last:border-b-0">
                <td className="py-2.5 pr-4 font-medium">{document.name}</td>
                <td className="py-2.5 pr-4 text-muted-foreground">
                  {document.documentType}
                </td>
                <td className="py-2.5 pr-4 tabular-nums text-muted-foreground">
                  {document.version}
                </td>
                <td className="py-2.5 pr-4">
                  <span
                    className={cn(
                      "flex items-center gap-1.5 font-medium",
                      status.className
                    )}
                  >
                    <StatusIcon
                      className={cn(
                        "size-3.5 shrink-0",
                        document.status === "processing" && "animate-spin"
                      )}
                    />
                    {status.label}
                  </span>
                </td>
                <td className="py-2.5 pr-4 text-right tabular-nums">
                  {document.chunks > 0 ? document.chunks.toLocaleString("en-US") : "—"}
                </td>
                <td className="py-2.5 pr-4 text-muted-foreground">
                  {document.lastUpdated}
                </td>
                <td className="py-2.5">
                  <div className="flex items-center justify-end gap-0.5">
                    <ActionButton label="View" icon={EyeIcon} />
                    <ActionButton label="Replace" icon={UploadIcon} />
                    <ActionButton label="Re-index" icon={RefreshCwIcon} />
                    <ActionButton label="Delete" icon={Trash2Icon} destructive />
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
