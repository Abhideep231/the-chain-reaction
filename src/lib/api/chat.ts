import { ASK_AI_TIMEOUT_MS } from "@/lib/api/config"
import { apiClient } from "@/lib/api/client"
import type { AskResponse } from "@/lib/api/types"

/** POST /chat/ask — retrieval + Claude, grounded in the current
 * document set and (Sprint 18) this session's recent conversation
 * history. `sessionId` is opaque and client-generated; omitting it
 * starts a fresh conversation. Given a longer timeout than the default
 * since it waits on both the vector store and the Claude API. */
export function askQuestion(
  question: string,
  sessionId?: string
): Promise<AskResponse> {
  return apiClient.post<AskResponse>(
    "/chat/ask",
    { question, session_id: sessionId },
    ASK_AI_TIMEOUT_MS
  )
}
