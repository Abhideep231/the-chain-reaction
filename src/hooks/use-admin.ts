"use client"

import * as React from "react"

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
  UploadProgress,
} from "@/types/admin"
import { UPLOAD_STAGES } from "@/types/admin"

const STAGE_DELAY_MS = 500
const NEW_DOCUMENT_CHUNKS = 860

export function useAdmin() {
  const [documents, setDocuments] = React.useState<AdminDocument[]>(
    initialDocuments
  )
  const [statistics, setStatistics] = React.useState(initialStatistics)
  const [activity, setActivity] = React.useState(initialActivity)
  const [upload, setUpload] = React.useState<UploadProgress | null>(null)

  const startUpload = React.useCallback((fileName = "New-Document.pdf") => {
    setUpload({ fileName, stageIndex: 0, percent: 0 })

    const newDocId = `doc-upload-${Date.now()}`
    setDocuments((prev) => [
      {
        id: newDocId,
        name: fileName.replace(/\.pdf$/i, ""),
        documentType: "Datasheet",
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

    UPLOAD_STAGES.forEach((_, index) => {
      window.setTimeout(() => {
        setUpload({
          fileName,
          stageIndex: index,
          percent: Math.round((index / (UPLOAD_STAGES.length - 1)) * 100),
        })
      }, index * STAGE_DELAY_MS)
    })

    window.setTimeout(
      () => {
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.id === newDocId
              ? { ...doc, status: "indexed", chunks: NEW_DOCUMENT_CHUNKS }
              : doc
          )
        )
        setStatistics((prev) => ({
          ...prev,
          indexedDocuments: prev.indexedDocuments + 1,
          totalChunks: prev.totalChunks + NEW_DOCUMENT_CHUNKS,
        }))
        setActivity((prev) => [
          {
            id: `act-upload-${Date.now()}`,
            message: `${fileName.replace(/\.pdf$/i, "")} indexed`,
            timestamp: "Just now",
          },
          ...prev,
        ])
      },
      (UPLOAD_STAGES.length - 1) * STAGE_DELAY_MS
    )
  }, [])

  const dismissUpload = React.useCallback(() => setUpload(null), [])

  const summary: AdminSummary = React.useMemo(
    () => ({
      knowledgeBaseStatus: "Healthy",
      documentsIndexed: statistics.indexedDocuments,
      chunks: statistics.totalChunks,
      lastSynchronization: statistics.lastSynchronization,
    }),
    [statistics]
  )

  return {
    documents,
    statistics,
    health: initialHealth,
    activity,
    systemInfo: systemInformation,
    summary,
    upload,
    startUpload,
    dismissUpload,
  }
}
