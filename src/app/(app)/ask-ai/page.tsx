import type { Metadata } from "next"

import { AskAiWorkspace } from "@/components/chat/ask-ai-workspace"

export const metadata: Metadata = {
  title: "Ask AI | The Chain Reaction",
}

export default function AskAiPage() {
  return <AskAiWorkspace />
}
