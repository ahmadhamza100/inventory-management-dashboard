import { env } from "@/env.config"
import type { Context } from "hono"
import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader
} from "@supabase/ssr"

export function createClient(c: Context) {
  const cookieHeader = c.req.header("Cookie") || ""

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          if (!cookieHeader) return []
          return parseCookieHeader(cookieHeader).map((cookie) => ({
            name: cookie.name,
            value: cookie.value || ""
          }))
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            const serialized = serializeCookieHeader(name, value, options)
            c.header("Set-Cookie", serialized, { append: true })
          })
        }
      }
    }
  )
}
