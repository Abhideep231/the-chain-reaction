import type { Metadata } from "next"

import { LibraryWorkspace } from "@/components/library/library-workspace"

export const metadata: Metadata = {
  title: "Knowledge Library | The Chain Reaction",
}

export default function KnowledgeLibraryPage() {
  return <LibraryWorkspace />
}
