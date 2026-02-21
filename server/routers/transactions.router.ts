import { Hono } from "hono"
import { db } from "@/db"
import { and, eq, isNull, desc } from "drizzle-orm"
import { zValidator } from "@hono/zod-validator"
import { transactionSchema } from "@/validations/transaction"
import { transactions } from "@/db/schema"

export const transactionsRouter = new Hono()
  .get("/", async (c) => {
    const adminId = c.get("adminId")
    const data = await db
      .select()
      .from(transactions)
      .where(
        and(eq(transactions.adminId, adminId), isNull(transactions.deletedAt))
      )
      .orderBy(desc(transactions.date))

    return c.$json(data)
  })

  .post("/", zValidator("json", transactionSchema), async (c) => {
    const adminId = c.get("adminId")
    const body = c.req.valid("json")
    const { amount, date, ...data } = body
    await db.insert(transactions).values({
      ...data,
      adminId,
      amount: amount.toString(),
      date
    })

    return c.json(null, 201)
  })

  .patch("/:id", zValidator("json", transactionSchema), async (c) => {
    const adminId = c.get("adminId")
    const { id } = c.req.param()
    const body = c.req.valid("json")
    const { amount, date, ...data } = body
    await db
      .update(transactions)
      .set({ ...data, amount: amount.toString(), date })
      .where(
        and(
          eq(transactions.id, id),
          eq(transactions.adminId, adminId),
          isNull(transactions.deletedAt)
        )
      )

    return c.json(null, 200)
  })

  .delete("/:id", async (c) => {
    const adminId = c.get("adminId")
    const { id } = c.req.param()
    await db
      .update(transactions)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(transactions.id, id),
          eq(transactions.adminId, adminId),
          isNull(transactions.deletedAt)
        )
      )

    return c.json(null, 200)
  })
