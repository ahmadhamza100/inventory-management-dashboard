"use client"

import { useCallback, useEffect, useMemo } from "react"
import { api } from "@/utils/api"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { useTransactionModalStore } from "@/stores/use-transaction-modal-store"
import { transactionTypeEnum } from "@/db/schema"
import { gerErrorMessage } from "@/utils/error-handler"
import { FormError } from "@/components/form-error"
import { FORMAT_CURRENCY_OPTS, toSentenceCase } from "@/utils/helpers"
import {
  today,
  getLocalTimeZone,
  CalendarDate
} from "@internationalized/date"
import {
  Button,
  Calendar,
  DateField,
  DatePicker,
  FieldError,
  ListBox,
  NumberField,
  Select,
  Spinner,
  TextField,
  Input,
  toast,
  cn
} from "@heroui/react"
import {
  type TransactionSchema,
  transactionSchema
} from "@/validations/transaction"
import { useForm, Controller, FormProvider } from "react-hook-form"

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

  const onSubmit = useCallback(
    async (values: TransactionSchema) => {
      try {
        if (isEditing && transaction) {
          await api.transactions[":id"].$patch({
            json: values,
            param: { id: transaction.id }
          })
          toast.success("Transaction updated successfully")
        } else {
          await api.transactions.$post({ json: values })
          toast.success("Transaction created successfully")
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
    },
    [form, isEditing, onClose, queryClient, transaction]
  )

  const isPending = form.formState.isSubmitting

  const requestSubmitWithBlur = useCallback(() => {
    const active = document.activeElement
    if (active instanceof HTMLElement) {
      active.blur()
    }
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        void form.handleSubmit(onSubmit)()
      })
    })
  }, [form, onSubmit])

  useEffect(() => {
    form.reset(defaultValues)
  }, [defaultValues, form])

  const tz = getLocalTimeZone()

  const maxValue = today(tz)

  return (
    <FormProvider {...form}>
      <form
        className="flex min-w-0 max-w-full flex-col gap-6 overflow-x-hidden"
        onSubmit={(e) => {
          e.preventDefault()
          requestSubmitWithBlur()
        }}
        noValidate
      >
        <FormError form={form} />

        <div className="grid min-w-0 grid-cols-1 items-start gap-4 md:grid-cols-2">
          <Controller
            control={form.control}
            name="type"
            render={({ field, fieldState }) => (
              <Select
                fullWidth
                aria-label="Transaction type"
                isInvalid={fieldState.invalid}
                isDisabled={isPending}
                selectedKey={field.value}
                onSelectionChange={(key) => {
                  if (key) field.onChange(String(key))
                }}
              >
                <FieldError>{fieldState.error?.message}</FieldError>
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {transactionTypeEnum.enumValues.map((typeVal) => (
                      <ListBox.Item
                        key={typeVal}
                        id={typeVal}
                        textValue={toSentenceCase(typeVal)}
                      >
                        {toSentenceCase(typeVal)}
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            )}
          />

          <Controller
            control={form.control}
            name="date"
            render={({ field, fieldState }) => {
              const dateObj = new Date(field.value as string)
              const calDate = new CalendarDate(
                dateObj.getFullYear(),
                dateObj.getMonth() + 1,
                dateObj.getDate()
              )
              return (
                <DatePicker
                  className="w-full min-w-0"
                  value={calDate}
                  onChange={(v) =>
                    field.onChange(v ? v.toDate(tz) : undefined)
                  }
                  maxValue={maxValue}
                  isDisabled={isPending}
                  isInvalid={fieldState.invalid}
                  granularity="day"
                  aria-label="Transaction date"
                >
                  <FieldError>{fieldState.error?.message}</FieldError>
                  <DateField.Group>
                    <DateField.Input>
                      {(segment) => (
                        <DateField.Segment segment={segment} />
                      )}
                    </DateField.Input>
                    <DateField.Suffix>
                      <DatePicker.Trigger>
                        <DatePicker.TriggerIndicator />
                      </DatePicker.Trigger>
                    </DateField.Suffix>
                  </DateField.Group>
                  <DatePicker.Popover>
                    <Calendar aria-label="Transaction date">
                      <Calendar.Header>
                        <Calendar.Heading />
                        <Calendar.NavButton slot="previous" />
                        <Calendar.NavButton slot="next" />
                      </Calendar.Header>
                      <Calendar.Grid>
                        <Calendar.GridHeader>
                          {(day) => (
                            <Calendar.HeaderCell>{day}</Calendar.HeaderCell>
                          )}
                        </Calendar.GridHeader>
                        <Calendar.GridBody>
                          {(d) => <Calendar.Cell date={d} />}
                        </Calendar.GridBody>
                      </Calendar.Grid>
                    </Calendar>
                  </DatePicker.Popover>
                </DatePicker>
              )
            }}
          />
        </div>

        <Controller
          control={form.control}
          name="amount"
          render={({ field, fieldState }) => (
            <NumberField
              fullWidth
              isInvalid={fieldState.invalid}
              isDisabled={isPending}
              minValue={0}
              step={0.01}
              formatOptions={FORMAT_CURRENCY_OPTS}
              name={field.name}
              onBlur={field.onBlur}
              value={field.value}
              onChange={(v) => field.onChange(v)}
              aria-label="Amount"
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

        <Controller
          control={form.control}
          name="description"
          render={({ field, fieldState }) => (
            <TextField
              isInvalid={fieldState.invalid}
              isDisabled={isPending}
              name={field.name}
              onBlur={field.onBlur}
              onChange={field.onChange}
              value={field.value ?? ""}
              ref={field.ref}
            >
              <Input
                placeholder="Enter transaction description (optional)"
                aria-label="Description"
              />
              <FieldError>{fieldState.error?.message}</FieldError>
            </TextField>
          )}
        />

        <div
          className={cn(
            "mt-6 flex min-w-0 flex-wrap justify-end gap-3 border-t border-divider",
            "bg-overlay px-4 py-4 sm:px-5"
          )}
        >
          <Button
            type="button"
            variant="secondary"
            onPress={onClose}
            isDisabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" isDisabled={isPending}>
            {isPending ? (
              <Spinner size="sm" color="current" />
            ) : isEditing ? (
              "Update Transaction"
            ) : (
              "Create Transaction"
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
