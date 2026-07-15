import { ArrowUpRightIcon } from "lucide-react"

export function SuggestionCard({
  prompt,
  onSelect,
}: {
  prompt: string
  onSelect: (prompt: string) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(prompt)}
      className="group flex w-full items-start justify-between gap-3 rounded-lg border bg-card p-3.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      <span>{prompt}</span>
      <ArrowUpRightIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-accent-foreground" />
    </button>
  )
}
