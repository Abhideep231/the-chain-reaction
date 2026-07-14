"use client"

import * as React from "react"

import { useUtilityPanelContent } from "@/components/layout/utility-panel-provider"
import { ChatWindow } from "@/components/chat/chat-window"
import { PromptInput } from "@/components/chat/prompt-input"
import { SourcePanel } from "@/components/chat/source-panel"
import { useAskAi } from "@/hooks/use-ask-ai"

export function AskAiWorkspace() {
  const { messages, status, suggestions, latestAnswer, send } = useAskAi()
  const [draft, setDraft] = React.useState("")

  const panelContent = React.useMemo(
    () => <SourcePanel answer={latestAnswer} />,
    [latestAnswer]
  )
  useUtilityPanelContent(panelContent, { openOnMount: true })

  function handleSubmit() {
    if (!draft.trim()) return
    send(draft)
    setDraft("")
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <ChatWindow
        messages={messages}
        status={status}
        suggestions={suggestions}
        onSelectSuggestion={send}
      />
      <PromptInput
        value={draft}
        onChange={setDraft}
        onSubmit={handleSubmit}
        disabled={status === "loading"}
      />
    </div>
  )
}
