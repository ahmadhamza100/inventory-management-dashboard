import { Hono } from "hono"
import { z } from "zod"
import { zValidator } from "@hono/zod-validator"
import { createUserSchema, updateUserSchema } from "@/validations/users"
import { adminMiddleware } from "@/server/middlewares/admin"
import { HTTPException } from "hono/http-exception"
import { createAdminClient } from "@/utils/supabase/admin"
import { getUserName, isBanned } from "@/utils/auth"

export const usersRouter = new Hono()
  .use(adminMiddleware)
  .get("/", async (c) => {
    const { auth } = createAdminClient()
    const currentUser = c.get("user")

    const { data, error } = await auth.admin.listUsers()

    if (error) {
      throw new HTTPException(500, { message: error.message })
    }

    const users = data.users
      .map((user) => ({
        ...user,
        name: getUserName(user),
        banned: isBanned(user),
        role: user.user_metadata?.role || "user"
      }))
      .filter((user) => user.id !== currentUser.id)

    return c.$json(users)
  })

  .post("/", zValidator("json", createUserSchema), async (c) => {
    const { auth } = createAdminClient()
    const { email, password, name } = c.req.valid("json")

    const { data: authUser, error: authError } = await auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: name || email.split("@")[0],
        role: "user",
        banned: false
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
        role: authUser.user.user_metadata?.role || "user"
      },
      201
    )
  })

  .patch("/:id", zValidator("json", updateUserSchema), async (c) => {
    const { auth } = createAdminClient()
    const { id } = c.req.param()
    const { email, name } = c.req.valid("json")

    const { data } = await auth.admin.getUserById(id)

    if (!data.user) {
      throw new HTTPException(404, { message: "User not found" })
    }

    const { data: updatedUser, error: updateError } =
      await auth.admin.updateUserById(id, {
        email: email || data.user.email,
        user_metadata: {
          ...data.user.user_metadata,
          full_name: name || getUserName(data.user)
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
    const { id } = c.req.param()

    const { data } = await auth.admin.getUserById(id)

    if (!data.user) {
      throw new HTTPException(404, { message: "User not found" })
    }

    const { error: banError } = await auth.admin.updateUserById(id, {
      user_metadata: {
        ...data.user.user_metadata,
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
    const { id } = c.req.param()

    const { data } = await auth.admin.getUserById(id)

    if (!data.user) {
      throw new HTTPException(404, { message: "User not found" })
    }

    const { error: updateError } = await auth.admin.updateUserById(id, {
      user_metadata: {
        ...data.user.user_metadata,
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
      const { id } = c.req.param()
      const { password } = c.req.valid("json")

      const { data: existingUser } = await auth.admin.getUserById(id)

      if (!existingUser) {
        throw new HTTPException(404, { message: "User not found" })
      }

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
    const { id } = c.req.param()

    const { data } = await auth.admin.getUserById(id)

    if (!data.user) {
      throw new HTTPException(404, { message: "User not found" })
    }

    const { error: deleteError } = await auth.admin.deleteUser(id)

    if (deleteError) {
      throw new HTTPException(400, { message: deleteError.message })
    }

    return c.json({ message: "User deleted successfully" })
  })
