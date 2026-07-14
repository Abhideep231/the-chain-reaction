import type { Metadata } from "next"

import { DashboardWorkspace } from "@/components/dashboard/dashboard-workspace"

export const metadata: Metadata = {
  title: "Dashboard | The Chain Reaction",
}

export default function DashboardPage() {
  return <DashboardWorkspace />
}
