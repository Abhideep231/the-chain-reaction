"use client"

import * as React from "react"
import { ChevronDownIcon, SparklesIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Recommendation } from "@/types/calculation"

export function RecommendationCard({
  recommendation,
}: {
  recommendation: Recommendation
}) {
  const [isExpanded, setIsExpanded] = React.useState(false)

  return (
    <div className="flex flex-col gap-4 rounded-lg border-2 border-primary/20 bg-card p-5">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <SparklesIcon className="size-5" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Recommended Chain
          </span>
          <h3 className="text-xl font-semibold">{recommendation.chainLabel}</h3>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{recommendation.reason}</p>

      <div className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2.5">
        <span className="text-sm text-muted-foreground">Expected Life</span>
        <span className="text-sm font-semibold tabular-nums">
          {recommendation.expectedLifeLabel}
        </span>
      </div>

      <div className="flex flex-col gap-2 border-t pt-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded((prev) => !prev)}
          aria-expanded={isExpanded}
          className="w-fit justify-start px-0 hover:bg-transparent"
        >
          <ChevronDownIcon
            className={cn(
              "size-4 transition-transform",
              isExpanded && "rotate-180"
            )}
          />
          Why this recommendation?
        </Button>
        {isExpanded && (
          <ul className="flex flex-col gap-2 pl-1 text-sm text-muted-foreground">
            {recommendation.explanation.map((line, index) => (
              <li key={index} className="flex gap-2">
                <span className="select-none text-muted-foreground/60">•</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
