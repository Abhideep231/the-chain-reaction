import { AlertTriangleIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export function ErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-xl bg-status-critical/10 text-status-critical">
        <AlertTriangleIcon className="size-6" />
      </div>
      <div className="flex flex-col gap-1.5">
        <h2 className="text-lg font-semibold">Calculation failed</h2>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      <Button size="lg" variant="outline" onClick={onRetry} className="w-full">
        Try Again
      </Button>
    </div>
  )
}
