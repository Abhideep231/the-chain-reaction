import { SparklesIcon, UserIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import type { ChatMessage as ChatMessageType } from "@/types/chat"
import { AnswerCard } from "@/components/chat/answer-card"

export function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === "user"

  return (
    <div className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-md",
          isUser
            ? "bg-secondary text-secondary-foreground"
            : "bg-primary text-primary-foreground"
        )}
      >
        {isUser ? (
          <UserIcon className="size-4" />
        ) : (
          <SparklesIcon className="size-4" />
        )}
      </div>

      {isUser ? (
        <div className="max-w-[80%] rounded-lg bg-secondary px-4 py-2.5 text-sm text-secondary-foreground">
          {message.content}
        </div>
      ) : message.answer ? (
        <div className="max-w-[80%] flex-1">
          <AnswerCard answer={message.answer} />
        </div>
      ) : (
        <div className="max-w-[80%] rounded-lg border bg-card px-4 py-2.5 text-sm">
          {message.content}
        </div>
      )}
    </div>
  )
}
