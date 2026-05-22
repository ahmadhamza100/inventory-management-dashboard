"use client"

import { useMemo } from "react"
import { useFormContext, Controller, useWatch } from "react-hook-form"
import { Button, NumberField, FieldError, Label } from "@heroui/react"
import { IconTrash } from "@tabler/icons-react"
import { ProductThumbnail } from "@/components/product-thumbnail"
import { formatPrice, FORMAT_CURRENCY_OPTS } from "@/utils/helpers"
import { useProductsQuery } from "@/queries/use-products-query"
import type { InvoiceSchema } from "@/validations/invoice"

interface InvoiceItemCardProps {
  index: number
}

export function InvoiceItemCard({ index }: InvoiceItemCardProps) {
  const form = useFormContext<InvoiceSchema>()
  const { data: allProducts } = useProductsQuery()
  const item = useWatch({
    control: form.control,
    name: `items.${index}`
  })

  const isDisabled = form.formState.isSubmitting

  const product = useMemo(
    () => allProducts?.find((p) => p.id === item?.productId),
    [allProducts, item?.productId]
  )

  const maxQuantity = product?.stock || 0
  const subtotal = useMemo(
    () => Number(item?.price || 0) * (item?.quantity || 0),
    [item?.price, item?.quantity]
  )

  if (!item) return null

  function handleRemove() {
    const newItems = form
      .getValues("items")
      .filter((i) => i.productId !== item.productId)

    form.setValue("items", newItems, {
      shouldDirty: true,
      shouldValidate: true
    })
  }

  return (
    <div className="min-w-0 rounded-xl border border-divider/60 bg-content1 p-3 shadow-sm sm:p-4">
      <div className="flex min-w-0 gap-3 sm:gap-4">
        <ProductThumbnail
          src={product?.images?.[0]}
          alt={product?.name || "Product"}
          boxClassName="size-14 shrink-0 rounded-lg sm:size-16"
        />

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium leading-snug text-foreground break-words">
              {product?.name || "Unknown Product"}
            </p>
            {product ? (
              <p className="mt-0.5 text-xs text-default-500">
                {product.stock} in stock
              </p>
            ) : null}
          </div>

          <div className="flex min-w-0 flex-col gap-3">
            <Controller
              control={form.control}
              name={`items.${index}.quantity`}
              render={({ field, fieldState }) => (
                <NumberField
                  fullWidth
                  isInvalid={fieldState.invalid}
                  isDisabled={isDisabled}
                  minValue={1}
                  maxValue={maxQuantity}
                  step={1}
                  value={field.value}
                  onChange={field.onChange}
                  name={field.name}
                  onBlur={field.onBlur}
                  aria-label="Quantity"
                >
                  <Label>Quantity</Label>
                  <NumberField.Group>
                    <NumberField.DecrementButton />
                    <NumberField.Input placeholder="Qty" />
                    <NumberField.IncrementButton />
                  </NumberField.Group>
                  <FieldError>{fieldState.error?.message}</FieldError>
                </NumberField>
              )}
            />

            <Controller
              control={form.control}
              name={`items.${index}.price`}
              render={({ field, fieldState }) => (
                <NumberField
                  fullWidth
                  isInvalid={fieldState.invalid}
                  isDisabled={isDisabled}
                  minValue={0.01}
                  step={0.01}
                  formatOptions={FORMAT_CURRENCY_OPTS}
                  value={field.value}
                  onChange={(v) => field.onChange(v != null ? Number(v) : v)}
                  name={field.name}
                  onBlur={field.onBlur}
                  aria-label="Unit price"
                >
                  <Label>Unit price</Label>
                  <NumberField.Group>
                    <NumberField.DecrementButton />
                    <NumberField.Input placeholder="0.00" />
                    <NumberField.IncrementButton />
                  </NumberField.Group>
                  <FieldError>{fieldState.error?.message}</FieldError>
                </NumberField>
              )}
            />
          </div>

          <div className="flex min-w-0 flex-col gap-2 border-t border-divider/50 pt-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <div className="flex min-w-0 items-center gap-2 text-sm">
              <span className="text-default-500">Subtotal</span>
              <span className="font-semibold tabular-nums whitespace-nowrap text-foreground">
                {formatPrice(subtotal)}
              </span>
            </div>

            <Button
              type="button"
              variant="danger-soft"
              size="sm"
              className="w-full shrink-0 sm:w-auto"
              aria-label="Remove product from invoice"
              onPress={handleRemove}
              isDisabled={isDisabled}
            >
              <span className="flex items-center justify-center gap-2">
                <IconTrash size={16} stroke={1.75} />
                Remove
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
