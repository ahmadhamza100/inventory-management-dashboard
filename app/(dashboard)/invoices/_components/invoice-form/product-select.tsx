"use client"

import { useMemo, useState } from "react"
import { useProductsQuery } from "@/queries/use-products-query"
import { formatPrice } from "@/utils/helpers"
import { Chip, FieldError } from "@heroui/react"
import { useFormContext, Controller, useWatch } from "react-hook-form"
import type { InvoiceSchema } from "@/validations/invoice"
import type { Product } from "@/db/schema"
import { SearchableEntityList } from "@/components/searchable-entity-list"
import { ProductThumbnail } from "@/components/product-thumbnail"

export function ProductSelect() {
  const { data: products } = useProductsQuery()
  const form = useFormContext<InvoiceSchema>()
  const [listResetKey, setListResetKey] = useState(0)

  const itemsList = useWatch({
    control: form.control,
    name: "items"
  })

  const handleAddProduct = (productId: string) => {
    const product = products?.find((p) => p.id === productId)
    if (!product) return

    form.setValue(
      "items",
      [
        {
          productId: product.id,
          quantity: 1,
          price: Number(product.price)
        },
        ...(itemsList || [])
      ],
      {
        shouldDirty: true,
        shouldValidate: true
      }
    )
    setListResetKey((k) => k + 1)
  }

  const selectedProductIds = useMemo(
    () => new Set((itemsList || []).map((item) => item.productId)),
    [itemsList]
  )

  const availableProducts =
    products?.filter((p) => !selectedProductIds.has(p.id)) || []

  const allAdded =
    products !== undefined &&
    products.length > 0 &&
    availableProducts.length === 0

  const isDisabled = form.formState.isSubmitting || allAdded

  return (
    <Controller
      control={form.control}
      name="items"
      render={({ fieldState }) => (
        <div className="flex flex-col gap-2">
          {allAdded ? (
            <Chip size="sm" variant="soft" color="default">
              All products added
            </Chip>
          ) : null}
          {products && products.length === 0 ? (
            <Chip size="sm" variant="soft" color="default">
              No products found
            </Chip>
          ) : null}
          {!allAdded ? (
            <SearchableEntityList<Product>
              label="Add product"
              items={availableProducts}
              isLoading={products === undefined}
              isDisabled={isDisabled}
              persistSelection={false}
              listResetKey={listResetKey}
              onSelect={(id) => {
                if (id) handleAddProduct(id)
              }}
              getItemId={(p) => p.id}
              getTextValue={(p) => `${p.name ?? ""} ${p.sku}`.trim()}
              searchPlaceholder="Search products…"
              searchAriaLabel="Search products"
              listAriaLabel="Products to add"
              emptyNoData="No products found"
              emptyNoMatch="No products match your search"
              listMaxHeightClassName="max-h-52"
              renderItem={(product) => (
                <div className="flex w-full min-w-0 items-center gap-3 py-0.5">
                  <ProductThumbnail
                    src={product.images?.[0]}
                    alt={product.name}
                    boxClassName="size-10 shrink-0 rounded-md"
                  />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="text-small truncate">{product.name}</span>
                    <span className="text-tiny text-default-400">
                      {formatPrice(product.price)} • Stock: {product.stock} • SKU:{" "}
                      {product.sku}
                    </span>
                  </div>
                </div>
              )}
            />
          ) : null}
          <FieldError>
            {fieldState.error?.message || fieldState.error?.root?.message}
          </FieldError>
        </div>
      )}
    />
  )
}
