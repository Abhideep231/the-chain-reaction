import { PdfPlaceholder } from "@/components/pdf/pdf-placeholder"
import { cn } from "@/lib/utils"
import type { PdfPageContent } from "@/types/pdf"

export function PageThumbnail({
  page,
  isActive,
  onSelect,
}: {
  page: PdfPageContent
  isActive: boolean
  onSelect: (pageNumber: number) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(page.pageNumber)}
      aria-current={isActive}
      className={cn(
        "flex flex-col items-center gap-1 rounded-md border p-1.5 transition-colors",
        isActive
          ? "border-primary bg-primary/5"
          : "border-transparent hover:border-border hover:bg-accent"
      )}
    >
      <div className="aspect-[8.5/11] w-full overflow-hidden rounded-sm border bg-white">
        <PdfPlaceholder page={page} compact />
      </div>
      <span
        className={cn(
          "text-xs tabular-nums",
          isActive ? "font-medium text-primary" : "text-muted-foreground"
        )}
      >
        {page.pageNumber}
      </span>
    </button>
  )
}
