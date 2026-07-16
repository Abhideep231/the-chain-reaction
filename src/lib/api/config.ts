/**
 * Central API configuration. `NEXT_PUBLIC_API_URL` is read at build time
 * (Next.js inlines `NEXT_PUBLIC_*` vars into the client bundle); the
 * localhost fallback keeps local dev working without a `.env.local`, and
 * a production deployment sets the real env var instead of editing code.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

/** Abort a request that the backend hasn't answered within this window. */
export const DEFAULT_TIMEOUT_MS = 30_000

/** Ask AI can take noticeably longer — it waits on retrieval + Claude. */
export const ASK_AI_TIMEOUT_MS = 60_000
