import { SettingsIcon } from "lucide-react"

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <SettingsIcon className="size-5" />
      </div>
      <p className="text-sm font-medium">Settings unavailable</p>
      <p className="text-sm text-muted-foreground">
        Preferences could not be loaded for this session.
      </p>
    </div>
  )
}
