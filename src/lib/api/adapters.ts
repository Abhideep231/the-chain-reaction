import type { AskResponse, DocumentSummary } from "@/lib/api/types"
import type { Citation, EngineeringAnswer, RetrievedDocument } from "@/types/chat"
import type { LibraryDocument } from "@/types/library"
import type { ConfidenceLevel } from "@/types/shared"

/** Backend confidence is the best-matching chunk's own similarity score
 * (0-1, see app/services/claude/claude_service.py) — not a discrete
 * level, so it's bucketed here into the three-level scale the existing
 * UI already renders (ConfidenceIndicator, AnswerCard). */
function toConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= 0.8) return "high"
  if (confidence >= 0.5) return "medium"
  return "low"
}

function toPercent(score: number): number {
  return Math.round(score * 100)
}

/** Maps `POST /chat/ask`'s response onto the frontend's `EngineeringAnswer`
 * shape (Sprint 2) so the existing Ask AI UI needs no changes. The backend
 * doesn't return a chunk-text snippet on `ClaudeCitation` (only
 * document/page/chunk identifiers and a score), so `snippet` falls back to
 * a page reference rather than inventing quoted text that was never
 * returned. */
export function adaptAskResponse(response: AskResponse): EngineeringAnswer {
  const citations: Citation[] = response.citations.map((citation) => ({
    id: citation.chunk_id,
    title: citation.filename,
    source: citation.filename,
    section: `Page ${citation.page_number}`,
    snippet: `Retrieved from page ${citation.page_number}, chunk ${citation.chunk_id}.`,
    relevance: toPercent(citation.similarity_score),
  }))

  const seenDocumentIds = new Set<string>()
  const retrievedDocuments: RetrievedDocument[] = []
  for (const citation of response.citations) {
    if (seenDocumentIds.has(citation.document_id)) continue
    seenDocumentIds.add(citation.document_id)
    retrievedDocuments.push({
      id: citation.document_id,
      name: citation.filename,
      type: "PDF",
      matchScore: toPercent(citation.similarity_score),
    })
  }

  return {
    summary: response.answer,
    confidence: toConfidenceLevel(response.confidence),
    citations,
    retrievedDocuments,
  }
}

/** Maps `GET /documents`'s minimal `DocumentSummary` (id, filename,
 * status, page_count) onto the richer `LibraryDocument` shape the
 * Knowledge Library UI (Sprint 4) expects. The backend doesn't track
 * category, product family, revisions, tags, or notes for a document,
 * so those fields fall back to neutral placeholders rather than
 * fabricated values — this only runs at all once a real document
 * appears in a real (currently always-empty) listing. */
export function adaptDocumentSummary(summary: DocumentSummary): LibraryDocument {
  return {
    id: summary.id,
    title: summary.filename,
    category: "Product Literature",
    productFamily: "General",
    documentType: "Manual",
    revision: "—",
    version: "—",
    fileSize: "—",
    pageCount: summary.page_count ?? 0,
    lastUpdated: "—",
    status: summary.status.toLowerCase().includes("approved") ? "approved" : "draft",
    previewKind: "manual",
    tags: [],
    engineeringNotes: "",
    relatedDocumentIds: [],
    revisionHistory: [],
  }
}
