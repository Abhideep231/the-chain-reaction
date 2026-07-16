import { ASK_AI_TIMEOUT_MS } from "@/lib/api/config"
import { apiClient } from "@/lib/api/client"
import type { AskResponse } from "@/lib/api/types"

/** POST /chat/ask — single-turn RAG: retrieval + Claude. Given a longer
 * timeout than the default since it waits on both the vector store and
 * the Claude API. */
export function askQuestion(question: string): Promise<AskResponse> {
  return apiClient.post<AskResponse>(
    "/chat/ask",
    { question },
    ASK_AI_TIMEOUT_MS
  )
}
