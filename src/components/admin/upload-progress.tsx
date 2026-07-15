import { CheckCircle2Icon, CircleIcon, LoaderCircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { UPLOAD_STAGES } from "@/types/admin"
import type { UploadProgress as UploadProgressData } from "@/types/admin"

export function UploadProgress({ upload }: { upload: UploadProgressData }) {
  const isComplete = upload.stageIndex === UPLOAD_STAGES.length - 1

  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="truncate font-medium">{upload.fileName}</span>
        <span className="shrink-0 tabular-nums text-muted-foreground">
          {upload.percent}%
        </span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full bg-primary transition-[width] duration-300",
            isComplete && "bg-status-good"
          )}
          style={{ width: `${upload.percent}%` }}
        />
      </div>

      <ol className="flex flex-col gap-2.5">
        {UPLOAD_STAGES.map((stage, index) => {
          const isStageComplete = index < upload.stageIndex
          const isCurrent = index === upload.stageIndex

          return (
            <li key={stage} className="flex items-center gap-2.5 text-sm">
              {isStageComplete || (isCurrent && isComplete) ? (
                <CheckCircle2Icon className="size-4 shrink-0 text-status-good" />
              ) : isCurrent ? (
                <LoaderCircleIcon className="size-4 shrink-0 animate-spin text-primary" />
              ) : (
                <CircleIcon className="size-4 shrink-0 text-muted-foreground" />
              )}
              <span
                className={cn(
                  isStageComplete || isCurrent
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {stage}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
