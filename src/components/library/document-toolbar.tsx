import {
  LayoutGridIcon,
  ListIcon,
  RefreshCwIcon,
  SearchIcon,
  UploadIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { LibrarySortOption, LibraryViewMode } from "@/types/library"

const sortOptions: { value: LibrarySortOption; label: string }[] = [
  { value: "recent", label: "Last updated" },
  { value: "title", label: "Title (A–Z)" },
  { value: "pages", label: "Page count" },
]

export function DocumentToolbar({
  search,
  onSearchChange,
  sort,
  onSortChange,
  viewMode,
  onViewModeChange,
}: {
  search: string
  onSearchChange: (value: string) => void
  sort: LibrarySortOption
  onSortChange: (value: LibrarySortOption) => void
  viewMode: LibraryViewMode
  onViewModeChange: (mode: LibraryViewMode) => void
}) {
  return (
    <div className="flex h-14 min-w-0 shrink-0 items-center gap-2 overflow-x-auto border-b px-4">
      <div className="relative w-full max-w-xs shrink-0">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search documents…"
          className="pl-8"
          aria-label="Search documents"
        />
      </div>

      <select
        value={sort}
        onChange={(event) => onSortChange(event.target.value as LibrarySortOption)}
        aria-label="Sort documents"
        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            Sort: {option.label}
          </option>
        ))}
      </select>

      <div className="flex items-center rounded-md border p-0.5">
        <Button
          variant="ghost"
          size="icon"
          className={cn("size-8", viewMode === "grid" && "bg-accent")}
          onClick={() => onViewModeChange("grid")}
          aria-label="Grid view"
          aria-pressed={viewMode === "grid"}
        >
          <LayoutGridIcon className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn("size-8", viewMode === "list" && "bg-accent")}
          onClick={() => onViewModeChange("list")}
          aria-label="List view"
          aria-pressed={viewMode === "list"}
        >
          <ListIcon className="size-4" />
        </Button>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm">
              <UploadIcon />
              Upload
            </Button>
          </TooltipTrigger>
          <TooltipContent>Upload isn&apos;t connected yet</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Refresh">
              <RefreshCwIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Refresh isn&apos;t connected yet</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
