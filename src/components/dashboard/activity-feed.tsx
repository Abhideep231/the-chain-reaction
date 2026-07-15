import type { LucideIcon } from "lucide-react"

import type { ActivityItem } from "@/types/dashboard"

export function ActivityFeed({
  title,
  icon: Icon,
  items,
}: {
  title: string
  icon: LucideIcon
  items: ActivityItem[]
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.id} className="flex flex-col gap-0.5">
            <p className="line-clamp-2 text-sm font-medium">{item.title}</p>
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span className="line-clamp-1">{item.subtitle}</span>
              <span className="shrink-0">{item.timestamp}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
