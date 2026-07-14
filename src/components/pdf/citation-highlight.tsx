import type { HighlightRegion } from "@/types/pdf"

/**
 * A translucent overlay simulating a highlighted retrieval region.
 * Positioned with percentages derived from the citation's normalized
 * (0–1) coordinates, so it lines up regardless of the page's rendered
 * pixel size — the same technique used to position highlights over a
 * real react-pdf <Page> later.
 */
export function CitationHighlight({
  highlight,
  label,
}: {
  highlight: HighlightRegion
  label: string
}) {
  return (
    <div
      className="pointer-events-none absolute animate-pulse rounded-sm border-2 border-primary bg-primary/20"
      style={{
        left: `${highlight.x * 100}%`,
        top: `${highlight.y * 100}%`,
        width: `${highlight.width * 100}%`,
        height: `${highlight.height * 100}%`,
      }}
    >
      <span className="absolute -top-6 left-0 rounded bg-primary px-1.5 py-0.5 text-xs font-medium whitespace-nowrap text-primary-foreground">
        {label}
      </span>
    </div>
  )
}
