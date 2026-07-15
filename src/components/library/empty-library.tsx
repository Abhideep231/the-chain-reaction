import { SearchXIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export function EmptyLibrary({ onClearFilters }: { onClearFilters: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <SearchXIcon className="size-6" />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold">No documents match your filters</h3>
        <p className="text-sm text-muted-foreground">
          Try a different search term or clear your filters.
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={onClearFilters}>
        Clear filters
      </Button>
    </div>
  )
}
