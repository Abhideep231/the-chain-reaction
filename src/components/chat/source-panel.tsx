import { FileTextIcon } from "lucide-react"

import { CitationCard } from "@/components/chat/citation-card"
import { ConfidenceIndicator } from "@/components/shared/confidence-indicator"
import type { EngineeringAnswer } from "@/types/chat"

export function SourcePanel({ answer }: { answer?: EngineeringAnswer }) {
  return (
    <div className="flex w-80 flex-1 flex-col overflow-hidden">
      <div className="flex h-14 w-80 shrink-0 items-center border-b pr-12 pl-4">
        <span className="text-sm font-medium">Sources &amp; Confidence</span>
      </div>

      <div className="flex w-80 flex-1 flex-col gap-6 overflow-auto p-4">
        <section className="flex flex-col gap-2">
          <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Confidence
          </h3>
          <ConfidenceIndicator confidence={answer?.confidence} />
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Retrieved Documents
          </h3>
          {answer && answer.retrievedDocuments.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {answer.retrievedDocuments.map((document) => (
                <li
                  key={document.id}
                  className="flex items-start gap-2 rounded-md border p-2.5 text-sm"
                >
                  <FileTextIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-medium">
                      {document.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {document.type} · {document.matchScore}% match
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Retrieved documents will appear here once you ask a question.
            </p>
          )}
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Citations
          </h3>
          {answer && answer.citations.length > 0 ? (
            <div className="flex flex-col gap-2">
              {answer.citations.map((citation, index) => (
                <CitationCard
                  key={citation.id}
                  citation={citation}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Citations supporting the engineering answer will appear here.
            </p>
          )}
        </section>
      </div>
    </div>
  )
}
