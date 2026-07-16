"use client"

import * as React from "react"

import { getAdminStatus, getVectorStoreStatus } from "@/lib/api/admin"
import {
  chunkDocument,
  embedChunks,
  storeEmbeddings,
  uploadPdf,
} from "@/lib/api/documents"
import { friendlyErrorMessage } from "@/lib/api/errors"
import {
  initialActivity,
  initialDocuments,
  initialHealth,
  initialStatistics,
  systemInformation,
} from "@/lib/admin-mock"
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

export function useAdmin() {
  const [documents, setDocuments] = React.useState<AdminDocument[]>(
    initialDocuments
  )
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

    function fail(error: unknown) {
      const message = friendlyErrorMessage(error)
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
      setUpload({ fileName, stageIndex: 1, percent: percentForStage(1) })

      const chunkResult = await chunkDocument({
        document_id: uploadResult.id,
        parse_result: uploadResult.parse_result,
      })
      setUpload({ fileName, stageIndex: 2, percent: percentForStage(2) })

      const embeddingResult = await embedChunks(chunkResult)
      setUpload({ fileName, stageIndex: 3, percent: percentForStage(3) })

      await storeEmbeddings(embeddingResult)
      setUpload({ fileName, stageIndex: 4, percent: percentForStage(4) })

      setUpload({ fileName, stageIndex: 5, percent: percentForStage(5) })
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === localDocId
            ? { ...doc, status: "indexed", chunks: chunkResult.total_chunks }
            : doc
        )
      )
      setStatistics((prev) => ({
        ...prev,
        indexedDocuments: prev.indexedDocuments + 1,
        totalChunks: prev.totalChunks + chunkResult.total_chunks,
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
      fail(error)
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
