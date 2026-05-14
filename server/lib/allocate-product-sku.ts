import { db } from "@/db"
import { sql } from "drizzle-orm"
import { productSkuCounters } from "@/db/schema"
import { formatProductSku } from "@/utils/helpers"

type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0]

export async function allocateNextProductSku(
  tx: DbTransaction,
  adminId: string
): Promise<string> {
  const [counter] = await tx
    .insert(productSkuCounters)
    .values({
      adminId,
      nextValue: 2
    })
    .onConflictDoUpdate({
      target: productSkuCounters.adminId,
      set: {
        nextValue: sql`${productSkuCounters.nextValue} + 1`,
        updatedAt: sql`now()`
      }
    })
    .returning({
      sequenceNumber: sql<number>`${productSkuCounters.nextValue} - 1`
    })

  if (counter == null) {
    throw new Error("Failed to allocate product SKU")
  }

  return formatProductSku(counter.sequenceNumber)
}
