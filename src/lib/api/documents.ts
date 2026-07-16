import { apiClient } from "@/lib/api/client"
import type {
  ChunkingResult,
  ChunkRequest,
  DeleteDocumentResult,
  DocumentListResponse,
  DocumentUploadResult,
  EmbeddingResult,
  StoreEmbeddingsResult,
} from "@/lib/api/types"

/** GET /documents — real documents, aggregated server-side from their
 * stored chunks (Sprint 20); see app/api/routes/documents.py. */
export function listDocuments(): Promise<DocumentListResponse> {
  return apiClient.get<DocumentListResponse>("/documents")
}

/** DELETE /vectorstore/document/{id} — the Knowledge Library's delete
 * action. Lives under /vectorstore on the backend (it operates on the
 * vector store's per-document data and cleans up the uploaded file
 * alongside it), but is unambiguously a "document" action from the
 * frontend's perspective. */
export function deleteDocument(documentId: string): Promise<DeleteDocumentResult> {
  return apiClient.del<DeleteDocumentResult>(
    `/vectorstore/document/${encodeURIComponent(documentId)}`
  )
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
