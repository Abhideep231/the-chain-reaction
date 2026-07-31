/**
 * TypeScript mirrors of the backend's Pydantic schemas (Sprints 9-15).
 * Field names and shapes are kept identical to the Python models they
 * represent so a schema change on either side is easy to spot as a diff
 * here — this file has no independent shape of its own.
 */

// ---- app/schemas/health.py, app/schemas/admin.py ----

export interface HealthResponse {
  status: string
  app_name: string
  version: string
  environment: string
}

export interface AdminStatusResponse {
  status: string
  app_name: string
  version: string
  environment: string
  uptime_seconds: number
}

// ---- app/schemas/documents.py ----

export interface DocumentSummary {
  id: string
  filename: string
  status: string
  page_count: number | null
  chunk_count: number
  file_size_bytes: number | null
  uploaded_at: string | null
}

export interface DocumentListResponse {
  documents: DocumentSummary[]
  total: number
}

/** POST /documents/upload's immediate response — parsing, chunking,
 * embedding, and storing all happen afterward in a background job on
 * the backend (see app/services/indexing). Poll
 * GET /documents/{id}/status (`IndexingJob` below) for progress. */
export interface DocumentUploadAccepted {
  id: string
  filename: string
  status: "processing"
}

export interface RetrievalRequest {
  query: string
  top_k?: number
  similarity_threshold?: number
}

// ---- app/services/indexing/models.py ----

export type IndexingStage = "parsing" | "chunking" | "embedding" | "storing" | "completed"
export type IndexingStatus = "processing" | "indexed" | "failed"

export interface IndexingJob {
  id: string
  filename: string
  status: IndexingStatus
  stage: IndexingStage
  page_count: number | null
  chunk_count: number
  error: string | null
}

// ---- app/services/vectorstore/models.py ----

export interface VectorStoreStatus {
  collection_exists: boolean
  collection_name: string
  total_vectors: number
  embedding_model: string | null
  vector_dimension: number | null
  database_path: string
  health: string
}

export interface DeleteDocumentResult {
  document_id: string
  deleted_count: number
}

// ---- app/services/retrieval/models.py ----

export interface RetrievalMetadata {
  filename: string
  created_at: string
}

export interface RetrievalResult {
  document_id: string
  chunk_id: string
  chunk_index: number
  page_number: number
  similarity_score: number
  chunk_text: string
  metadata: RetrievalMetadata
  embedding_model: string
}

export interface RetrievalResponse {
  query: string
  results: RetrievalResult[]
}

// ---- app/services/claude/models.py ----

export interface ClaudeCitation {
  document_id: string
  filename: string
  page_number: number
  chunk_id: string
  similarity_score: number
  snippet: string
}

export interface AskResponse {
  answer: string
  citations: ClaudeCitation[]
  confidence: number
  response_time_ms: number
  model: string
  session_id: string
}

// ---- app/services/calculations/models.py ----

export type ApiChainType =
  | "Roller Chain"
  | "Conveyor Chain"
  | "Attachment Chain"
  | "Engineering Class Chain"
export type ApiChainStandard = "ISO 606" | "ANSI B29.1"
export type ApiShockLoad = "None" | "Moderate" | "Heavy"
export type ApiLubricationType = "Manual" | "Drip" | "Oil Bath" | "Forced Circulation"
export type ApiDutyCycle = "Continuous" | "Intermittent" | "Occasional"
export type ApiResultStatus = "good" | "warning" | "critical"

export interface ChainSelectionInput {
  chain_type: ApiChainType
  chain_standard: ApiChainStandard
  pitch: number
  number_of_teeth: number
  driver_rpm: number
  driven_rpm: number
  power_kw: number
  torque: number
  service_factor: number
  shock_load: ApiShockLoad
  temperature: number
  lubrication: ApiLubricationType
  operating_hours: number
  duty_cycle: ApiDutyCycle
}

export interface ApiResultCard {
  id: string
  title: string
  value: string
  unit: string | null
  status: ApiResultStatus
}

export interface ApiRecommendation {
  chain_id: string
  chain_label: string
  reason: string
  expected_life_label: string
  explanation: string[]
}

export interface ChainSelectionResult {
  result_cards: ApiResultCard[]
  recommendation: ApiRecommendation
}

// ---- app/schemas/calculations.py ----

export type CalculationType = "chain_selection"

export interface CalculationRequest {
  calculation_type: CalculationType
  inputs: ChainSelectionInput
}

export interface CalculationResponse {
  calculation_type: CalculationType
  result: ChainSelectionResult
  explanation: string | null
}

// ---- app/services/analytics/models.py ----

export type ExchangeStatus = "answered" | "refused"

export interface ConversationExchange {
  id: string
  question: string
  answer: string
  status: ExchangeStatus
  response_time_ms: number
  documents_referenced: number
  timestamp: string
}

export interface AnalyticsSnapshot {
  total_questions: number
  successful_answers: number
  refused_answers: number
  average_response_time_ms: number | null
  documents_referenced: number
  recent_conversations: ConversationExchange[]
}
