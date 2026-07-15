import type { Metadata } from "next"

import { CalculationWorkspace } from "@/components/calculations/calculation-workspace"

export const metadata: Metadata = {
  title: "Calculations | The Chain Reaction",
}

export default function CalculationsPage() {
  return <CalculationWorkspace />
}
