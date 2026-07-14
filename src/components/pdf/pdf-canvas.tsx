import type { CSSProperties } from "react"

import { CitationHighlight } from "@/components/pdf/citation-highlight"
import { PdfPlaceholder } from "@/components/pdf/pdf-placeholder"
import type { FitMode, PdfCitation, PdfPageContent } from "@/types/pdf"

const BASE_PAGE_WIDTH_PX = 680

export function PdfCanvas({
  page,
  zoom,
  fitMode,
  activeHighlight,
}: {
  page: PdfPageContent
  zoom: number
  fitMode: FitMode
  activeHighlight: PdfCitation | null
}) {
  const pageStyle: CSSProperties =
    fitMode === "width"
      ? { width: "100%", maxWidth: 900 }
      : fitMode === "page"
        ? { width: "auto", height: "100%" }
        : { width: `${(BASE_PAGE_WIDTH_PX * zoom) / 100}px` }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 items-start justify-center overflow-auto bg-muted/40 p-6">
      <div
        className="relative aspect-[8.5/11] shrink-0 bg-white text-neutral-900 shadow-md ring-1 ring-border"
        style={pageStyle}
      >
        <PdfPlaceholder page={page} />
        {activeHighlight && (
          <CitationHighlight
            highlight={activeHighlight.highlight}
            label={activeHighlight.label}
          />
        )}
      </div>
    </div>
  )
}
