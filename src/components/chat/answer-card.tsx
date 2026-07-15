import { ConfidenceIndicator } from "@/components/shared/confidence-indicator"
import { KeyValueList } from "@/components/shared/key-value-list"
import type { EngineeringAnswer } from "@/types/chat"

export function AnswerCard({ answer }: { answer: EngineeringAnswer }) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 text-card-foreground">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold">Engineering Answer</span>
        <ConfidenceIndicator confidence={answer.confidence} />
      </div>

      <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
        {answer.summary}
      </p>

      {answer.parameters && answer.parameters.length > 0 && (
        <KeyValueList items={answer.parameters} />
      )}

      {answer.citations.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 border-t pt-3">
          <span className="text-xs text-muted-foreground">Sources:</span>
          {answer.citations.map((citation, index) => (
            <span
              key={citation.id}
              className="inline-flex size-5 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground"
              title={citation.title}
            >
              {index + 1}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
