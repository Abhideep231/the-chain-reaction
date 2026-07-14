"use client"

import * as React from "react"

import { EvidencePanel } from "@/components/pdf/evidence-panel"
import { PdfCanvas } from "@/components/pdf/pdf-canvas"
import { PdfToolbar } from "@/components/pdf/pdf-toolbar"
import { ThumbnailSidebar } from "@/components/pdf/thumbnail-sidebar"
import { useUtilityPanelContent } from "@/components/layout/utility-panel-provider"
import { usePdfViewer } from "@/hooks/use-pdf-viewer"

export function PdfViewerWorkspace() {
  const viewer = usePdfViewer()

  const panelContent = React.useMemo(
    () => (
      <EvidencePanel
        citations={viewer.citations}
        selectedCitationId={viewer.selectedCitationId}
        selectedCitation={viewer.selectedCitation}
        onSelectCitation={viewer.selectCitation}
        document={viewer.documentMeta}
      />
    ),
    [
      viewer.citations,
      viewer.selectedCitationId,
      viewer.selectedCitation,
      viewer.documentMeta,
      viewer.selectCitation,
    ]
  )
  useUtilityPanelContent(panelContent, { openOnMount: true })

  return (
    <div className="flex min-h-0 min-w-0 flex-1 gap-4">
      <ThumbnailSidebar
        pages={viewer.pages}
        currentPage={viewer.currentPage}
        open={viewer.thumbnailsOpen}
        onSelectPage={viewer.goToPage}
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg border">
        <PdfToolbar
          currentPage={viewer.currentPage}
          pageCount={viewer.pageCount}
          zoom={viewer.zoom}
          fitMode={viewer.fitMode}
          thumbnailsOpen={viewer.thumbnailsOpen}
          onToggleThumbnails={viewer.toggleThumbnails}
          onZoomIn={viewer.zoomIn}
          onZoomOut={viewer.zoomOut}
          onFitWidth={viewer.fitWidth}
          onFitPage={viewer.fitPage}
          onPrevious={viewer.previousPage}
          onNext={viewer.nextPage}
        />
        <PdfCanvas
          page={viewer.currentPageData}
          zoom={viewer.zoom}
          fitMode={viewer.fitMode}
          activeHighlight={viewer.activeHighlight}
        />
      </div>
    </div>
  )
}
