"use client"

import * as React from "react"

import { getVectorStoreStatus } from "@/lib/api/admin"
import { getDashboardSnapshot } from "@/lib/dashboard-mock"
import type { SystemComponentStatus, TimeRange } from "@/types/dashboard"

interface LiveChromaHealth {
  status: SystemComponentStatus
  metricValue: string
}

export function useDashboard() {
  const [range, setRange] = React.useState<TimeRange>("7d")

  // Every metric on this dashboard (KPIs, knowledge health breakdown,
  // recent activity, top-referenced documents) has no backend analytics
  // endpoint behind it anywhere in Sprints 9-15 and stays on the Sprint 5
  // mock, per the integration brief's "don't invent data for endpoints
  // that don't exist" rule. The one exception is the ChromaDB tile in
  // System Health, which GET /vectorstore/status backs for real — that
  // single entry is overlaid with a live reading below.
  const [liveChromaHealth, setLiveChromaHealth] =
    React.useState<LiveChromaHealth | null>(null)

  React.useEffect(() => {
    let cancelled = false

    getVectorStoreStatus()
      .then((status) => {
        if (cancelled) return
        setLiveChromaHealth({
          status: status.health === "ok" ? "operational" : "down",
          metricValue: status.collection_exists
            ? `${status.total_vectors.toLocaleString("en-US")} vectors`
            : "No collection yet",
        })
      })
      .catch(() => {
        if (cancelled) return
        setLiveChromaHealth({ status: "down", metricValue: "Unreachable" })
      })

    return () => {
      cancelled = true
    }
  }, [])

  const snapshot = React.useMemo(() => {
    const base = getDashboardSnapshot(range)
    if (!liveChromaHealth) return base

    return {
      ...base,
      systemHealth: base.systemHealth.map((service) =>
        service.id === "chromadb"
          ? {
              ...service,
              status: liveChromaHealth.status,
              metricValue: liveChromaHealth.metricValue,
              lastChecked: "Just now",
            }
          : service
      ),
    }
  }, [range, liveChromaHealth])

  return {
    range,
    setRange,
    snapshot,
  }
}
