import type {
  ActivityLogEntry,
  KnowledgeStatistics,
  SystemHealthService,
  SystemInformation,
} from "@/types/admin"

/**
 * Static, hand-authored mock data for the Admin Control Center, for the
 * parts with no real backend equivalent (health checks beyond ChromaDB,
 * activity log, system information). The document table and its
 * associated counts are real — see `adaptAdminDocuments` /
 * `adaptAdminDocumentCounts` in `src/lib/api/adapters.ts` — `initialStatistics`
 * below is only the brief pre-fetch fallback shown before that real data
 * arrives, same convention as the Dashboard (Sprint 21).
 */

export const initialStatistics: KnowledgeStatistics = {
  totalDocuments: 0,
  totalChunks: 0,
  indexedDocuments: 0,
  pendingDocuments: 0,
  failedDocuments: 0,
  averageChunkSize: "~410 tokens",
  knowledgeCoverage: "94%",
  lastSynchronization: "2 minutes ago",
}

export const initialHealth: SystemHealthService[] = [
  {
    id: "claude-api",
    name: "Claude API",
    status: "warning",
    lastChecked: "3 min ago",
    responseTime: "2.4s",
    metricLabel: "Response time",
  },
  {
    id: "embedding-service",
    name: "Embedding Service",
    status: "operational",
    lastChecked: "Just now",
    responseTime: "180 ms",
    metricLabel: "Response time",
  },
  {
    id: "parser",
    name: "Parser",
    status: "operational",
    lastChecked: "Just now",
    responseTime: "220 ms",
    metricLabel: "Response time",
  },
  {
    id: "chunking-engine",
    name: "Chunking Engine",
    status: "operational",
    lastChecked: "Just now",
    responseTime: "95 ms",
    metricLabel: "Response time",
  },
  {
    id: "chromadb",
    name: "ChromaDB",
    status: "operational",
    lastChecked: "Just now",
    responseTime: "12 ms",
    metricLabel: "Response time",
  },
  {
    id: "retrieval-engine",
    name: "Retrieval Engine",
    status: "operational",
    lastChecked: "1 min ago",
    responseTime: "340 ms",
    metricLabel: "Response time",
  },
]

export const initialActivity: ActivityLogEntry[] = [
  {
    id: "act-1",
    message: "Knowledge base synchronized",
    timestamp: "2 minutes ago",
  },
  {
    id: "act-2",
    message: "Parser completed — Drive Systems Catalogue",
    timestamp: "8 minutes ago",
  },
  {
    id: "act-3",
    message: "Embeddings regenerated — Roller Chain Catalogue",
    timestamp: "1 hour ago",
  },
  {
    id: "act-4",
    message: "Elite Catalogue replaced — Rev. B uploaded",
    timestamp: "3 hours ago",
  },
  {
    id: "act-5",
    message: "Engineering Handbook indexed",
    timestamp: "Yesterday",
  },
]

export const systemInformation: SystemInformation = {
  applicationVersion: "v2.3.1",
  knowledgeBaseVersion: "v4.8.0",
  embeddingModel: "text-embedding-3-large",
  vectorDatabase: "ChromaDB v0.5.3",
  totalStorage: "4.2 GB",
  lastBackup: "Jun 13, 2026 · 02:00 UTC",
  environment: "Development",
}
