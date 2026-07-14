import { SparklesIcon } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"

export function LoadingState() {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <SparklesIcon className="size-4" />
      </div>
      <div className="flex max-w-[80%] flex-1 flex-col gap-2 rounded-lg border bg-card p-4">
        <p className="text-xs text-muted-foreground">
          Analyzing engineering documents…
        </p>
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  )
}
