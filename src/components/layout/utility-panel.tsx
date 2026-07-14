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

export function UtilityPanel() {
  const { open, setOpen } = useUtilityPanel()
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-3/4 sm:max-w-sm">
          <SheetHeader>
            <SheetTitle>Utility Panel</SheetTitle>
            <SheetDescription>
              Reserved for contextual tools and details.
            </SheetDescription>
          </SheetHeader>
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
        "hidden shrink-0 flex-col overflow-hidden border-l bg-background transition-[width] duration-200 ease-linear md:flex",
        open ? "w-80" : "w-0 border-l-0"
      )}
    >
      <div className="flex h-14 w-80 shrink-0 items-center justify-between border-b px-4">
        <span className="text-sm font-medium">Utility Panel</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(false)}
          aria-label="Close utility panel"
        >
          <XIcon />
        </Button>
      </div>
      <div className="w-80 flex-1 overflow-auto p-4 text-sm text-muted-foreground">
        Reserved for contextual tools and details.
      </div>
    </aside>
  )
}
