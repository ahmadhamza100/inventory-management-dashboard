import { Hono } from "hono"
import { db } from "@/db"
import { and, eq, isNull, desc } from "drizzle-orm"
import { zValidator } from "@hono/zod-validator"
import { transactionSchema } from "@/validations/transaction"
import { transactions } from "@/db/schema"

export const transactionsRouter = new Hono()
  .get("/", async (c) => {
    const data = await db
      .select()
      .from(transactions)
      .where(isNull(transactions.deletedAt))
      .orderBy(desc(transactions.date))

    return c.$json(data)
  })

  .post("/", zValidator("json", transactionSchema), async (c) => {
    const body = c.req.valid("json")
    const { amount, date, ...data } = body
    await db.insert(transactions).values({
      ...data,
      amount: amount.toString(),
      date
    })

    return c.json(null, 201)
  })

  .patch("/:id", zValidator("json", transactionSchema), async (c) => {
    const { id } = c.req.param()
    const body = c.req.valid("json")
    const { amount, date, ...data } = body
    await db
      .update(transactions)
      .set({ ...data, amount: amount.toString(), date })
      .where(and(eq(transactions.id, id), isNull(transactions.deletedAt)))

    return c.json(null, 200)
  })

  .delete("/:id", async (c) => {
    const { id } = c.req.param()
    await db
      .update(transactions)
      .set({ deletedAt: new Date() })
      .where(and(eq(transactions.id, id), isNull(transactions.deletedAt)))

    return c.json(null, 200)
  })
