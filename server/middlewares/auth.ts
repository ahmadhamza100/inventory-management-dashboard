import { createMiddleware } from "hono/factory"
import { HTTPException } from "hono/http-exception"
import { createClient } from "@/utils/supabase/hono"
import { isBanned, getAdminId } from "@/utils/auth"
import type { User } from "@supabase/supabase-js"

declare module "hono" {
  interface ContextVariableMap {
    user: User
    adminId: string
  }
}

export const authMiddleware = createMiddleware(async (c, next) => {
  const supabase = createClient(c)

  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    throw new HTTPException(401, { message: "Unauthorized" })
  }

  if (isBanned(data.user)) {
    throw new HTTPException(403, {
      message: "You've been banned from this app"
    })
  }

  const adminId = getAdminId(data.user)

  if (!adminId) {
    throw new HTTPException(403, {
      message: "Access denied: invalid user role or missing admin association"
    })
  }

  c.set("user", data.user)
  c.set("adminId", adminId)

  return next()
})
