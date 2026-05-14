"use client"

import { useMemo } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { Controller } from "react-hook-form"
import {
  NumberField,
  FieldError,
  Separator,
  cn
} from "@heroui/react"
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
        <div className="flex min-w-0 items-center justify-between gap-2">
          <span className="text-sm text-default-600">Subtotal</span>
          <span className="shrink-0 text-sm font-medium tabular-nums whitespace-nowrap">
            {formatPrice(totalAmount)}
          </span>
        </div>
        <Controller
          control={form.control}
          name="amountPaid"
          render={({ field, fieldState }) => (
            <NumberField
              fullWidth
              isInvalid={fieldState.invalid}
              isDisabled={isDisabled}
              minValue={0}
              maxValue={totalAmount}
              step={0.01}
              formatOptions={FORMAT_CURRENCY_OPTS}
              value={field.value}
              onChange={(v) => field.onChange(v != null ? Number(v) : v)}
              name={field.name}
              onBlur={field.onBlur}
              aria-label="Amount paid"
            >
              <NumberField.Group>
                <NumberField.DecrementButton />
                <NumberField.Input placeholder="0.00" />
                <NumberField.IncrementButton />
              </NumberField.Group>
              <FieldError>{fieldState.error?.message}</FieldError>
            </NumberField>
          )}
        />
        <Separator />
        <div className="flex min-w-0 items-center justify-between gap-2">
          <span className="text-sm font-semibold">Balance Due</span>
          <span
            className={cn(
              "shrink-0 text-sm font-bold tabular-nums whitespace-nowrap",
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
