import { env } from "@/env.config"
import { hc } from "hono/client"
import { SuperJSON } from "superjson"
import { HTTPException } from "hono/http-exception"
import type { ApiType } from "@/server"
import type { ContentfulStatusCode } from "hono/utils/http-status"

/**
 * In the browser, always call the API on the current origin. A mismatched
 * `NEXT_PUBLIC_APP_URL` (wrong host/port vs where the app is opened) otherwise
 * produces cross-origin requests that often return HTML, not SuperJSON.
 */
function resolveRequestInput(input: RequestInfo | URL): RequestInfo | URL {
  if (typeof window === "undefined") {
    return input
  }

  try {
    const url =
      typeof input === "string"
        ? new URL(input, window.location.href)
        : input instanceof URL
          ? input
          : new URL(input.url)

    if (url.pathname.startsWith("/api")) {
      return new URL(
        `${url.pathname}${url.search}${url.hash}`,
        window.location.origin
      ).href
    }
  } catch {
    /* keep original input */
  }

  return input
}

function isSuperJsonContentType(contentType: string | null): boolean {
  if (!contentType) return false
  const base = contentType.split(";")[0]?.trim().toLowerCase()
  return base === "application/superjson"
}

function parseJsonBody(text: string, contentType: string | null) {
  const trimmed = text.trim()
  if (trimmed.startsWith("<!") || trimmed.toLowerCase().startsWith("<html")) {
    throw new Error(
      "API returned HTML instead of JSON. Check NEXT_PUBLIC_APP_URL matches the URL you use in the browser, or rely on same-origin (this client rewrites /api to the current origin)."
    )
  }

  if (isSuperJsonContentType(contentType)) {
    return SuperJSON.parse(text)
  }

  return JSON.parse(text) as unknown
}

export const { api } = hc<ApiType>(env.NEXT_PUBLIC_APP_URL, {
  fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
    const resolved = resolveRequestInput(input)
    const response = await fetch(resolved, { ...init, cache: "no-store" })

    if (!response.ok) {
      const errorText = await response.text()
      let message = ""
      try {
        const parsed = JSON.parse(errorText) as { error?: string; message?: string }
        message = parsed?.message || parsed?.error || ""
      } catch {
        message =
          errorText.trim().length > 0 && errorText.trim().startsWith("<")
            ? `Request failed (${response.status}). Received HTML instead of JSON — wrong API URL?`
            : errorText.slice(0, 200)
      }
      throw new HTTPException(response.status as ContentfulStatusCode, {
        message: message || `Request failed with status ${response.status}`
      })
    }

    const contentType = response.headers.get("Content-Type")

    response.json = async () => {
      const text = await response.text()

      try {
        return parseJsonBody(text, contentType)
      } catch (error) {
        console.error(
          "Failed to parse API response:",
          error,
          "url=",
          response.url,
          "content-type=",
          contentType
        )
        throw error instanceof Error ? error : new Error("Invalid API response")
      }
    }

    return response
  }
})
