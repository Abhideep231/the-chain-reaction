export type { ConfidenceLevel } from "@/types/shared"

import type { ConfidenceLevel, KeyValueItem } from "@/types/shared"

export interface Citation {
  id: string
  title: string
  source: string
  section: string
  snippet: string
  relevance: number
}

export interface RetrievedDocument {
  id: string
  name: string
  type: string
  matchScore: number
}

export interface EngineeringAnswer {
  summary: string
  confidence: ConfidenceLevel
  parameters?: KeyValueItem[]
  citations: Citation[]
  retrievedDocuments: RetrievedDocument[]
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  answer?: EngineeringAnswer
}
