import { MinusIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import type { Metric } from "@/types/dashboard"

function Sparkline({ points }: { points: number[] }) {
  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 1

  const coords = points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * 100
      const y = 100 - ((point - min) / range) * 100
      return `${x},${y}`
    })
    .join(" ")

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="h-8 w-full text-chart-1"
      aria-hidden
    >
      <polyline
        points={coords}
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        opacity="0.7"
      />
    </svg>
  )
}

const deltaIcon = {
  up: TrendingUpIcon,
  down: TrendingDownIcon,
  flat: MinusIcon,
}

export function MetricCard({ metric }: { metric: Metric }) {
  const DeltaIcon = deltaIcon[metric.delta.direction]

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4">
      <span className="text-sm text-muted-foreground">{metric.label}</span>
      <div className="flex items-end justify-between gap-2">
        <span className="text-2xl font-semibold">{metric.value}</span>
        <span
          className={cn(
            "flex items-center gap-1 text-xs font-medium",
            metric.delta.isPositive
              ? "text-emerald-700 dark:text-emerald-400"
              : "text-destructive"
          )}
        >
          <DeltaIcon className="size-3.5" />
          {metric.delta.value}
        </span>
      </div>
      {metric.sparkline && <Sparkline points={metric.sparkline} />}
    </div>
  )
}
