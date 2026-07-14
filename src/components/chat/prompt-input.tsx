"use client"

import * as React from "react"
import { SendIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export function PromptInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
}: {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled?: boolean
}) {
  const canSend = value.trim().length > 0 && !disabled

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      if (canSend) {
        onSubmit()
      }
    }
  }

  return (
    <div className="flex items-end gap-2 rounded-xl border bg-card p-2">
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about chain selection, wear limits, standards, or maintenance…"
        disabled={disabled}
        rows={1}
        className="max-h-40 min-h-9 resize-none border-none px-2 py-1.5 shadow-none focus-visible:ring-0"
        aria-label="Ask AI prompt"
      />
      <Button
        type="button"
        size="icon"
        onClick={onSubmit}
        disabled={!canSend}
        aria-label="Send prompt"
      >
        <SendIcon />
      </Button>
    </div>
  )
}
