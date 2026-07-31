"use client"

import { DashboardGrid } from "@/components/dashboard/dashboard-grid"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { useDashboard } from "@/hooks/use-dashboard"

export function DashboardWorkspace() {
  const { snapshot, isLoading, refresh } = useDashboard()

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-6 overflow-y-auto">
      <DashboardHeader onRefresh={refresh} isLoading={isLoading} />
      <DashboardGrid snapshot={snapshot} />
    </div>
  )
}
