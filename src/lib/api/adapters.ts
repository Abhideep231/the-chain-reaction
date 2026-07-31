import type {
  AnalyticsSnapshot,
  AskResponse,
  ChainSelectionInput,
  ChainSelectionResult,
  DocumentListResponse,
  DocumentSummary,
} from "@/lib/api/types"
import type { AdminDocument, KnowledgeStatistics } from "@/types/admin"
import type { Citation, EngineeringAnswer, RetrievedDocument } from "@/types/chat"
import type { CalculationInput, CalculationResult } from "@/types/calculation"
import type {
  AiUsageSummary,
  KnowledgeOverview,
  ProductFamilyCoverageItem,
  RecentConversationItem,
  RecentDocumentItem,
} from "@/types/dashboard"
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

const BYTE_UNITS = ["B", "KB", "MB", "GB"] as const

function formatFileSize(bytes: number | null): string {
  if (bytes === null) return "—"
  if (bytes === 0) return "0 B"
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    BYTE_UNITS.length - 1
  )
  const value = bytes / 1024 ** exponent
  return `${exponent === 0 ? value : value.toFixed(1)} ${BYTE_UNITS[exponent]}`
}

function formatUploadedAt(isoTimestamp: string | null): string {
  if (!isoTimestamp) return "—"
  return new Date(isoTimestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  })
}

/** Maps `GET /documents`'s `DocumentSummary` onto the richer
 * `LibraryDocument` shape the Knowledge Library UI (Sprint 4) expects.
 * The backend doesn't track category, product family, revisions, tags,
 * or notes for a document, so those fields fall back to neutral
 * placeholders rather than fabricated values — everything else
 * (file size, page count, chunk count, upload date, status) is real,
 * derived from the document's actual stored chunks (Sprint 20). */
export function adaptDocumentSummary(summary: DocumentSummary): LibraryDocument {
  return {
    id: summary.id,
    title: summary.filename,
    category: "Product Literature",
    productFamily: "General",
    documentType: "Manual",
    revision: "—",
    version: "—",
    fileSize: formatFileSize(summary.file_size_bytes),
    pageCount: summary.page_count ?? 0,
    chunkCount: summary.chunk_count,
    lastUpdated: formatUploadedAt(summary.uploaded_at),
    status: summary.status === "indexed" ? "approved" : "draft",
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

function formatRelativeTime(isoTimestamp: string): string {
  const diffMinutes = Math.max(0, Math.round((Date.now() - new Date(isoTimestamp).getTime()) / 60_000))
  if (diffMinutes < 1) return "Just now"
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`
  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`
  const diffDays = Math.round(diffHours / 24)
  if (diffDays === 1) return "Yesterday"
  return `${diffDays} days ago`
}

function totalStorageBytes(documents: DocumentSummary[]): number {
  return documents.reduce((sum, document) => sum + (document.file_size_bytes ?? 0), 0)
}

function mostRecentlyUploaded(
  documents: DocumentSummary[]
): (DocumentSummary & { uploaded_at: string }) | undefined {
  return documents
    .filter((document): document is DocumentSummary & { uploaded_at: string } =>
      Boolean(document.uploaded_at)
    )
    .sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime())[0]
}

/** The backend has no product-family taxonomy for a document (see
 * `adaptDocumentSummary` above) — every real document currently falls
 * into this same placeholder bucket, the exact one already shown
 * elsewhere (Knowledge Library, Admin). Not fabricated: an honest
 * reflection of what the backend tracks today. Once it gains real
 * per-document categories, this becomes a genuine multi-category
 * breakdown with no change needed at either call site below. */
const PLACEHOLDER_PRODUCT_FAMILY = "General"

/** Knowledge Library Overview's four real stat tiles, derived entirely
 * from `GET /documents`. */
export function adaptKnowledgeOverview(
  documentsResponse: DocumentListResponse | null
): KnowledgeOverview {
  const documents = documentsResponse?.documents ?? []
  const lastIndexedDocument = mostRecentlyUploaded(documents)

  return {
    totalDocuments: documentsResponse?.total ?? 0,
    productFamilies: documents.length > 0 ? 1 : 0,
    lastIndexed: lastIndexedDocument ? formatRelativeTime(lastIndexedDocument.uploaded_at) : "—",
    storageUsed: formatFileSize(totalStorageBytes(documents)),
  }
}

const RECENT_DOCUMENTS_LIMIT = 5

/** The most recently uploaded real documents, newest first — same
 * source and ordering as the Knowledge Library and Admin's document
 * tables. */
export function adaptRecentDocuments(
  documentsResponse: DocumentListResponse | null
): RecentDocumentItem[] {
  if (!documentsResponse) return []
  return documentsResponse.documents
    .filter((document): document is DocumentSummary & { uploaded_at: string } =>
      Boolean(document.uploaded_at)
    )
    .sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime())
    .slice(0, RECENT_DOCUMENTS_LIMIT)
    .map((document) => ({
      id: document.id,
      name: document.filename,
      uploadedAt: formatRelativeTime(document.uploaded_at),
      chunkCount: document.chunk_count,
    }))
}

/** Real documents grouped by product family — see
 * `PLACEHOLDER_PRODUCT_FAMILY` above for why this is currently always
 * a single bucket rather than a fabricated multi-category split. */
export function adaptProductFamilyCoverage(
  documentsResponse: DocumentListResponse | null
): ProductFamilyCoverageItem[] {
  const total = documentsResponse?.total ?? 0
  if (total === 0) return []
  return [{ label: PLACEHOLDER_PRODUCT_FAMILY, documentCount: total, percentage: 100 }]
}

function formatResponseTime(averageMs: number | null): string {
  if (averageMs === null) return "—"
  return `${(averageMs / 1000).toFixed(1)}s`
}

/** AI Usage's four real stat tiles, derived entirely from
 * `GET /dashboard/analytics` — in-memory since the backend last
 * restarted (see app/services/analytics/analytics_service.py), never
 * fabricated. A backend that has never answered a question reports
 * genuine zeros here, not placeholder numbers. */
export function adaptAiUsageSummary(analytics: AnalyticsSnapshot | null): AiUsageSummary {
  return {
    questionsAsked: analytics?.total_questions ?? 0,
    averageResponseTime: formatResponseTime(analytics?.average_response_time_ms ?? null),
    documentsReferenced: analytics?.documents_referenced ?? 0,
    successfulAnswers: analytics?.successful_answers ?? 0,
  }
}

/** The most recent real Ask AI exchanges — already newest-first from
 * the backend. */
export function adaptRecentConversations(
  analytics: AnalyticsSnapshot | null
): RecentConversationItem[] {
  if (!analytics) return []
  return analytics.recent_conversations.map((exchange) => ({
    id: exchange.id,
    question: exchange.question,
    status: exchange.status,
    timestamp: formatRelativeTime(exchange.timestamp),
  }))
}

/** Maps `GET /documents`'s real document list onto the Admin page's
 * Document Management table — the same real data Knowledge Library
 * shows, since both read from the same backend list. `documentType` and
 * `version` have no backend equivalent (same placeholder convention as
 * `adaptDocumentSummary`); every returned document is, by definition,
 * fully indexed, so `status` is always "indexed", never fabricated. */
export function adaptAdminDocuments(
  documentsResponse: DocumentListResponse | null
): AdminDocument[] {
  if (!documentsResponse) return []
  return documentsResponse.documents.map((document) => ({
    id: document.id,
    name: document.filename,
    documentType: "Manual",
    version: "—",
    status: "indexed",
    chunks: document.chunk_count,
    lastUpdated: formatUploadedAt(document.uploaded_at),
  }))
}

/** Real counts derived from the same `GET /documents` list — no
 * "pending"/"failed" document ever persists in the backend (nothing
 * mid-pipeline is stored), so those two are genuinely always 0, not
 * invented. `averageChunkSize`/`knowledgeCoverage`/`lastSynchronization`
 * have no backend equivalent at all and are left to the caller's mock
 * fallback, unlike the counts above. */
export function adaptAdminDocumentCounts(
  documentsResponse: DocumentListResponse | null
): Pick<
  KnowledgeStatistics,
  "totalDocuments" | "indexedDocuments" | "totalChunks" | "pendingDocuments" | "failedDocuments"
> {
  const documents = documentsResponse?.documents ?? []
  return {
    totalDocuments: documentsResponse?.total ?? 0,
    indexedDocuments: documents.length,
    totalChunks: documents.reduce((sum, document) => sum + document.chunk_count, 0),
    pendingDocuments: 0,
    failedDocuments: 0,
  }
}
