import type { Metadata } from "next"

import { AdminWorkspace } from "@/components/admin/admin-workspace"

export const metadata: Metadata = {
  title: "Admin | The Chain Reaction",
}

export default function AdminPage() {
  return <AdminWorkspace />
}
