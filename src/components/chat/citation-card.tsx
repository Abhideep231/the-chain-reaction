import type { Citation } from "@/types/chat"

export function CitationCard({
  citation,
  index,
}: {
  citation: Citation
  index: number
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-md border p-3 text-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
            {index + 1}
          </span>
          <span className="font-medium">{citation.title}</span>
        </div>
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
          {citation.relevance}% match
        </span>
      </div>
      <p className="pl-7 text-xs text-muted-foreground">
        {citation.source} · {citation.section}
      </p>
      <p className="pl-7 text-xs italic text-muted-foreground">
        {citation.snippet}
      </p>
    </div>
  )
}
