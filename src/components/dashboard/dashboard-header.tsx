"use client"

import { RefreshCwIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function DashboardHeader({
  onRefresh,
  isLoading,
}: {
  onRefresh: () => void
  isLoading: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div>
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Your AI-powered engineering knowledge platform, at a glance.
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
        <RefreshCwIcon className={cn("size-4", isLoading && "animate-spin")} />
        Refresh
      </Button>
    </div>
  )
}
