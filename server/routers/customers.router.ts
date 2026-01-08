import { Hono } from "hono"
import { db } from "@/db"
import { and, eq, isNull } from "drizzle-orm"
import { zValidator } from "@hono/zod-validator"
import { customerSchema } from "@/validations/customer"
import { customers } from "@/db/schema"

export const customersRouter = new Hono()
  .get("/", async (c) => {
    const data = await db
      .select()
      .from(customers)
      .where(isNull(customers.deletedAt))

    return c.$json(data)
  })

  .post("/", zValidator("json", customerSchema), async (c) => {
    const data = c.req.valid("json")
    await db.insert(customers).values({
      ...data,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null
    })

    return c.json(null, 201)
  })

  .patch("/:id", zValidator("json", customerSchema), async (c) => {
    const { id } = c.req.param()
    const data = c.req.valid("json")
    await db
      .update(customers)
      .set({
        ...data,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null
      })
      .where(and(eq(customers.id, id), isNull(customers.deletedAt)))

    return c.json(null, 200)
  })

  .delete("/:id", async (c) => {
    const { id } = c.req.param()
    await db
      .update(customers)
      .set({ deletedAt: new Date() })
      .where(and(eq(customers.id, id), isNull(customers.deletedAt)))

    return c.json(null, 200)
  })
