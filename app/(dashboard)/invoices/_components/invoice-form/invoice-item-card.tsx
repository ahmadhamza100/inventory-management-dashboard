"use client"

import { useMemo } from "react"
import { useFormContext, Controller, useWatch } from "react-hook-form"
import { Button, NumberInput, Tooltip, Image } from "@heroui/react"
import { IconTrash, IconPhoto } from "@tabler/icons-react"
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
    <div className="flex items-start gap-3 rounded-lg border border-divider/50 bg-content1 p-4">
      {product?.image ? (
        <Image
          src={product.image}
          alt={product.name}
          width={64}
          height={64}
          radius="md"
          className="shrink-0 object-cover"
        />
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-default-100">
          <IconPhoto className="size-6 text-default-400" />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium">
              {product?.name || "Unknown Product"}
            </p>
            {product && (
              <p className="text-xs text-default-500">
                Stock: {product.stock} available
              </p>
            )}
          </div>
          <Tooltip content="Remove product" delay={0}>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color="danger"
              onPress={handleRemove}
              isDisabled={isDisabled}
            >
              <IconTrash size={16} />
            </Button>
          </Tooltip>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Controller
            control={form.control}
            name={`items.${index}.quantity`}
            render={({ field, fieldState }) => (
              <NumberInput
                label="Quantity"
                value={field.value}
                onValueChange={field.onChange}
                minValue={1}
                maxValue={maxQuantity}
                step={1}
                isInvalid={fieldState.invalid}
                errorMessage={fieldState.error?.message}
                isDisabled={isDisabled}
                labelPlacement="outside"
                classNames={{ inputWrapper: "shadow-none" }}
              />
            )}
          />

          <Controller
            control={form.control}
            name={`items.${index}.price`}
            render={({ field, fieldState }) => (
              <NumberInput
                label="Unit Price"
                value={field.value}
                onValueChange={(value) => field.onChange(Number(value))}
                minValue={0.01}
                step={0.01}
                isInvalid={fieldState.invalid}
                errorMessage={fieldState.error?.message}
                isDisabled={isDisabled}
                labelPlacement="outside"
                classNames={{ inputWrapper: "shadow-none" }}
                formatOptions={FORMAT_CURRENCY_OPTS}
              />
            )}
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-default-500">Subtotal</span>
          <span className="font-semibold tabular-nums">
            {formatPrice(subtotal)}
          </span>
        </div>
      </div>
    </div>
  )
}
