"use client"

import * as React from "react"

import { ChatMessage } from "@/components/chat/chat-message"
import { EmptyState } from "@/components/chat/empty-state"
import { LoadingState } from "@/components/chat/loading-state"
import type { ChatMessage as ChatMessageType } from "@/types/chat"

export function ChatWindow({
  messages,
  status,
  suggestions,
  onSelectSuggestion,
}: {
  messages: ChatMessageType[]
  status: "idle" | "loading"
  suggestions: string[]
  onSelectSuggestion: (prompt: string) => void
}) {
  const bottomRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages, status])

  if (messages.length === 0 && status === "idle") {
    return (
      <div className="flex flex-1 flex-col overflow-y-auto px-1">
        <EmptyState
          suggestions={suggestions}
          onSelectSuggestion={onSelectSuggestion}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-1 py-2">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
      {status === "loading" && <LoadingState />}
      <div ref={bottomRef} />
    </div>
  )
}
