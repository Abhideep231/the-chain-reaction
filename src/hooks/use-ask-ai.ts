"use client"

import * as React from "react"

import { getMockAnswer, suggestedPrompts } from "@/lib/ask-ai-mock"
import type { ChatMessage } from "@/types/chat"

const MOCK_RESPONSE_DELAY_MS = 1100

export function useAskAi() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [status, setStatus] = React.useState<"idle" | "loading">("idle")

  const send = React.useCallback((prompt: string) => {
    const trimmed = prompt.trim()
    if (!trimmed || status === "loading") {
      return
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    }

    setMessages((prev) => [...prev, userMessage])
    setStatus("loading")

    // No backend yet — Sprint 2 is frontend-only, so the "response" is a
    // canned lookup on a timer to demonstrate the loading state honestly.
    window.setTimeout(() => {
      const answer = getMockAnswer(trimmed)
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: answer.summary,
        answer,
      }
      setMessages((prev) => [...prev, assistantMessage])
      setStatus("idle")
    }, MOCK_RESPONSE_DELAY_MS)
  }, [status])

  const latestAnswer = React.useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const message = messages[i]
      if (message.role === "assistant" && message.answer) {
        return message.answer
      }
    }
    return undefined
  }, [messages])

  return {
    messages,
    status,
    suggestions: suggestedPrompts,
    latestAnswer,
    send,
  }
}
