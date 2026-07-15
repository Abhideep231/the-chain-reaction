import { FileTextIcon } from "lucide-react"

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <FileTextIcon className="size-5" />
      </div>
      <p className="text-sm font-medium">No documents yet</p>
      <p className="text-sm text-muted-foreground">
        Upload a PDF to start building the knowledge base.
      </p>
    </div>
  )
}
