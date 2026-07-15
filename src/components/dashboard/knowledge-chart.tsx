import { cn } from "@/lib/utils"

export interface ChartBarItem {
  label: string
  value: number
  colorClassName: string
}

/**
 * A direct-labeled horizontal bar breakdown. Deliberately generic (it
 * only knows about label/value/color, not "document type" or "status")
 * so the same component drives every category breakdown on the
 * dashboard — the caller resolves domain data to a color class.
 */
export function KnowledgeChart({
  title,
  items,
}: {
  title: string
  items: ChartBarItem[]
}) {
  const total = items.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="text-xs text-muted-foreground">{total} total</span>
      </div>
      <div className="flex flex-col gap-2.5">
        {items.map((item) => {
          const percent = total > 0 ? (item.value / total) * 100 : 0
          return (
            <div key={item.label} className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="flex items-center gap-1.5 font-medium">
                  <span
                    className={cn("size-2 shrink-0 rounded-full", item.colorClassName)}
                    aria-hidden
                  />
                  {item.label}
                </span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {item.value} · {percent.toFixed(0)}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full", item.colorClassName)}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
