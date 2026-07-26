import { NextRequest } from "next/server"

/**
 * Same-origin proxy for the browser → backend path. Exists because GitHub
 * Codespaces' forwarded-port auth layer rejects cross-port JS requests, so
 * the browser must always call this frontend origin, never the backend's
 * port directly (see docker-compose.yml / README's Codespaces section).
 *
 * Implemented as a Route Handler that streams the request/response bodies
 * through directly, rather than a `next.config.ts` rewrite: rewrites to an
 * external destination are resolved through Next's declarative proxying,
 * which buffers/re-forwards the body and has real limits on large payloads
 * (hit in practice — a multi-MB PDF upload returned 413, a small JSON
 * request didn't). Streaming both directions here has no such cap.
 */
function backendUrl(path: string[], search: string): string {
  const base = process.env.BACKEND_INTERNAL_URL ?? "http://localhost:8000"
  return `${base}/${path.join("/")}${search}`
}

async function proxy(request: NextRequest, path: string[]): Promise<Response> {
  const headers = new Headers(request.headers)
  // These describe the request as the browser sent it to this frontend
  // origin — recomputing them for the streamed re-request to the backend
  // avoids a host/length mismatch, letting fetch set both correctly.
  headers.delete("host")
  headers.delete("content-length")
  // A large multipart upload's "Expect: 100-continue" (sent automatically
  // by browsers/curl) makes Node's fetch (undici) throw
  // NotSupportedError — it manages this handshake internally and doesn't
  // accept it as a caller-supplied header. Confirmed live: a >1MB upload
  // failed with exactly this error until this header was stripped.
  headers.delete("expect")

  const hasBody = !["GET", "HEAD"].includes(request.method)

  const response = await fetch(backendUrl(path, request.nextUrl.search), {
    method: request.method,
    headers,
    body: hasBody ? request.body : undefined,
    // Required by Node's fetch whenever a streamed (not buffered) body is
    // passed alongside a method that can carry one.
    duplex: hasBody ? "half" : undefined,
  } as RequestInit)

  return new Response(response.body, {
    status: response.status,
    headers: response.headers,
  })
}

type RouteContext = { params: Promise<{ path: string[] }> }

export async function GET(request: NextRequest, context: RouteContext) {
  return proxy(request, (await context.params).path)
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxy(request, (await context.params).path)
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxy(request, (await context.params).path)
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return proxy(request, (await context.params).path)
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return proxy(request, (await context.params).path)
}
