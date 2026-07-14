"use client"

import * as React from "react"

import { DocumentFilters } from "@/components/library/document-filters"
import { DocumentGrid } from "@/components/library/document-grid"
import { DocumentToolbar } from "@/components/library/document-toolbar"
import { MetadataPanel } from "@/components/library/metadata-panel"
import { useUtilityPanelContent } from "@/components/layout/utility-panel-provider"
import { useLibrary } from "@/hooks/use-library"

export function LibraryWorkspace() {
  const library = useLibrary()

  const panelContent = React.useMemo(
    () => (
      <MetadataPanel
        document={library.selectedDocument}
        onSelectDocument={library.selectDocument}
      />
    ),
    [library.selectedDocument, library.selectDocument]
  )
  useUtilityPanelContent(panelContent, { openOnMount: true })

  return (
    <div className="flex min-h-0 min-w-0 flex-1 gap-4">
      <DocumentFilters
        search={library.filters.search}
        onSearchChange={library.setSearch}
        category={library.filters.category}
        onCategoryChange={library.setCategory}
        productFamily={library.filters.productFamily}
        onProductFamilyChange={library.setProductFamily}
        documentType={library.filters.documentType}
        onDocumentTypeChange={library.setDocumentType}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg border">
        <DocumentToolbar
          search={library.filters.search}
          onSearchChange={library.setSearch}
          sort={library.sort}
          onSortChange={library.setSort}
          viewMode={library.viewMode}
          onViewModeChange={library.setViewMode}
        />
        <div className="flex-1 overflow-auto p-4">
          <DocumentGrid
            documents={library.filteredDocuments}
            viewMode={library.viewMode}
            selectedDocumentId={library.selectedDocumentId}
            onSelectDocument={library.selectDocument}
            onClearFilters={library.clearFilters}
          />
        </div>
      </div>
    </div>
  )
}
