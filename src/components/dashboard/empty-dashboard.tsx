import { DatabaseIcon } from "lucide-react"

export function EmptyDashboard() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center">
      <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <DatabaseIcon className="size-6" />
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold">No knowledge base yet</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Once documents are indexed, this dashboard will show knowledge base
          health, recent activity, and system status at a glance.
        </p>
      </div>
    </div>
  )
}
