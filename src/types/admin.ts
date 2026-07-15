export type DocumentStatus = "indexed" | "processing" | "pending" | "failed"

export interface AdminDocument {
  id: string
  name: string
  documentType: string
  version: string
  status: DocumentStatus
  chunks: number
  lastUpdated: string
}

export type ServiceStatus = "operational" | "warning" | "offline"

export interface SystemHealthService {
  id: string
  name: string
  status: ServiceStatus
  lastChecked: string
  responseTime: string
}

export interface KnowledgeStatistics {
  totalDocuments: number
  totalChunks: number
  indexedDocuments: number
  pendingDocuments: number
  failedDocuments: number
  averageChunkSize: string
  knowledgeCoverage: string
  lastSynchronization: string
}

export interface ActivityLogEntry {
  id: string
  message: string
  timestamp: string
}

export const UPLOAD_STAGES = [
  "Uploading",
  "Parsing",
  "Chunking",
  "Generating Embeddings",
  "Updating Vector Database",
  "Completed",
] as const

export type UploadStage = (typeof UPLOAD_STAGES)[number]

export interface UploadProgress {
  fileName: string
  stageIndex: number
  percent: number
}

export interface SystemInformation {
  applicationVersion: string
  knowledgeBaseVersion: string
  embeddingModel: string
  vectorDatabase: string
  totalStorage: string
  lastBackup: string
  environment: string
}

export type KnowledgeBaseStatus = "Healthy" | "Degraded" | "Critical"

export interface AdminSummary {
  knowledgeBaseStatus: KnowledgeBaseStatus
  documentsIndexed: number
  chunks: number
  lastSynchronization: string
}
