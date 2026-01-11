"use client"

import { useWatch } from "react-hook-form"
import { useFormContext } from "react-hook-form"
import { IconPlus } from "@tabler/icons-react"
import { ProductSelect } from "./product-select"
import { InvoiceItemCard } from "./invoice-item-card"
import type { InvoiceSchema } from "@/validations/invoice"

export function ProductsList() {
  const form = useFormContext<InvoiceSchema>()
  const items = useWatch({
    control: form.control,
    name: "items"
  })

  return (
    <div className="flex flex-col gap-3">
      <ProductSelect />

      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item, index) => (
            <InvoiceItemCard key={item.productId + index} index={index} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-divider/50 bg-content1 p-8">
          <IconPlus className="mb-2 size-8 text-default-400" />
          <p className="text-sm text-default-500">
            No products added. Select a product above to get started.
          </p>
        </div>
      )}
    </div>
  )
}
