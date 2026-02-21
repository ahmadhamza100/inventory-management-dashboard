import { Hono } from "hono"
import { db } from "@/db"
import { and, eq, inArray, isNull, desc, sql, type SQL } from "drizzle-orm"
import { zValidator } from "@hono/zod-validator"
import { invoiceSchema } from "@/validations/invoice"
import { invoices, invoiceItems, customers, products } from "@/db/schema"
import { generateInvoiceId } from "@/utils/helpers"

export const invoicesRouter = new Hono()
  .get("/", async (c) => {
    const adminId = c.get("adminId")

    const invoicesData = await db
      .select({
        id: invoices.id,
        customerId: invoices.customerId,
        total: invoices.total,
        amountPaid: invoices.amountPaid,
        deletedAt: invoices.deletedAt,
        createdAt: invoices.createdAt,
        updatedAt: invoices.updatedAt,
        customer: {
          name: customers.name,
          email: customers.email,
          phone: customers.phone,
          address: customers.address
        }
      })
      .from(invoices)
      .innerJoin(customers, eq(customers.id, invoices.customerId))
      .where(
        and(eq(invoices.adminId, adminId), isNull(invoices.deletedAt))
      )
      .orderBy(desc(invoices.createdAt))

    if (invoicesData.length === 0) {
      return c.$json([])
    }

    const invoiceIds = invoicesData.map((inv) => inv.id)

    const invoiceItemsData = await db
      .select({
        invoiceId: invoiceItems.invoiceId,
        quantity: invoiceItems.quantity,
        price: invoiceItems.price,
        product: {
          name: products.name,
          stock: products.stock,
          images: products.images
        }
      })
      .from(invoiceItems)
      .leftJoin(products, eq(products.id, invoiceItems.productId))
      .where(
        and(
          eq(invoiceItems.adminId, adminId),
          inArray(invoiceItems.invoiceId, invoiceIds),
          isNull(invoiceItems.deletedAt)
        )
      )

    const itemsByInvoiceId = invoiceItemsData.reduce(
      (acc, item) => {
        if (!item.invoiceId) return acc
        if (!acc[item.invoiceId]) {
          acc[item.invoiceId] = []
        }
        acc[item.invoiceId].push({
          name: item.product?.name ?? null,
          price: item.price,
          stock: item.product?.stock ?? null,
          quantity: item.quantity,
          images: item.product?.images ?? []
        })
        return acc
      },
      {} as Record<
        string,
        Array<{
          name: string | null
          price: string
          stock: number | null
          quantity: number
          images: string[]
        }>
      >
    )

    const data = invoicesData.map((invoice) => ({
      ...invoice,
      products: itemsByInvoiceId[invoice.id] ?? []
    }))

    return c.$json(data)
  })

  .post("/", zValidator("json", invoiceSchema), async (c) => {
    const adminId = c.get("adminId")
    const { items, amountPaid, customerId } = c.req.valid("json")

    const total = items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    )

    const [result] = await db
      .select({
        maxId: sql<
          string | null
        >`MAX(CAST(SUBSTRING(${invoices.id} FROM '\\d+') AS INTEGER))`
      })
      .from(invoices)
      .where(eq(invoices.adminId, adminId))

    const nextSequenceNumber = result?.maxId ? Number(result.maxId) + 1 : 1
    const invoiceId = generateInvoiceId(nextSequenceNumber)

    const [invoice] = await db
      .insert(invoices)
      .values({
        id: invoiceId,
        adminId,
        customerId,
        total: total.toString(),
        amountPaid: amountPaid.toString()
      })
      .returning()

    await db.insert(invoiceItems).values(
      items.map((item) => ({
        invoiceId: invoice.id,
        adminId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price.toString()
      }))
    )

    if (items.length > 0) {
      const sqlChunks: SQL[] = [sql`(case`]
      const productIds: string[] = []

      for (const item of items) {
        sqlChunks.push(
          sql`when ${products.id} = ${item.productId} then ${products.stock} - ${item.quantity}`
        )
        productIds.push(item.productId)
      }

      sqlChunks.push(sql`end)`)
      const finalSql = sql.join(sqlChunks, sql.raw(" "))

      await db
        .update(products)
        .set({ stock: finalSql })
        .where(
          and(
            eq(products.adminId, adminId),
            inArray(products.id, productIds)
          )
        )
    }

    return c.json(null, 201)
  })

  .patch("/:id", zValidator("json", invoiceSchema), async (c) => {
    const adminId = c.get("adminId")
    const { id } = c.req.param()
    const { items, amountPaid, customerId } = c.req.valid("json")

    const total = items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    )

    const oldItems = await db
      .select({
        productId: invoiceItems.productId,
        quantity: invoiceItems.quantity
      })
      .from(invoiceItems)
      .where(
        and(
          eq(invoiceItems.invoiceId, id),
          eq(invoiceItems.adminId, adminId),
          isNull(invoiceItems.deletedAt)
        )
      )

    const validOldItems = oldItems.filter((item) => item.productId)

    if (validOldItems.length > 0) {
      const sqlChunks: SQL[] = [sql`(case`]
      const productIds: string[] = []

      for (const oldItem of validOldItems) {
        if (oldItem.productId) {
          sqlChunks.push(
            sql`when ${products.id} = ${oldItem.productId} then ${products.stock} + ${oldItem.quantity}`
          )
          productIds.push(oldItem.productId)
        }
      }

      sqlChunks.push(sql`end)`)
      const finalSql = sql.join(sqlChunks, sql.raw(" "))

      await db
        .update(products)
        .set({
          stock: finalSql
        })
        .where(
          and(
            eq(products.adminId, adminId),
            inArray(products.id, productIds)
          )
        )
    }

    await db
      .update(invoices)
      .set({
        customerId,
        total: total.toString(),
        amountPaid: amountPaid.toString()
      })
      .where(
        and(
          eq(invoices.id, id),
          eq(invoices.adminId, adminId),
          isNull(invoices.deletedAt)
        )
      )

    await db
      .delete(invoiceItems)
      .where(
        and(
          eq(invoiceItems.invoiceId, id),
          eq(invoiceItems.adminId, adminId),
          isNull(invoiceItems.deletedAt)
        )
      )

    await db.insert(invoiceItems).values(
      items.map((item) => ({
        invoiceId: id,
        adminId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price.toString()
      }))
    )

    if (items.length > 0) {
      const sqlChunks: SQL[] = [sql`(case`]
      const productIds: string[] = []

      for (const item of items) {
        sqlChunks.push(
          sql`when ${products.id} = ${item.productId} then ${products.stock} - ${item.quantity}`
        )
        productIds.push(item.productId)
      }

      sqlChunks.push(sql`end)`)
      const finalSql = sql.join(sqlChunks, sql.raw(" "))

      await db
        .update(products)
        .set({
          stock: finalSql
        })
        .where(
          and(
            eq(products.adminId, adminId),
            inArray(products.id, productIds)
          )
        )
    }

    return c.json(null, 200)
  })

  .delete("/:id", async (c) => {
    const adminId = c.get("adminId")
    const { id } = c.req.param()
    await db
      .update(invoices)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(invoices.id, id),
          eq(invoices.adminId, adminId),
          isNull(invoices.deletedAt)
        )
      )

    return c.json(null, 200)
  })
