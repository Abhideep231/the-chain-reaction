import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  MaximizeIcon,
  MinusIcon,
  PanelLeftIcon,
  PlusIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { FitMode } from "@/types/pdf"

export function PdfToolbar({
  currentPage,
  pageCount,
  zoom,
  fitMode,
  thumbnailsOpen,
  onToggleThumbnails,
  onZoomIn,
  onZoomOut,
  onFitWidth,
  onFitPage,
  onPrevious,
  onNext,
}: {
  currentPage: number
  pageCount: number
  zoom: number
  fitMode: FitMode
  thumbnailsOpen: boolean
  onToggleThumbnails: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onFitWidth: () => void
  onFitPage: () => void
  onPrevious: () => void
  onNext: () => void
}) {
  return (
    <div className="flex h-12 min-w-0 shrink-0 items-center gap-1 overflow-x-auto border-b px-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleThumbnails}
        aria-label={
          thumbnailsOpen ? "Hide page thumbnails" : "Show page thumbnails"
        }
        aria-pressed={thumbnailsOpen}
        className="hidden md:inline-flex"
      >
        <PanelLeftIcon />
      </Button>

      <Separator orientation="vertical" className="mx-1 hidden h-5 md:block" />

      <Button variant="ghost" size="icon" onClick={onZoomOut} aria-label="Zoom out">
        <MinusIcon />
      </Button>
      <span className="w-14 shrink-0 text-center text-xs tabular-nums text-muted-foreground">
        {fitMode === "custom" ? `${zoom}%` : fitMode === "width" ? "Width" : "Page"}
      </span>
      <Button variant="ghost" size="icon" onClick={onZoomIn} aria-label="Zoom in">
        <PlusIcon />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-5" />

      <Button
        variant={fitMode === "width" ? "secondary" : "ghost"}
        size="sm"
        onClick={onFitWidth}
        aria-pressed={fitMode === "width"}
      >
        Fit Width
      </Button>
      <Button
        variant={fitMode === "page" ? "secondary" : "ghost"}
        size="sm"
        onClick={onFitPage}
        aria-pressed={fitMode === "page"}
      >
        Fit Page
      </Button>

      <div className="flex flex-1 items-center justify-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrevious}
          disabled={currentPage <= 1}
          aria-label="Previous page"
        >
          <ChevronLeftIcon />
        </Button>
        <span className="min-w-24 shrink-0 text-center text-xs tabular-nums text-muted-foreground">
          Page {currentPage} of {pageCount}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNext}
          disabled={currentPage >= pageCount}
          aria-label="Next page"
        >
          <ChevronRightIcon />
        </Button>
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Download document">
            <DownloadIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Download isn&apos;t connected yet</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Fullscreen">
            <MaximizeIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Fullscreen isn&apos;t connected yet</TooltipContent>
      </Tooltip>
    </div>
  )
}
