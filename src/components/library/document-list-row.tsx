import { DocumentPreview } from "@/components/library/document-preview"
import { StatusBadge } from "@/components/shared/status-badge"
import { cn } from "@/lib/utils"
import type { LibraryDocument } from "@/types/library"

export function DocumentListRow({
  document,
  isSelected,
  onSelect,
}: {
  document: LibraryDocument
  isSelected: boolean
  onSelect: (id: string) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(document.id)}
      aria-pressed={isSelected}
      className={cn(
        "flex w-full items-center gap-4 rounded-md border p-2.5 text-left transition-colors",
        isSelected
          ? "border-primary bg-primary/5"
          : "border-transparent hover:border-border hover:bg-accent/50"
      )}
    >
      <DocumentPreview previewKind={document.previewKind} className="w-10 shrink-0" />

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold">{document.title}</h3>
        <p className="truncate text-xs text-muted-foreground">
          {document.productFamily} · {document.documentType}
        </p>
      </div>

      <span className="hidden w-24 shrink-0 text-xs text-muted-foreground sm:block">
        {document.revision} · v{document.version}
      </span>
      <span className="hidden w-16 shrink-0 text-xs text-muted-foreground md:block">
        {document.fileSize}
      </span>
      <span className="hidden w-16 shrink-0 text-xs text-muted-foreground md:block">
        {document.pageCount} pp.
      </span>
      <span className="hidden w-28 shrink-0 text-xs text-muted-foreground lg:block">
        {document.lastUpdated}
      </span>
      <StatusBadge status={document.status} className="shrink-0" />
    </button>
  )
}
