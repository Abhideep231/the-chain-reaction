"use client"

import * as React from "react"

import {
  adaptAiUsageSummary,
  adaptKnowledgeOverview,
  adaptProductFamilyCoverage,
  adaptRecentConversations,
  adaptRecentDocuments,
} from "@/lib/api/adapters"
import { getDashboardAnalytics } from "@/lib/api/dashboard"
import { listDocuments } from "@/lib/api/documents"
import type { AnalyticsSnapshot, DocumentListResponse } from "@/lib/api/types"
import type { DashboardSnapshot } from "@/types/dashboard"

/** Every field on the Dashboard is real, sourced from `GET /documents`
 * and `GET /dashboard/analytics` — there is no mock fallback left to
 * fall back to. A request that fails leaves its half of the snapshot
 * at `null`, which the adapters below render as honest zeros/empty
 * lists rather than stale or invented data. */
export function useDashboard() {
  const [documentsResponse, setDocumentsResponse] =
    React.useState<DocumentListResponse | null>(null)
  const [analytics, setAnalytics] = React.useState<AnalyticsSnapshot | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  const load = React.useCallback(() => {
    setIsLoading(true)
    let cancelled = false

    Promise.allSettled([listDocuments(), getDashboardAnalytics()]).then((results) => {
      if (cancelled) return
      const [documentsResult, analyticsResult] = results
      setDocumentsResponse(documentsResult.status === "fulfilled" ? documentsResult.value : null)
      setAnalytics(analyticsResult.status === "fulfilled" ? analyticsResult.value : null)
      setIsLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [])

  React.useEffect(() => load(), [load])

  const snapshot: DashboardSnapshot = React.useMemo(
    () => ({
      overview: adaptKnowledgeOverview(documentsResponse),
      aiUsage: adaptAiUsageSummary(analytics),
      recentConversations: adaptRecentConversations(analytics),
      recentDocuments: adaptRecentDocuments(documentsResponse),
      productFamilyCoverage: adaptProductFamilyCoverage(documentsResponse),
    }),
    [documentsResponse, analytics]
  )

  return {
    snapshot,
    isLoading,
    refresh: load,
  }
}
