import { API_BASE_URL, DEFAULT_TIMEOUT_MS } from "@/lib/api/config"
import { ApiError, type ApiErrorKind } from "@/lib/api/errors"

interface RequestOptions {
  method?: "GET" | "POST" | "DELETE"
  body?: unknown
  formData?: FormData
  timeoutMs?: number
}

function statusToKind(status: number): ApiErrorKind {
  if (status === 404) return "not_found"
  if ([400, 413, 415, 422].includes(status)) return "validation"
  if (status >= 500) return "server"
  return "unknown"
}

async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { detail?: unknown }
    if (typeof data.detail === "string" && data.detail.length > 0) {
      return data.detail
    }
  } catch {
    // Response body wasn't JSON — fall through to the generic message.
  }
  return `Request failed with status ${response.status}.`
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, formData, timeoutMs = DEFAULT_TIMEOUT_MS } = options

  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: formData ? undefined : { "Content-Type": "application/json" },
      body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
      signal: controller.signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError(
        `Request to ${path} timed out after ${timeoutMs}ms.`,
        "timeout"
      )
    }
    throw new ApiError(`Network request to ${path} failed.`, "network")
  } finally {
    window.clearTimeout(timeoutId)
  }

  if (!response.ok) {
    throw new ApiError(
      await extractErrorMessage(response),
      statusToKind(response.status),
      response.status
    )
  }

  if (response.status === 204) {
    return undefined as T
  }
  return (await response.json()) as T
}

export const apiClient = {
  get: <T>(path: string, timeoutMs?: number): Promise<T> =>
    request<T>(path, { method: "GET", timeoutMs }),
  post: <T>(path: string, body?: unknown, timeoutMs?: number): Promise<T> =>
    request<T>(path, { method: "POST", body, timeoutMs }),
  postForm: <T>(path: string, formData: FormData, timeoutMs?: number): Promise<T> =>
    request<T>(path, { method: "POST", formData, timeoutMs }),
  del: <T>(path: string, timeoutMs?: number): Promise<T> =>
    request<T>(path, { method: "DELETE", timeoutMs }),
}
