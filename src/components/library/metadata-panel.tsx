import { ExternalLinkIcon, FileTextIcon } from "lucide-react"

import { RevisionTimeline } from "@/components/library/revision-timeline"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { KeyValueList } from "@/components/shared/key-value-list"
import { StatusBadge } from "@/components/shared/status-badge"
import { getDocumentById } from "@/lib/library-mock"
import type { LibraryDocument } from "@/types/library"

export function MetadataPanel({
  document,
  onSelectDocument,
}: {
  document: LibraryDocument | null
  onSelectDocument: (id: string) => void
}) {
  return (
    <div className="flex w-80 flex-1 flex-col overflow-hidden">
      <div className="flex h-14 w-80 shrink-0 items-center border-b pr-12 pl-4">
        <span className="text-sm font-medium">Document Details</span>
      </div>

      {!document ? (
        <div className="flex w-80 flex-1 items-center p-4">
          <p className="text-sm text-muted-foreground">
            Select a document to view its metadata, revision history, and
            related files.
          </p>
        </div>
      ) : (
        <div className="flex w-80 flex-1 flex-col gap-6 overflow-auto p-4">
          <section className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold">{document.title}</h3>
              <StatusBadge status={document.status} className="shrink-0" />
            </div>
            <KeyValueList
              items={[
                { label: "Category", value: document.category },
                { label: "Product family", value: document.productFamily },
                { label: "Document type", value: document.documentType },
                {
                  label: "Revision",
                  value: `${document.revision} · v${document.version}`,
                },
                { label: "File size", value: document.fileSize },
                { label: "Pages", value: String(document.pageCount) },
                { label: "Last updated", value: document.lastUpdated },
              ]}
            />
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Revision History
            </h3>
            <RevisionTimeline entries={document.revisionHistory} />
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Related Documents
            </h3>
            {document.relatedDocumentIds.length > 0 ? (
              <ul className="flex flex-col gap-1">
                {document.relatedDocumentIds.map((relatedId) => {
                  const related = getDocumentById(relatedId)
                  if (!related) return null
                  return (
                    <li key={relatedId}>
                      <button
                        type="button"
                        onClick={() => onSelectDocument(relatedId)}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-accent"
                      >
                        <FileTextIcon className="size-3.5 shrink-0 text-muted-foreground" />
                        <span className="truncate">{related.title}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No related documents.
              </p>
            )}
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Tags
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {document.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Engineering Notes
            </h3>
            <p className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
              {document.engineeringNotes}
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Quick Actions
            </h3>
            <div className="flex flex-col gap-1.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="justify-start">
                    <ExternalLinkIcon />
                    Open in PDF Viewer
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Opening in PDF Viewer isn&apos;t connected yet
                </TooltipContent>
              </Tooltip>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
