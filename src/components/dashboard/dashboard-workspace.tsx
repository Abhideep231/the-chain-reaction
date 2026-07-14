"use client"

import { DashboardGrid } from "@/components/dashboard/dashboard-grid"
import { DashboardToolbar } from "@/components/dashboard/dashboard-toolbar"
import { EmptyDashboard } from "@/components/dashboard/empty-dashboard"
import { useDashboard } from "@/hooks/use-dashboard"

export function DashboardWorkspace() {
  const { range, setRange, snapshot } = useDashboard()

  const totalDocuments = snapshot.knowledgeHealth.documentStatus.reduce(
    (sum, item) => sum + item.value,
    0
  )

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-6 overflow-y-auto">
      <DashboardToolbar range={range} onRangeChange={setRange} />
      {totalDocuments === 0 ? (
        <EmptyDashboard />
      ) : (
        <DashboardGrid snapshot={snapshot} />
      )}
    </div>
  )
}
