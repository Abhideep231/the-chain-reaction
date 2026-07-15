import {
  BookOpenIcon,
  FileTextIcon,
  GraduationCapIcon,
  type LucideIcon,
  SquareStackIcon,
  WrenchIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import type { PreviewKind } from "@/types/library"

/**
 * A small abstract "cover" thumbnail — not a real rendered page. Follows
 * the same visual language as the PDF Viewer's page placeholders
 * (Sprint 3), but is implemented independently since a library document
 * doesn't carry page-by-page content, only a preview kind.
 */
const previewConfig: Record<
  PreviewKind,
  { icon: LucideIcon; className: string }
> = {
  catalogue: {
    icon: BookOpenIcon,
    className: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  },
  handbook: {
    icon: GraduationCapIcon,
    className:
      "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
  },
  manual: {
    icon: WrenchIcon,
    className:
      "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
  },
  guide: {
    icon: SquareStackIcon,
    className:
      "bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400",
  },
  datasheet: {
    icon: FileTextIcon,
    className:
      "bg-neutral-100 text-neutral-600 dark:bg-neutral-500/10 dark:text-neutral-400",
  },
}

export function DocumentPreview({
  previewKind,
  className,
}: {
  previewKind: PreviewKind
  className?: string
}) {
  const config = previewConfig[previewKind]
  const Icon = config.icon

  return (
    <div
      className={cn(
        "flex aspect-[8.5/11] w-full flex-col items-center justify-center gap-2 rounded-sm border bg-white",
        className
      )}
    >
      <div
        className={cn(
          "flex size-10 items-center justify-center rounded-md",
          config.className
        )}
      >
        <Icon className="size-5" />
      </div>
      <div className="flex w-2/3 flex-col gap-1">
        <div className="h-1 w-full rounded-full bg-neutral-200" />
        <div className="h-1 w-3/4 rounded-full bg-neutral-200" />
      </div>
    </div>
  )
}
