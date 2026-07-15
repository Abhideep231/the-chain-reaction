import { DocumentCard } from "@/components/library/document-card"
import { DocumentListRow } from "@/components/library/document-list-row"
import { EmptyLibrary } from "@/components/library/empty-library"
import type { LibraryDocument, LibraryViewMode } from "@/types/library"

export function DocumentGrid({
  documents,
  viewMode,
  selectedDocumentId,
  onSelectDocument,
  onClearFilters,
}: {
  documents: LibraryDocument[]
  viewMode: LibraryViewMode
  selectedDocumentId: string | null
  onSelectDocument: (id: string) => void
  onClearFilters: () => void
}) {
  if (documents.length === 0) {
    return <EmptyLibrary onClearFilters={onClearFilters} />
  }

  if (viewMode === "list") {
    return (
      <div className="flex flex-col gap-1.5">
        {documents.map((document) => (
          <DocumentListRow
            key={document.id}
            document={document}
            isSelected={document.id === selectedDocumentId}
            onSelect={onSelectDocument}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
      {documents.map((document) => (
        <DocumentCard
          key={document.id}
          document={document}
          isSelected={document.id === selectedDocumentId}
          onSelect={onSelectDocument}
        />
      ))}
    </div>
  )
}
