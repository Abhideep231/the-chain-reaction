import { RefreshCwIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { TimeRange } from "@/types/dashboard"

const rangeOptions: { value: TimeRange; label: string }[] = [
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
]

export function DashboardToolbar({
  range,
  onRangeChange,
}: {
  range: TimeRange
  onRangeChange: (range: TimeRange) => void
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div>
        <h1 className="text-lg font-semibold">Engineering Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Knowledge base health and system status at a glance.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <select
          value={range}
          onChange={(event) => onRangeChange(event.target.value as TimeRange)}
          aria-label="Time range"
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
        >
          {rangeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Refresh">
              <RefreshCwIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Refresh isn&apos;t connected yet</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
