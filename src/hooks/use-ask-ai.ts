"use client"

import * as React from "react"

import { adaptAskResponse } from "@/lib/api/adapters"
import { askQuestion } from "@/lib/api/chat"
import { friendlyErrorMessage } from "@/lib/api/errors"
import { suggestedPrompts } from "@/lib/ask-ai-mock"
import type { ChatMessage } from "@/types/chat"

export function useAskAi() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [status, setStatus] = React.useState<"idle" | "loading">("idle")

  // One conversation session per hook lifetime — generated once, on
  // mount, so a page reload (a fresh mount) naturally starts a new,
  // empty conversation. Opaque to the user; never rendered.
  const sessionIdRef = React.useRef<string>(crypto.randomUUID())

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

    askQuestion(trimmed, sessionIdRef.current)
      .then((response) => {
        sessionIdRef.current = response.session_id
        const answer = adaptAskResponse(response)
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: answer.summary,
          answer,
        }
        setMessages((prev) => [...prev, assistantMessage])
      })
      .catch((error: unknown) => {
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: friendlyErrorMessage(error),
        }
        setMessages((prev) => [...prev, assistantMessage])
      })
      .finally(() => setStatus("idle"))
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
