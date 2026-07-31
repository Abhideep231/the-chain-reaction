import { apiClient } from "@/lib/api/client"
import type {
  DeleteDocumentResult,
  DocumentListResponse,
  DocumentUploadAccepted,
  IndexingJob,
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

/** POST /documents/upload — validates and saves the PDF, then returns
 * immediately with status "processing". Parsing, chunking, embedding,
 * and storing all happen afterward in a backend background job — poll
 * `getDocumentStatus` for progress rather than driving those stages
 * from the client (the previous design, which round-tripped every
 * chunk's full text, and every embedding's actual vector, through the
 * browser between separate /documents/chunk, /documents/embed, and
 * /documents/store calls). */
export function uploadPdf(file: File): Promise<DocumentUploadAccepted> {
  const formData = new FormData()
  formData.append("file", file)
  return apiClient.postForm<DocumentUploadAccepted>("/documents/upload", formData)
}

/** GET /documents/{id}/status — the real, current state of a document's
 * indexing job (see app/services/indexing). */
export function getDocumentStatus(documentId: string): Promise<IndexingJob> {
  return apiClient.get<IndexingJob>(`/documents/${encodeURIComponent(documentId)}/status`)
}
