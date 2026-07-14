import { FileIcon, LayersIcon } from "lucide-react"

import { DocumentPreview } from "@/components/library/document-preview"
import { StatusBadge } from "@/components/shared/status-badge"
import { cn } from "@/lib/utils"
import type { LibraryDocument } from "@/types/library"

export function DocumentCard({
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
        "flex flex-col gap-3 rounded-lg border p-3 text-left transition-colors",
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-muted-foreground/30 hover:bg-accent/50"
      )}
    >
      <DocumentPreview previewKind={document.previewKind} className="w-16" />

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-semibold">
            {document.title}
          </h3>
          <StatusBadge status={document.status} className="shrink-0" />
        </div>

        <p className="text-xs text-muted-foreground">
          {document.productFamily} · {document.documentType}
        </p>

        <div className="mt-1 flex flex-col gap-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <LayersIcon className="size-3.5 shrink-0" />
            <span>
              {document.revision} · v{document.version}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileIcon className="size-3.5 shrink-0" />
            <span>
              {document.fileSize} · {document.pageCount} pages
            </span>
          </div>
          <span>Updated {document.lastUpdated}</span>
        </div>
      </div>
    </button>
  )
}
