import { Hono } from "hono"
import { db } from "@/db"
import { and, eq, inArray, isNull } from "drizzle-orm"
import { zValidator } from "@hono/zod-validator"
import { invoiceSchema } from "@/validations/invoice"
import { invoices, invoiceItems, customers, products } from "@/db/schema"

export const invoicesRouter = new Hono()
  .get("/", async (c) => {
    // Fetch invoices with customer data
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
      .where(isNull(invoices.deletedAt))

    // Early return if no invoices
    if (invoicesData.length === 0) {
      return c.$json([])
    }

    // Extract invoice IDs for filtering
    const invoiceIds = invoicesData.map((inv) => inv.id)

    // Fetch invoice items with product details (filtered by invoice IDs for better performance)
    const invoiceItemsData = await db
      .select({
        invoiceId: invoiceItems.invoiceId,
        quantity: invoiceItems.quantity,
        price: invoiceItems.price,
        product: {
          name: products.name,
          stock: products.stock
        }
      })
      .from(invoiceItems)
      .leftJoin(products, eq(products.id, invoiceItems.productId))
      .where(
        and(
          inArray(invoiceItems.invoiceId, invoiceIds),
          isNull(invoiceItems.deletedAt)
        )
      )

    // Group invoice items by invoice ID using reduce
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
          quantity: item.quantity
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
        }>
      >
    )

    // Combine invoices with their product items
    const data = invoicesData.map((invoice) => ({
      ...invoice,
      products: itemsByInvoiceId[invoice.id] ?? []
    }))

    return c.$json(data)
  })

  .post("/", zValidator("json", invoiceSchema), async (c) => {
    const { items, amountPaid, customerId } = c.req.valid("json")

    // Calculate total from items
    const total = items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    )

    // Create invoice
    const [invoice] = await db
      .insert(invoices)
      .values({
        customerId,
        total: total.toString(),
        amountPaid: amountPaid.toString()
      })
      .returning()

    // Create invoice items
    await db.insert(invoiceItems).values(
      items.map((item) => ({
        invoiceId: invoice.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price.toString()
      }))
    )

    return c.json(null, 201)
  })

  .patch("/:id", zValidator("json", invoiceSchema), async (c) => {
    const { id } = c.req.param()
    const { items, amountPaid, customerId } = c.req.valid("json")

    // Calculate total from items
    const total = items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    )

    // Update invoice
    await db
      .update(invoices)
      .set({
        customerId,
        total: total.toString(),
        amountPaid: amountPaid.toString()
      })
      .where(and(eq(invoices.id, id), isNull(invoices.deletedAt)))

    // Delete existing items
    await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id))

    // Create new invoice items
    await db.insert(invoiceItems).values(
      items.map((item) => ({
        invoiceId: id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price.toString()
      }))
    )

    return c.json(null, 200)
  })

  .delete("/:id", async (c) => {
    const { id } = c.req.param()
    await db
      .update(invoices)
      .set({ deletedAt: new Date() })
      .where(and(eq(invoices.id, id), isNull(invoices.deletedAt)))

    return c.json(null, 200)
  })
