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

/** A PDF upload's real duration is the raw file transfer itself (up to
 * the configured max size), not backend processing — the backend now
 * responds as soon as the file is saved and hands parsing/chunking/
 * embedding/storing off to a background job. On a slow or congested
 * connection a large file can take much longer than the default
 * timeout to simply finish uploading, well before that background job
 * ever starts. */
export const UPLOAD_TIMEOUT_MS = 300_000
