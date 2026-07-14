import {
  ActivityIcon,
  RefreshCwIcon,
  RotateCwIcon,
  UploadIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { KeyValueList } from "@/components/shared/key-value-list"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { AdminSummary, KnowledgeBaseStatus } from "@/types/admin"

const statusClassName: Record<KnowledgeBaseStatus, string> = {
  Healthy: "border-status-good/30 bg-status-good/10 text-status-good",
  Degraded: "border-status-warning/30 bg-status-warning/10 text-status-warning",
  Critical: "border-status-critical/30 bg-status-critical/10 text-status-critical",
}

const quickActions = [
  { label: "Upload New Document", icon: UploadIcon },
  { label: "Re-index Knowledge Base", icon: RotateCwIcon },
  { label: "Refresh Status", icon: RefreshCwIcon },
  { label: "View Activity", icon: ActivityIcon },
]

export function AdminSummaryPanel({ summary }: { summary: AdminSummary }) {
  return (
    <div className="flex w-80 flex-1 flex-col overflow-hidden">
      <div className="flex h-14 w-80 shrink-0 items-center border-b pr-12 pl-4">
        <span className="text-sm font-medium">Administration Summary</span>
      </div>

      <div className="flex w-80 flex-1 flex-col gap-6 overflow-auto p-4">
        <section className="flex flex-col gap-2">
          <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Knowledge Base Status
          </h3>
          <span
            className={cn(
              "inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-medium",
              statusClassName[summary.knowledgeBaseStatus]
            )}
          >
            {summary.knowledgeBaseStatus}
          </span>
        </section>

        <section className="flex flex-col gap-2">
          <KeyValueList
            items={[
              {
                label: "Documents Indexed",
                value: summary.documentsIndexed.toLocaleString("en-US"),
              },
              { label: "Chunks", value: summary.chunks.toLocaleString("en-US") },
              {
                label: "Last Synchronization",
                value: summary.lastSynchronization,
              },
            ]}
          />
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Quick Actions
          </h3>
          <div className="flex flex-col gap-1.5">
            {quickActions.map((action) => (
              <Tooltip key={action.label}>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="justify-start">
                    <action.icon />
                    {action.label}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {action.label} isn&apos;t connected yet
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
