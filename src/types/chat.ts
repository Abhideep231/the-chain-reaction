export type ConfidenceLevel = "high" | "medium" | "low"

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

export interface AnswerParameter {
  label: string
  value: string
}

export interface EngineeringAnswer {
  summary: string
  confidence: ConfidenceLevel
  parameters?: AnswerParameter[]
  citations: Citation[]
  retrievedDocuments: RetrievedDocument[]
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  answer?: EngineeringAnswer
}
