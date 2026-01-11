"use client"

import { useEffect, useMemo } from "react"
import { api } from "@/utils/api"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { useTransactionModalStore } from "@/stores/use-transaction-modal-store"
import { transactionTypeEnum } from "@/db/schema"
import { gerErrorMessage } from "@/utils/error-handler"
import { FormError } from "@/components/form-error"
import { FORMAT_CURRENCY_OPTS, toSentenceCase } from "@/utils/helpers"
import { today, getLocalTimeZone, CalendarDate } from "@internationalized/date"
import {
  Button,
  NumberInput,
  Select,
  SelectItem,
  DatePicker,
  Input,
  addToast
} from "@heroui/react"
import {
  type TransactionSchema,
  transactionSchema
} from "@/validations/transaction"
import {
  useForm,
  Controller,
  FormProvider,
} from "react-hook-form"

export function TransactionForm() {
  const onClose = useTransactionModalStore((state) => state.onClose)
  const transaction = useTransactionModalStore((state) => state.transaction)
  const queryClient = useQueryClient()

  const isEditing = !!transaction

  const defaultValues: TransactionSchema = useMemo(() => {
    if (transaction) {
      return {
        type: transaction.type,
        amount: Number(transaction.amount),
        date: new Date(transaction.date),
        description: transaction.description || ""
      }
    }
    return {
      type: "cash_in",
      amount: 0,
      date: new Date(),
      description: ""
    }
  }, [transaction])

  const form = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (isEditing && transaction) {
        await api.transactions[":id"].$patch({
          json: values,
          param: { id: transaction.id }
        })
        addToast({
          title: "Transaction updated successfully",
          color: "success"
        })
      } else {
        await api.transactions.$post({ json: values })
        addToast({
          title: "Transaction created successfully",
          color: "success"
        })
      }

      queryClient.invalidateQueries({ queryKey: ["transactions"] })
      onClose()
    } catch (error) {
      form.setError("root", {
        message: gerErrorMessage(
          error,
          isEditing
            ? "Failed to update transaction"
            : "Failed to create transaction"
        )
      })
    }
  })

  const isPending = form.formState.isSubmitting

  useEffect(() => {
    return () => {
      form.reset(defaultValues)
    }
  }, [form, defaultValues])

  const tz = getLocalTimeZone()

  const maxValue = today(tz)

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        <FormError form={form} />

        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
          <Controller
            control={form.control}
            name="type"
            render={({ field, fieldState }) => (
              <Select
                label="Type"
                labelPlacement="outside"
                selectedKeys={field.value ? [field.value] : []}
                isInvalid={fieldState.invalid}
                errorMessage={fieldState.error?.message}
                isDisabled={isPending}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0]
                  if (selected) field.onChange(selected)
                }}
              >
                {transactionTypeEnum.enumValues.map((type) => (
                  <SelectItem key={type}>{toSentenceCase(type)}</SelectItem>
                ))}
              </Select>
            )}
          />

          <Controller
            control={form.control}
            name="date"
            render={({ field, fieldState }) => {
              const date = new Date(field.value as string)

              const calendarDate = new CalendarDate(
                date.getFullYear(),
                date.getMonth() + 1,
                date.getDate()
              )

              return (
                <DatePicker
                  label="Date"
                  labelPlacement="outside"
                  value={calendarDate}
                  maxValue={maxValue}
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                  isDisabled={isPending}
                  onChange={(value) =>
                    field.onChange(value ? value.toDate(tz) : undefined)
                  }
                />
              )
            }}
          />
        </div>

        <Controller
          control={form.control}
          name="amount"
          render={({ field, fieldState }) => (
            <NumberInput
              value={field.value}
              onValueChange={field.onChange}
              label="Amount"
              labelPlacement="outside"
              placeholder="0.00"
              step={0.01}
              minValue={0}
              isInvalid={fieldState.invalid}
              isDisabled={isPending}
              errorMessage={fieldState.error?.message}
              classNames={{ inputWrapper: "shadow-none" }}
              formatOptions={FORMAT_CURRENCY_OPTS}
            />
          )}
        />

        <Controller
          control={form.control}
          name="description"
          render={({ field, fieldState }) => (
            <Input
              type="text"
              label="Description"
              labelPlacement="outside"
              placeholder="Enter transaction description (optional)"
              value={field.value || ""}
              onValueChange={(value) => field.onChange(value || "")}
              isInvalid={fieldState.invalid}
              errorMessage={fieldState.error?.message}
              isDisabled={isPending}
            />
          )}
        />

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="flat"
            onPress={onClose}
            isDisabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" color="primary" isLoading={isPending}>
            {isEditing ? "Update Transaction" : "Create Transaction"}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
