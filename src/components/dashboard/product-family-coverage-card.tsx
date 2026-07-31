import { LibraryIcon } from "lucide-react"

import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state"
import type { ProductFamilyCoverageItem } from "@/types/dashboard"

export function ProductFamilyCoverageCard({ items }: { items: ProductFamilyCoverageItem[] }) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-5">
      <h3 className="text-sm font-semibold">Knowledge Coverage by Product Family</h3>
      {items.length === 0 ? (
        <DashboardEmptyState
          icon={LibraryIcon}
          title="No documents yet"
          subtitle="Coverage by product family will appear once documents are indexed."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.label} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-sm">
                <span>{item.label}</span>
                <span className="text-muted-foreground">
                  {item.documentCount} document{item.documentCount === 1 ? "" : "s"}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-chart-1"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
