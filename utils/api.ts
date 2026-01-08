import { env } from "@/env.config"
import { hc } from "hono/client"
import { SuperJSON } from "superjson"
import { HTTPException } from "hono/http-exception"
import type { ApiType } from "@/server"
import type { ContentfulStatusCode } from "hono/utils/http-status"

export const { api } = hc<ApiType>(env.NEXT_PUBLIC_APP_URL, {
  fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
    const response = await fetch(input, { ...init, cache: "no-store" })

    if (!response.ok) {
      const error = await response.json()
      throw new HTTPException(response.status as ContentfulStatusCode, {
        message: error?.message || ""
      })
    }

    const contentType = response.headers.get("Content-Type")

    response.json = async () => {
      const text = await response.text()

      if (contentType === "application/superjson") {
        return SuperJSON.parse(text)
      }

      try {
        return JSON.parse(text)
      } catch (error) {
        console.error("Failed to parse response as JSON:", error)
        throw new Error("Invalid JSON response")
      }
    }

    return response
  }
})
