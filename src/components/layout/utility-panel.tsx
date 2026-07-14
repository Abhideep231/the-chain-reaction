"use client"

import { XIcon } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useUtilityPanel } from "@/components/layout/utility-panel-provider"

const defaultContent = (
  <div className="flex w-80 flex-1 flex-col overflow-hidden">
    <div className="flex h-14 w-80 shrink-0 items-center border-b pr-12 pl-4">
      <span className="text-sm font-medium">Utility Panel</span>
    </div>
    <div className="w-80 flex-1 overflow-auto p-4 text-sm text-muted-foreground">
      Reserved for contextual tools and details.
    </div>
  </div>
)

export function UtilityPanel() {
  const { open, setOpen, content } = useUtilityPanel()
  const isMobile = useIsMobile()
  const body = content ?? defaultContent

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-3/4 gap-0 p-0 sm:max-w-sm">
          <SheetHeader className="sr-only">
            <SheetTitle>Utility Panel</SheetTitle>
            <SheetDescription>
              Reserved for contextual tools and details.
            </SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col overflow-hidden">
            {body}
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <aside
      data-slot="utility-panel"
      data-state={open ? "open" : "closed"}
      aria-hidden={!open}
      className={cn(
        "relative hidden shrink-0 flex-col overflow-hidden border-l bg-background transition-[width] duration-200 ease-linear md:flex",
        open ? "w-80" : "w-0 border-l-0"
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(false)}
        aria-label="Close utility panel"
        className="absolute top-2.5 right-2.5 z-10"
      >
        <XIcon />
      </Button>
      {body}
    </aside>
  )
}
