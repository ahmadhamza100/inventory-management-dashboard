import { createMiddleware } from "hono/factory"
import { HTTPException } from "hono/http-exception"
import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader
} from "@supabase/ssr"
import { env } from "@/env.config"
import type { User } from "@supabase/supabase-js"

declare module "hono" {
  interface Context {
    user: User
  }
}

export const authMiddleware = createMiddleware(async (c, next) => {
  const cookieHeader = c.req.header("Cookie") || ""

  const supabase = createServerClient(
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

  await supabase.auth.getSession()

  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new HTTPException(401, { message: "Unauthorized" })
  }

  c.set("user", user)

  return next()
})
