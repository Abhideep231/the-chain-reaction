import type {
  ActivityLogEntry,
  AdminDocument,
  KnowledgeStatistics,
  SystemHealthService,
  SystemInformation,
} from "@/types/admin"

/**
 * Static, hand-authored mock data for the Admin Control Center. There is
 * no document store, health-check service, or ingestion pipeline yet —
 * Sprint 7 is frontend-only. The document table below is a
 * representative page of results, not the full knowledge base — real
 * admin tables paginate, and the aggregate counts in
 * `initialStatistics` come from what would be a separate stats
 * endpoint in a real system, the same way it works today.
 */

export const initialDocuments: AdminDocument[] = [
  {
    id: "doc-engineering-handbook",
    name: "Engineering Handbook",
    documentType: "Handbook",
    version: "v3.0",
    status: "indexed",
    chunks: 1842,
    lastUpdated: "Apr 18, 2026",
  },
  {
    id: "doc-elite-catalogue",
    name: "Elite Catalogue",
    documentType: "Catalogue",
    version: "v2.0",
    status: "indexed",
    chunks: 1024,
    lastUpdated: "3 hours ago",
  },
  {
    id: "doc-drive-systems-catalogue",
    name: "Drive Systems Catalogue",
    documentType: "Catalogue",
    version: "v1.4",
    status: "processing",
    chunks: 0,
    lastUpdated: "8 minutes ago",
  },
  {
    id: "doc-roller-chain-catalogue",
    name: "Roller Chain Catalogue",
    documentType: "Catalogue",
    version: "v4.2",
    status: "indexed",
    chunks: 3116,
    lastUpdated: "Jun 02, 2026",
  },
  {
    id: "doc-maintenance-manual",
    name: "Maintenance Manual",
    documentType: "Manual",
    version: "v5.0",
    status: "indexed",
    chunks: 742,
    lastUpdated: "Mar 30, 2026",
  },
  {
    id: "doc-application-guide",
    name: "Application Guide",
    documentType: "Guide",
    version: "v1.0",
    status: "pending",
    chunks: 0,
    lastUpdated: "Yesterday",
  },
  {
    id: "doc-datasheet-library",
    name: "Datasheet Library",
    documentType: "Datasheet",
    version: "v1.3",
    status: "failed",
    chunks: 0,
    lastUpdated: "2 days ago",
  },
]

export const initialStatistics: KnowledgeStatistics = {
  totalDocuments: 252,
  totalChunks: 18640,
  indexedDocuments: 247,
  pendingDocuments: 3,
  failedDocuments: 2,
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
  },
  {
    id: "embedding-service",
    name: "Embedding Service",
    status: "operational",
    lastChecked: "Just now",
    responseTime: "180 ms",
  },
  {
    id: "parser",
    name: "Parser",
    status: "operational",
    lastChecked: "Just now",
    responseTime: "220 ms",
  },
  {
    id: "chunking-engine",
    name: "Chunking Engine",
    status: "operational",
    lastChecked: "Just now",
    responseTime: "95 ms",
  },
  {
    id: "chromadb",
    name: "ChromaDB",
    status: "operational",
    lastChecked: "Just now",
    responseTime: "12 ms",
  },
  {
    id: "retrieval-engine",
    name: "Retrieval Engine",
    status: "operational",
    lastChecked: "1 min ago",
    responseTime: "340 ms",
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
