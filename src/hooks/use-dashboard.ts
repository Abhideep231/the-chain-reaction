"use client"

import * as React from "react"

import {
  adaptDocumentStatusBreakdown,
  adaptIndexedPassagesMetric,
  adaptRecentlyIndexed,
  adaptTotalDocumentsMetric,
} from "@/lib/api/adapters"
import { getVectorStoreStatus } from "@/lib/api/admin"
import { listDocuments } from "@/lib/api/documents"
import type { DocumentListResponse, VectorStoreStatus } from "@/lib/api/types"
import { getDashboardSnapshot } from "@/lib/dashboard-mock"
import type { SystemComponentStatus, TimeRange } from "@/types/dashboard"

export function useDashboard() {
  const [range, setRange] = React.useState<TimeRange>("7d")

  // Sprint 21: everything genuinely derivable from a real endpoint is
  // real — total documents and indexed passages (GET /documents,
  // GET /vectorstore/status), the document status breakdown and
  // recently-indexed feed (both from GET /documents), and the
  // ChromaDB system-health tile (GET /vectorstore/status, real since
  // Sprint 16). Everything else on this dashboard (the other 4 KPIs,
  // the document-type/product-family breakdowns, "Recently Updated",
  // "Recent AI Questions", "Top Referenced Documents", and the other 4
  // system-health tiles) has no backing endpoint anywhere in the
  // backend — none of it is a logged/aggregated statistic anywhere,
  // only ever computed fresh per-request — so it stays on the Sprint 5
  // mock, per the "don't invent data" rule, clearly isolated here by
  // only ever touching the specific snapshot fields listed above.
  const [documentsResponse, setDocumentsResponse] =
    React.useState<DocumentListResponse | null>(null)
  const [vectorStoreStatus, setVectorStoreStatus] =
    React.useState<VectorStoreStatus | null>(null)

  React.useEffect(() => {
    let cancelled = false

    listDocuments()
      .then((response) => {
        if (!cancelled) setDocumentsResponse(response)
      })
      .catch(() => {
        // Left null — the derived fields render their own honest
        // "unavailable" fallback rather than stale or invented values.
      })

    getVectorStoreStatus()
      .then((status) => {
        if (!cancelled) setVectorStoreStatus(status)
      })
      .catch(() => {
        if (!cancelled) {
          setVectorStoreStatus({
            collection_exists: false,
            collection_name: "",
            total_vectors: 0,
            embedding_model: null,
            vector_dimension: null,
            database_path: "",
            health: "unhealthy",
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const snapshot = React.useMemo(() => {
    const base = getDashboardSnapshot(range)

    const chromaStatus: SystemComponentStatus =
      vectorStoreStatus?.health === "ok" ? "operational" : "down"
    const chromaMetricValue = vectorStoreStatus
      ? vectorStoreStatus.collection_exists
        ? `${vectorStoreStatus.total_vectors.toLocaleString("en-US")} vector${
            vectorStoreStatus.total_vectors === 1 ? "" : "s"
          }`
        : "No collection yet"
      : undefined

    return {
      ...base,
      metrics: base.metrics.map((metric) => {
        if (metric.id === "total-documents") return adaptTotalDocumentsMetric(documentsResponse)
        if (metric.id === "indexed-passages") return adaptIndexedPassagesMetric(vectorStoreStatus)
        return metric
      }),
      knowledgeHealth: {
        ...base.knowledgeHealth,
        documentStatus: adaptDocumentStatusBreakdown(documentsResponse),
      },
      recentlyIndexed: adaptRecentlyIndexed(documentsResponse),
      systemHealth: base.systemHealth.map((service) =>
        service.id === "chromadb" && chromaMetricValue
          ? {
              ...service,
              status: chromaStatus,
              metricLabel: "Total vectors",
              metricValue: chromaMetricValue,
              lastChecked: "Just now",
            }
          : service
      ),
    }
  }, [range, documentsResponse, vectorStoreStatus])

  return {
    range,
    setRange,
    snapshot,
  }
}
