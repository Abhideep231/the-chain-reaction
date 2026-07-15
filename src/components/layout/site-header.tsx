"use client"

import { usePathname } from "next/navigation"
import { PanelRightIcon } from "lucide-react"

import { navItems } from "@/config/nav"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useUtilityPanel } from "@/components/layout/utility-panel-provider"

export function SiteHeader() {
  const pathname = usePathname()
  const { toggle } = useUtilityPanel()
  const current = navItems.find((item) => item.href === pathname)

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <h1 className="text-sm font-medium">
        {current?.title ?? "The Chain Reaction"}
      </h1>
      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          aria-label="Toggle utility panel"
        >
          <PanelRightIcon />
        </Button>
      </div>
    </header>
  )
}
