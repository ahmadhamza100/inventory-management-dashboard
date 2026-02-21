import { Hono } from "hono"
import { db } from "@/db"
import { and, eq, isNull } from "drizzle-orm"
import { zValidator } from "@hono/zod-validator"
import { productSchema } from "@/validations/product"
import { generateSKU } from "@/utils/helpers"
import { products } from "@/db/schema"
import { deleteImagesFromStorage } from "@/utils/supabase/storage"

export const productsRouter = new Hono()
  .get("/", async (c) => {
    const adminId = c.get("adminId")
    const data = await db
      .select()
      .from(products)
      .where(and(eq(products.adminId, adminId), isNull(products.deletedAt)))

    return c.$json(data)
  })

  .post("/", zValidator("json", productSchema), async (c) => {
    const adminId = c.get("adminId")
    const { price, images, ...data } = c.req.valid("json")
    await db.insert(products).values({
      ...data,
      adminId,
      images,
      sku: generateSKU(),
      price: price.toString()
    })

    return c.json(null, 201)
  })

  .patch("/:id", zValidator("json", productSchema), async (c) => {
    const adminId = c.get("adminId")
    const { id } = c.req.param()
    const { price, images, ...data } = c.req.valid("json")

    // Retrieve old product to check for removed images
    const [oldProduct] = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.id, id),
          eq(products.adminId, adminId),
          isNull(products.deletedAt)
        )
      )

    if (oldProduct && oldProduct.images.length > 0) {
      const removedImages = oldProduct.images.filter(
        (oldImg: string) => !images?.includes(oldImg)
      )
      if (removedImages.length > 0) {
        // Fire and forget storage cleanup
        deleteImagesFromStorage(removedImages)
      }
    }

    await db
      .update(products)
      .set({ ...data, images, price: price.toString() })
      .where(
        and(
          eq(products.id, id),
          eq(products.adminId, adminId),
          isNull(products.deletedAt)
        )
      )

    return c.json(null, 200)
  })

  .delete("/:id", async (c) => {
    const adminId = c.get("adminId")
    const { id } = c.req.param()

    // Retrieve product to delete its images
    const [oldProduct] = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.id, id),
          eq(products.adminId, adminId),
          isNull(products.deletedAt)
        )
      )

    if (oldProduct && oldProduct.images.length > 0) {
      // Fire and forget storage cleanup
      deleteImagesFromStorage(oldProduct.images)
    }

    await db
      .update(products)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(products.id, id),
          eq(products.adminId, adminId),
          isNull(products.deletedAt)
        )
      )

    return c.json(null, 200)
  })
