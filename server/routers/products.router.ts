import { Hono } from "hono"
import { db } from "@/db"
import { and, eq, isNull } from "drizzle-orm"
import { zValidator } from "@hono/zod-validator"
import { productSchema } from "@/validations/product"
import { generateSKU } from "@/utils/helpers"
import { products } from "@/db/schema"

export const productsRouter = new Hono()
  .get("/", async (c) => {
    const data = await db
      .select()
      .from(products)
      .where(isNull(products.deletedAt))

    return c.$json(data)
  })

  .post("/", zValidator("json", productSchema), async (c) => {
    const { price, ...data } = c.req.valid("json")
    await db.insert(products).values({
      ...data,
      sku: generateSKU(),
      price: price.toString()
    })

    return c.json(null, 201)
  })

  .patch("/:id", zValidator("json", productSchema), async (c) => {
    const { id } = c.req.param()
    const { price, ...data } = c.req.valid("json")
    await db
      .update(products)
      .set({ ...data, price: price.toString() })
      .where(and(eq(products.id, id), isNull(products.deletedAt)))

    return c.json(null, 200)
  })

  .delete("/:id", async (c) => {
    const { id } = c.req.param()
    await db
      .update(products)
      .set({ deletedAt: new Date() })
      .where(and(eq(products.id, id), isNull(products.deletedAt)))

    return c.json(null, 200)
  })
