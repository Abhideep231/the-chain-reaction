import { FileTextIcon } from "lucide-react"

import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state"
import type { RecentDocumentItem } from "@/types/dashboard"

export function RecentDocumentsCard({ items }: { items: RecentDocumentItem[] }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-5">
      <h3 className="text-sm font-semibold">Recently Uploaded Documents</h3>
      {items.length === 0 ? (
        <DashboardEmptyState
          icon={FileTextIcon}
          title="No uploaded documents"
          subtitle="Upload a PDF to start building the knowledge base."
        />
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <p className="line-clamp-1 text-sm">{item.name}</p>
              <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                <span>
                  {item.chunkCount} chunk{item.chunkCount === 1 ? "" : "s"}
                </span>
                <span>{item.uploadedAt}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
