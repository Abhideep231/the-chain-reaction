import { apiClient } from "@/lib/api/client"
import type {
  ChunkingResult,
  ChunkRequest,
  DocumentListResponse,
  DocumentUploadResult,
  EmbeddingResult,
  StoreEmbeddingsResult,
} from "@/lib/api/types"

/** GET /documents — real, callable, and currently always empty; see
 * app/api/routes/documents.py. Wiring it up here is what lets the
 * Knowledge Library show its genuine (empty) state instead of mock rows. */
export function listDocuments(): Promise<DocumentListResponse> {
  return apiClient.get<DocumentListResponse>("/documents")
}

/** POST /documents/upload — validates, saves, and parses the PDF in one
 * call (parsing happens server-side as part of this request). */
export function uploadPdf(file: File): Promise<DocumentUploadResult> {
  const formData = new FormData()
  formData.append("file", file)
  return apiClient.postForm<DocumentUploadResult>("/documents/upload", formData)
}

export function chunkDocument(request: ChunkRequest): Promise<ChunkingResult> {
  return apiClient.post<ChunkingResult>("/documents/chunk", request)
}

export function embedChunks(request: ChunkingResult): Promise<EmbeddingResult> {
  return apiClient.post<EmbeddingResult>("/documents/embed", request)
}

export function storeEmbeddings(
  request: EmbeddingResult
): Promise<StoreEmbeddingsResult> {
  return apiClient.post<StoreEmbeddingsResult>("/documents/store", request)
}
