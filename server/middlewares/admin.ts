import { isAdmin } from "@/utils/auth"
import { createMiddleware } from "hono/factory"
import { HTTPException } from "hono/http-exception"

export const adminMiddleware = createMiddleware(async (c, next) => {
  const user = c.get("user")
  if (!isAdmin(user)) {
    throw new HTTPException(403, {
      message: "Forbidden: Admin access required"
    })
  }
  await next()
})
