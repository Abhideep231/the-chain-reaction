import { FileTextIcon } from "lucide-react"

import { DocumentInfo } from "@/components/pdf/document-info"
import { ConfidenceIndicator } from "@/components/shared/confidence-indicator"
import { KeyValueList } from "@/components/shared/key-value-list"
import { cn } from "@/lib/utils"
import type { PdfCitation, PdfDocumentMeta } from "@/types/pdf"
import type { ConfidenceLevel } from "@/types/shared"

const confidenceDotClassName: Record<ConfidenceLevel, string> = {
  high: "bg-emerald-500",
  medium: "bg-amber-500",
  low: "bg-destructive",
}

export function EvidencePanel({
  citations,
  selectedCitationId,
  selectedCitation,
  onSelectCitation,
  document,
}: {
  citations: PdfCitation[]
  selectedCitationId: string | null
  selectedCitation: PdfCitation | null
  onSelectCitation: (citationId: string) => void
  document: PdfDocumentMeta
}) {
  return (
    <div className="flex w-80 flex-1 flex-col overflow-hidden">
      <div className="flex h-14 w-80 shrink-0 items-center border-b pr-12 pl-4">
        <span className="text-sm font-medium">Evidence</span>
      </div>

      <div className="flex w-80 flex-1 flex-col gap-6 overflow-auto p-4">
        <section className="flex flex-col gap-2">
          <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Citations
          </h3>
          <div className="flex flex-col gap-1.5">
            {citations.map((citation) => (
              <button
                key={citation.id}
                type="button"
                onClick={() => onSelectCitation(citation.id)}
                aria-pressed={citation.id === selectedCitationId}
                className={cn(
                  "flex items-center gap-2 rounded-md border p-2.5 text-left text-sm transition-colors",
                  citation.id === selectedCitationId
                    ? "border-primary bg-primary/5"
                    : "border-transparent hover:border-border hover:bg-accent"
                )}
              >
                <span
                  className={cn(
                    "size-2 shrink-0 rounded-full",
                    confidenceDotClassName[citation.confidence]
                  )}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 truncate font-medium">
                  {citation.label}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  p. {citation.pageNumber}
                </span>
              </button>
            ))}
          </div>
        </section>

        {selectedCitation ? (
          <section className="flex flex-col gap-3 rounded-md border p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold">
                {selectedCitation.label}
              </span>
              <ConfidenceIndicator confidence={selectedCitation.confidence} />
            </div>

            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <FileTextIcon className="mt-0.5 size-3.5 shrink-0" />
              <span>
                Page {selectedCitation.pageNumber} · {selectedCitation.section}
              </span>
            </div>

            <blockquote className="border-l-2 pl-3 text-sm text-muted-foreground italic">
              {selectedCitation.retrievedChunk}
            </blockquote>

            <KeyValueList items={selectedCitation.metadata} />
          </section>
        ) : (
          <p className="text-sm text-muted-foreground">
            Select a citation to see the retrieved chunk, confidence, and
            highlighted region in the viewer.
          </p>
        )}

        <DocumentInfo document={document} />
      </div>
    </div>
  )
}
