import { AppSidebar } from "@/components/layout/app-sidebar"
import { SiteHeader } from "@/components/layout/site-header"
import { UtilityPanel } from "@/components/layout/utility-panel"
import { UtilityPanelProvider } from "@/components/layout/utility-panel-provider"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <UtilityPanelProvider>
          <SiteHeader />
          <div className="flex flex-1 overflow-hidden">
            <main className="flex flex-1 flex-col gap-4 overflow-auto p-4">
              {children}
            </main>
            <UtilityPanel />
          </div>
        </UtilityPanelProvider>
      </SidebarInset>
    </SidebarProvider>
  )
}
