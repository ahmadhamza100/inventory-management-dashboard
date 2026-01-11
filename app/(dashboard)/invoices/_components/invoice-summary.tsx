"use client"

import { useMemo } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { NumberInput, Divider, cn } from "@heroui/react"
import { Controller } from "react-hook-form"
import { formatPrice, FORMAT_CURRENCY_OPTS } from "@/utils/helpers"
import type { InvoiceSchema } from "@/validations/invoice"

export function InvoiceSummary() {
  const form = useFormContext<InvoiceSchema>()
  const items = useWatch({ control: form.control, name: "items" })
  const amountPaid = useWatch({ control: form.control, name: "amountPaid" })

  const totalAmount = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + Number(item.price || 0) * (item.quantity || 0),
      0
    )
  }, [items])

  const balanceDue = useMemo(
    () => Math.max(0, totalAmount - (amountPaid || 0)),
    [totalAmount, amountPaid]
  )

  const isPaid = balanceDue <= 0
  const isDisabled = form.formState.isSubmitting

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold">Summary</h3>
      <div className="flex flex-col gap-y-3 rounded-lg border border-divider/50 bg-content1 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-default-600">Subtotal</span>
          <span className="text-sm font-medium tabular-nums">
            {formatPrice(totalAmount)}
          </span>
        </div>
        <Controller
          control={form.control}
          name="amountPaid"
          render={({ field, fieldState }) => (
            <NumberInput
              label="Amount Paid"
              value={field.value}
              onValueChange={(value) => field.onChange(Number(value))}
              minValue={0}
              maxValue={totalAmount}
              step={0.01}
              isInvalid={fieldState.invalid}
              errorMessage={fieldState.error?.message}
              isDisabled={isDisabled}
              labelPlacement="outside"
              formatOptions={FORMAT_CURRENCY_OPTS}
            />
          )}
        />
        <Divider />
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Balance Due</span>
          <span
            className={cn(
              "text-sm font-bold tabular-nums",
              isPaid ? "text-success" : "text-danger"
            )}
          >
            {formatPrice(balanceDue)}
          </span>
        </div>
      </div>
    </div>
  )
}
