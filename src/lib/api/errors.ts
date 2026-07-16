/** The distinct failure shapes the UI needs to react to differently. */
export type ApiErrorKind =
  | "network"
  | "timeout"
  | "validation"
  | "not_found"
  | "server"
  | "unknown"

/**
 * Thrown by every function in `src/lib/api/*` in place of a raw fetch
 * error — hooks catch this one type and never need to know whether the
 * underlying failure was a network drop, a timeout, or a non-2xx
 * response.
 */
export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status?: number

  constructor(message: string, kind: ApiErrorKind, status?: number) {
    super(message)
    this.name = "ApiError"
    this.kind = kind
    this.status = status
  }
}

/** A friendly, user-facing message for any ApiError — never the raw
 * network/HTTP detail, which belongs in the console, not the UI. */
export function friendlyErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.kind) {
      case "network":
        return "Couldn't reach the backend. Check that the API server is running and try again."
      case "timeout":
        return "The request took too long to respond. Please try again."
      case "validation":
        return error.message || "The request was invalid."
      case "not_found":
        // The backend's 404 detail text is already a specific,
        // user-safe message (e.g. "No relevant document chunks were
        // found for this question." from an empty retrieval) — prefer
        // it over a generic fallback so Ask AI can show a clear reason
        // instead of a vague one.
        return error.message || "The requested resource could not be found."
      case "server":
        return "The backend ran into a problem processing that request. Please try again."
      default:
        return error.message || "Something went wrong. Please try again."
    }
  }
  return "Something went wrong. Please try again."
}
