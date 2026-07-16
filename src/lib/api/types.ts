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

// ---- app/schemas/pdf.py ----

export interface PdfMetadata {
  filename: string
  title: string | null
  author: string | null
  creator: string | null
  producer: string | null
  subject: string | null
  creation_date: string | null
  modification_date: string | null
  total_pages: number
}

export interface PdfPageContent {
  page_number: number
  extracted_text: string
  character_count: number
  word_count: number
}

export interface PdfParseResult {
  metadata: PdfMetadata
  pages: PdfPageContent[]
}

// ---- app/schemas/documents.py ----

export interface DocumentSummary {
  id: string
  filename: string
  status: string
  page_count: number | null
}

export interface DocumentListResponse {
  documents: DocumentSummary[]
  total: number
}

export interface DocumentUploadResult {
  id: string
  filename: string
  status: string
  parse_result: PdfParseResult
}

export interface ChunkRequest {
  document_id: string
  parse_result: PdfParseResult
}

export interface RetrievalRequest {
  query: string
  top_k?: number
  similarity_threshold?: number
}

// ---- app/services/chunker/models.py ----

export interface ChunkMetadata {
  source_filename: string
  page_number: number
  total_pages: number
  created_at: string
}

export interface Chunk {
  chunk_id: string
  document_id: string
  chunk_index: number
  page_number: number
  text: string
  character_count: number
  estimated_token_count: number
  metadata: ChunkMetadata
}

export interface ChunkingResult {
  total_chunks: number
  chunks: Chunk[]
}

// ---- app/services/embeddings/models.py ----

export interface Embedding {
  embedding_id: string
  document_id: string
  chunk_id: string
  chunk_index: number
  chunk_text: string
  filename: string
  page_number: number
  embedding_model: string
  vector_dimension: number
  embedding: number[]
  created_at: string
}

export interface EmbeddingResult {
  total_embeddings: number
  embedding_model: string
  vector_dimension: number
  embeddings: Embedding[]
}

// ---- app/services/vectorstore/models.py ----

export interface StoreEmbeddingsResult {
  stored_vectors: number
  collection_name: string
  database_path: string
}

export interface VectorStoreStatus {
  collection_exists: boolean
  collection_name: string
  total_vectors: number
  embedding_model: string | null
  vector_dimension: number | null
  database_path: string
  health: string
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
}

export interface AskResponse {
  answer: string
  citations: ClaudeCitation[]
  confidence: number
  response_time_ms: number
  model: string
}
