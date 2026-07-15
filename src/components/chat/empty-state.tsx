import { SparklesIcon } from "lucide-react"

import { SuggestionCard } from "@/components/chat/suggestion-card"

export function EmptyState({
  suggestions,
  onSelectSuggestion,
}: {
  suggestions: string[]
  onSelectSuggestion: (prompt: string) => void
}) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 py-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <SparklesIcon className="size-6" />
      </div>
      <div className="flex flex-col gap-1.5">
        <h2 className="text-lg font-semibold">
          Ask about your chain systems
        </h2>
        <p className="text-sm text-muted-foreground">
          Ask a question about roller chain selection, wear limits, standards,
          or maintenance. Answers are grounded in your engineering
          documentation.
        </p>
      </div>
      <div className="grid w-full gap-2 sm:grid-cols-2">
        {suggestions.map((prompt) => (
          <SuggestionCard
            key={prompt}
            prompt={prompt}
            onSelect={onSelectSuggestion}
          />
        ))}
      </div>
    </div>
  )
}
