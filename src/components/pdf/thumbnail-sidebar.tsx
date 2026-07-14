import { PageThumbnail } from "@/components/pdf/page-thumbnail"
import { cn } from "@/lib/utils"
import type { PdfPageContent } from "@/types/pdf"

export function ThumbnailSidebar({
  pages,
  currentPage,
  open,
  onSelectPage,
}: {
  pages: PdfPageContent[]
  currentPage: number
  open: boolean
  onSelectPage: (pageNumber: number) => void
}) {
  return (
    <aside
      data-state={open ? "open" : "closed"}
      aria-hidden={!open}
      className={cn(
        "hidden shrink-0 flex-col overflow-hidden rounded-lg border bg-background transition-[width] duration-200 ease-linear md:flex",
        open ? "w-40" : "w-0 border-transparent"
      )}
    >
      <div className="flex h-12 w-40 shrink-0 items-center border-b px-3">
        <span className="text-xs font-medium text-muted-foreground">
          Pages
        </span>
      </div>
      <div className="flex w-40 flex-1 flex-col gap-2 overflow-auto p-2">
        {pages.map((page) => (
          <PageThumbnail
            key={page.pageNumber}
            page={page}
            isActive={page.pageNumber === currentPage}
            onSelect={onSelectPage}
          />
        ))}
      </div>
    </aside>
  )
}
