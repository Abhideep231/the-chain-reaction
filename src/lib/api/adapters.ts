import type {
  AskResponse,
  ChainSelectionInput,
  ChainSelectionResult,
  DocumentSummary,
} from "@/lib/api/types"
import type { Citation, EngineeringAnswer, RetrievedDocument } from "@/types/chat"
import type { CalculationInput, CalculationResult } from "@/types/calculation"
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
 * shape (Sprint 2) so the existing Ask AI UI needs no changes. Citations
 * are deduplicated by chunk id and kept in the order the backend (i.e.
 * retrieval, ranked by similarity) returned them — retrieval shouldn't
 * ever return the same chunk twice, but this keeps that guarantee out of
 * the UI's hands regardless. */
export function adaptAskResponse(response: AskResponse): EngineeringAnswer {
  const seenChunkIds = new Set<string>()
  const citations: Citation[] = []
  for (const citation of response.citations) {
    if (seenChunkIds.has(citation.chunk_id)) continue
    seenChunkIds.add(citation.chunk_id)
    citations.push({
      id: citation.chunk_id,
      title: citation.filename,
      source: citation.filename,
      section: `Page ${citation.page_number}`,
      snippet: citation.snippet,
      relevance: toPercent(citation.similarity_score),
    })
  }

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

/** Maps the frontend's `CalculationInput` (Sprint 6) onto
 * `POST /calculations`'s `ChainSelectionInput` wire shape — a
 * mechanical camelCase-to-snake_case rename, no value changes. */
export function adaptCalculationInput(input: CalculationInput): ChainSelectionInput {
  return {
    chain_type: input.chainType,
    chain_standard: input.chainStandard,
    pitch: input.pitch,
    number_of_teeth: input.numberOfTeeth,
    driver_rpm: input.driverRpm,
    driven_rpm: input.drivenRpm,
    power_kw: input.powerKw,
    torque: input.torque,
    service_factor: input.serviceFactor,
    shock_load: input.shockLoad,
    temperature: input.temperature,
    lubrication: input.lubrication,
    operating_hours: input.operatingHours,
    duty_cycle: input.dutyCycle,
  }
}

/** Maps `POST /calculations`'s `ChainSelectionResult` onto the
 * frontend's `CalculationResult` shape (Sprint 6) so the existing
 * result cards and recommendation card need no changes. */
export function adaptCalculationResult(result: ChainSelectionResult): CalculationResult {
  return {
    resultCards: result.result_cards.map((card) => ({
      id: card.id,
      title: card.title,
      value: card.value,
      unit: card.unit ?? undefined,
      status: card.status,
    })),
    recommendation: {
      chainId: result.recommendation.chain_id,
      chainLabel: result.recommendation.chain_label,
      reason: result.recommendation.reason,
      expectedLifeLabel: result.recommendation.expected_life_label,
      explanation: result.recommendation.explanation,
    },
  }
}
