export interface KnowledgeOverview {
  totalDocuments: number
  productFamilies: number
  lastIndexed: string
  storageUsed: string
}

export interface AiUsageSummary {
  questionsAsked: number
  averageResponseTime: string
  documentsReferenced: number
  successfulAnswers: number
}

export type ConversationStatus = "answered" | "refused"

export interface RecentConversationItem {
  id: string
  question: string
  status: ConversationStatus
  timestamp: string
}

export interface RecentDocumentItem {
  id: string
  name: string
  uploadedAt: string
  chunkCount: number
}

export interface ProductFamilyCoverageItem {
  label: string
  documentCount: number
  percentage: number
}

export interface DashboardSnapshot {
  overview: KnowledgeOverview
  aiUsage: AiUsageSummary
  recentConversations: RecentConversationItem[]
  recentDocuments: RecentDocumentItem[]
  productFamilyCoverage: ProductFamilyCoverageItem[]
}
