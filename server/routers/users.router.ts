import { Hono } from "hono"
import { z } from "zod"
import { zValidator } from "@hono/zod-validator"
import { createUserSchema, updateUserSchema } from "@/validations/users"
import { adminMiddleware } from "@/server/middlewares/admin"
import { HTTPException } from "hono/http-exception"
import { createAdminClient } from "@/utils/supabase/admin"
import { getUserName, isBanned } from "@/utils/auth"
import type { SupabaseClient } from "@supabase/supabase-js"

/**
 * Fetches a user by ID and verifies they belong to the current admin's tenant.
 * Throws 404 if user not found, 403 if user doesn't belong to the admin.
 */
async function getOwnedUser(
  auth: SupabaseClient["auth"],
  adminId: string,
  userId: string
) {
  const { data } = await auth.admin.getUserById(userId)

  if (!data.user) {
    throw new HTTPException(404, { message: "User not found" })
  }

  if (data.user.user_metadata?.adminId !== adminId) {
    throw new HTTPException(403, {
      message: "Forbidden: user does not belong to your organization"
    })
  }

  return data.user
}

export const usersRouter = new Hono()
  .use(adminMiddleware)
  .get("/", async (c) => {
    const { auth } = createAdminClient()
    const currentUser = c.get("user")
    const adminId = c.get("adminId")

    const { data, error } = await auth.admin.listUsers()

    if (error) {
      throw new HTTPException(500, { message: error.message })
    }

    const users = data.users
      .map((user) => ({
        ...user,
        name: getUserName(user),
        banned: isBanned(user),
        role: (user.user_metadata?.role as string) || "user"
      }))
      .filter(
        (user) =>
          user.id !== currentUser.id &&
          user.user_metadata?.adminId === adminId
      )

    return c.$json(users)
  })

  .post("/", zValidator("json", createUserSchema), async (c) => {
    const { auth } = createAdminClient()
    const adminId = c.get("adminId")
    const { email, password, name } = c.req.valid("json")

    const { data: authUser, error: authError } = await auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: name || email.split("@")[0],
        role: "user",
        banned: false,
        adminId
      }
    })

    if (authError) {
      throw new HTTPException(400, { message: authError.message })
    }

    if (!authUser.user) {
      throw new HTTPException(500, { message: "Failed to create user" })
    }

    return c.json(
      {
        id: authUser.user.id,
        email: authUser.user.email,
        name: getUserName(authUser.user),
        role: (authUser.user.user_metadata?.role as string) || "user"
      },
      201
    )
  })

  .patch("/:id", zValidator("json", updateUserSchema), async (c) => {
    const { auth } = createAdminClient()
    const adminId = c.get("adminId")
    const { id } = c.req.param()
    const { email, name } = c.req.valid("json")

    const existingUser = await getOwnedUser(auth, adminId, id)

    const { data: updatedUser, error: updateError } =
      await auth.admin.updateUserById(id, {
        email: email || existingUser.email,
        user_metadata: {
          ...existingUser.user_metadata,
          full_name: name || getUserName(existingUser)
        }
      })

    if (updateError) {
      throw new HTTPException(400, { message: updateError.message })
    }

    if (!updatedUser.user) {
      throw new HTTPException(500, { message: "Failed to update user" })
    }

    return c.$json(updatedUser.user)
  })

  .post("/:id/ban", async (c) => {
    const { auth } = createAdminClient()
    const adminId = c.get("adminId")
    const { id } = c.req.param()

    const existingUser = await getOwnedUser(auth, adminId, id)

    const { error: banError } = await auth.admin.updateUserById(id, {
      user_metadata: {
        ...existingUser.user_metadata,
        banned: true
      }
    })

    if (banError) {
      throw new HTTPException(400, { message: banError.message })
    }

    return c.json({ message: "User banned successfully" })
  })

  .post("/:id/unban", async (c) => {
    const { auth } = createAdminClient()
    const adminId = c.get("adminId")
    const { id } = c.req.param()

    const existingUser = await getOwnedUser(auth, adminId, id)

    const { error: updateError } = await auth.admin.updateUserById(id, {
      user_metadata: {
        ...existingUser.user_metadata,
        banned: false
      }
    })

    if (updateError) {
      throw new HTTPException(400, { message: updateError.message })
    }

    return c.json({ message: "User unbanned successfully" })
  })

  .post(
    "/:id/password",
    zValidator("json", z.object({ password: z.string().min(8) })),
    async (c) => {
      const { auth } = createAdminClient()
      const adminId = c.get("adminId")
      const { id } = c.req.param()
      const { password } = c.req.valid("json")

      await getOwnedUser(auth, adminId, id)

      const { error: updateError } = await auth.admin.updateUserById(id, {
        password
      })

      if (updateError) {
        throw new HTTPException(400, { message: updateError.message })
      }

      return c.json({ message: "Password updated successfully" })
    }
  )

  .delete("/:id", async (c) => {
    const { auth } = createAdminClient()
    const adminId = c.get("adminId")
    const { id } = c.req.param()

    await getOwnedUser(auth, adminId, id)

    const { error: deleteError } = await auth.admin.deleteUser(id)

    if (deleteError) {
      throw new HTTPException(400, { message: deleteError.message })
    }

    return c.json({ message: "User deleted successfully" })
  })
