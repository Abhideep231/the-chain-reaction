"use client"

import * as React from "react"

import { getDashboardSnapshot } from "@/lib/dashboard-mock"
import type { TimeRange } from "@/types/dashboard"

export function useDashboard() {
  const [range, setRange] = React.useState<TimeRange>("7d")

  const snapshot = React.useMemo(() => getDashboardSnapshot(range), [range])

  return {
    range,
    setRange,
    snapshot,
  }
}
