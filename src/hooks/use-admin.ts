"use client"

import * as React from "react"

import { adaptAdminDocumentCounts, adaptAdminDocuments } from "@/lib/api/adapters"
import { getAdminStatus, getVectorStoreStatus } from "@/lib/api/admin"
import { getDocumentStatus, listDocuments, uploadPdf } from "@/lib/api/documents"
import { friendlyErrorMessage } from "@/lib/api/errors"
import {
  initialActivity,
  initialHealth,
  initialStatistics,
  systemInformation,
} from "@/lib/admin-mock"
import type { IndexingJob, IndexingStage } from "@/lib/api/types"
import type {
  AdminDocument,
  AdminSummary,
  KnowledgeBaseStatus,
  SystemHealthService,
  UploadProgress,
} from "@/types/admin"
import { UPLOAD_STAGES } from "@/types/admin"

const LAST_STAGE_INDEX = UPLOAD_STAGES.length - 1

function percentForStage(stageIndex: number): number {
  return Math.round((stageIndex / LAST_STAGE_INDEX) * 100)
}

// UPLOAD_STAGES is ["Uploading", "Parsing", "Chunking", "Generating
// Embeddings", "Updating Vector Database", "Completed"] — index 0 is a
// client-only phase (the multipart request itself, before a backend job
// even exists); the rest map directly onto the real IndexingStage the
// backend reports at GET /documents/{id}/status.
const STAGE_INDEX: Record<IndexingStage, number> = {
  parsing: 1,
  chunking: 2,
  embedding: 3,
  storing: 4,
  completed: 5,
}

const POLL_INTERVAL_MS = 1200

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function useAdmin() {
  // Document Management starts empty and is filled from the same real
  // GET /documents Knowledge Library uses (Sprint 20) — never the old
  // Sprint 7 mock rows, which showed documents nobody had ever uploaded.
  const [documents, setDocuments] = React.useState<AdminDocument[]>([])
  const [statistics, setStatistics] = React.useState(initialStatistics)
  const [activity, setActivity] = React.useState(initialActivity)
  const [upload, setUpload] = React.useState<UploadProgress | null>(null)

  // The five services below (claude-api, embedding-service, parser,
  // chunking-engine, retrieval-engine) have no dedicated health-check
  // endpoint anywhere in the backend (Sprints 9-15) and stay on the
  // Sprint 7 mock. ChromaDB does have one — GET /vectorstore/status — so
  // that single entry is overlaid with a live reading on mount.
  const [health, setHealth] = React.useState<SystemHealthService[]>(initialHealth)
  const [knowledgeBaseStatus, setKnowledgeBaseStatus] =
    React.useState<KnowledgeBaseStatus>("Healthy")

  React.useEffect(() => {
    let cancelled = false

    Promise.all([getAdminStatus(), getVectorStoreStatus()])
      .then(([, vectorStoreStatus]) => {
        if (cancelled) return
        const isHealthy = vectorStoreStatus.health === "ok"
        setHealth((prev) =>
          prev.map((service) =>
            service.id === "chromadb"
              ? {
                  ...service,
                  status: isHealthy ? "operational" : "offline",
                  lastChecked: "Just now",
                  metricLabel: vectorStoreStatus.collection_exists
                    ? "Total vectors"
                    : "Response time",
                  responseTime: vectorStoreStatus.collection_exists
                    ? `${vectorStoreStatus.total_vectors.toLocaleString("en-US")} vector${
                        vectorStoreStatus.total_vectors === 1 ? "" : "s"
                      }`
                    : "No collection yet",
                }
              : service
          )
        )
        setKnowledgeBaseStatus(isHealthy ? "Healthy" : "Critical")
      })
      .catch(() => {
        if (cancelled) return
        setHealth((prev) =>
          prev.map((service) =>
            service.id === "chromadb"
              ? { ...service, status: "offline", lastChecked: "Unreachable" }
              : service
          )
        )
        setKnowledgeBaseStatus("Critical")
      })

    return () => {
      cancelled = true
    }
  }, [])

  React.useEffect(() => {
    let cancelled = false

    listDocuments()
      .then((response) => {
        if (cancelled) return
        setDocuments(adaptAdminDocuments(response))
        setStatistics((prev) => ({ ...prev, ...adaptAdminDocumentCounts(response) }))
      })
      .catch(() => {
        // Left empty — the table's own empty state renders honestly
        // rather than showing stale or invented documents.
      })

    return () => {
      cancelled = true
    }
  }, [])

  const startUpload = React.useCallback(async (file: File) => {
    const fileName = file.name
    const documentLabel = fileName.replace(/\.pdf$/i, "")
    const localDocId = `doc-upload-${Date.now()}`

    setUpload({ fileName, stageIndex: 0, percent: percentForStage(0) })
    setDocuments((prev) => [
      {
        id: localDocId,
        name: documentLabel,
        documentType: "Uploaded PDF",
        version: "v1.0",
        status: "processing",
        chunks: 0,
        lastUpdated: "Just now",
      },
      ...prev,
    ])
    setStatistics((prev) => ({
      ...prev,
      totalDocuments: prev.totalDocuments + 1,
    }))

    function fail(message: string) {
      setUpload((prev) => (prev ? { ...prev, error: message } : prev))
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === localDocId ? { ...doc, status: "failed" } : doc
        )
      )
      setActivity((prev) => [
        {
          id: `act-upload-failed-${Date.now()}`,
          message: `${documentLabel} failed to index — ${message}`,
          timestamp: "Just now",
        },
        ...prev,
      ])
    }

    try {
      const uploadResult = await uploadPdf(file)

      // The backend owns the entire parse -> chunk -> embed -> store
      // pipeline as one background job (see app/services/indexing) —
      // poll its real, current state rather than driving each stage
      // from here. This also means no chunk text or embedding vector
      // is ever round-tripped through the browser.
      let job: IndexingJob = await getDocumentStatus(uploadResult.id)
      while (job.status === "processing") {
        const stageIndex = STAGE_INDEX[job.stage]
        setUpload({ fileName, stageIndex, percent: percentForStage(stageIndex) })
        await sleep(POLL_INTERVAL_MS)
        job = await getDocumentStatus(uploadResult.id)
      }

      const finalStageIndex = STAGE_INDEX[job.stage]
      setUpload({ fileName, stageIndex: finalStageIndex, percent: percentForStage(finalStageIndex) })

      if (job.status === "failed") {
        fail(job.error ?? "Indexing failed.")
        return
      }

      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === localDocId
            ? { ...doc, status: "indexed", chunks: job.chunk_count }
            : doc
        )
      )
      setStatistics((prev) => ({
        ...prev,
        indexedDocuments: prev.indexedDocuments + 1,
        totalChunks: prev.totalChunks + job.chunk_count,
      }))
      setActivity((prev) => [
        {
          id: `act-upload-${Date.now()}`,
          message: `${documentLabel} indexed`,
          timestamp: "Just now",
        },
        ...prev,
      ])
    } catch (error) {
      fail(friendlyErrorMessage(error))
    }
  }, [])

  const dismissUpload = React.useCallback(() => setUpload(null), [])

  const summary: AdminSummary = React.useMemo(
    () => ({
      knowledgeBaseStatus,
      documentsIndexed: statistics.indexedDocuments,
      chunks: statistics.totalChunks,
      lastSynchronization: statistics.lastSynchronization,
    }),
    [knowledgeBaseStatus, statistics]
  )

  return {
    documents,
    statistics,
    health,
    activity,
    systemInfo: systemInformation,
    summary,
    upload,
    startUpload,
    dismissUpload,
  }
}
