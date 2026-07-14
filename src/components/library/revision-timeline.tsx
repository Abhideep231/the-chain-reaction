import type { RevisionEntry } from "@/types/library"

export function RevisionTimeline({ entries }: { entries: RevisionEntry[] }) {
  return (
    <ol className="flex flex-col gap-4">
      {entries.map((entry, index) => (
        <li key={`${entry.revision}-${entry.version}`} className="relative pl-5">
          <span
            className="absolute top-1 left-0 size-2 rounded-full bg-primary"
            aria-hidden
          />
          {index < entries.length - 1 && (
            <span
              className="absolute top-3 left-[3px] w-px bg-border"
              style={{ height: "calc(100% + 0.5rem)" }}
              aria-hidden
            />
          )}
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">
              {entry.revision} · v{entry.version}
            </span>
            <span className="shrink-0 text-xs text-muted-foreground">
              {entry.date}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{entry.summary}</p>
        </li>
      ))}
    </ol>
  )
}
