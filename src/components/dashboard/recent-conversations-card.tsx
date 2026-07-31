import { MessageCircleQuestionIcon } from "lucide-react"

import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state"
import { cn } from "@/lib/utils"
import type { RecentConversationItem } from "@/types/dashboard"

export function RecentConversationsCard({ items }: { items: RecentConversationItem[] }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-5">
      <h3 className="text-sm font-semibold">Recent Conversations</h3>
      {items.length === 0 ? (
        <DashboardEmptyState
          icon={MessageCircleQuestionIcon}
          title="No conversations yet"
          subtitle="Questions asked in Ask AI will show up here."
        />
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <p className="line-clamp-1 text-sm">{item.question}</p>
              <div className="flex shrink-0 items-center gap-3">
                <span
                  className={cn(
                    "text-xs font-medium",
                    item.status === "answered" ? "text-status-good" : "text-status-warning"
                  )}
                >
                  {item.status === "answered" ? "Answered" : "Refused"}
                </span>
                <span className="text-xs text-muted-foreground">{item.timestamp}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
