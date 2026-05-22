"use client"

import { useCallback, useEffect, useMemo } from "react"
import { api } from "@/utils/api"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import {
  Button,
  TextField,
  Label,
  Input,
  FieldError,
  Spinner,
  toast,
  cn
} from "@heroui/react"
import { useCustomerModalStore } from "@/stores/use-customer-modal-store"
import { gerErrorMessage } from "@/utils/error-handler"
import { FormError } from "@/components/form-error"
import { type CustomerSchema, customerSchema } from "@/validations/customer"
import {
  useForm,
  Controller,
  FormProvider,
  type DefaultValues
} from "react-hook-form"

export function CustomersForm() {
  const onClose = useCustomerModalStore((state) => state.onClose)
  const customer = useCustomerModalStore((state) => state.customer)
  const queryClient = useQueryClient()

  const isEditing = !!customer

  const defaultValues: DefaultValues<CustomerSchema> = useMemo(() => {
    return {
      name: customer?.name ?? "",
      email: customer?.email ?? "",
      phone: customer?.phone ?? "",
      address: customer?.address ?? ""
    }
  }, [customer])

  const form = useForm<CustomerSchema>({
    resolver: zodResolver(customerSchema),
    defaultValues
  })

  const onSubmit = useCallback(
    async (values: CustomerSchema) => {
      try {
        if (isEditing) {
          await api.customers[":id"].$patch({
            json: values,
            param: { id: customer?.id }
          })
          toast.success("Customer updated successfully")
        } else {
          await api.customers.$post({ json: values })
          toast.success("Customer created successfully")
        }

        queryClient.invalidateQueries({ queryKey: ["customers"] })
        onClose()
      } catch (error) {
        form.setError("root", {
          message: gerErrorMessage(
            error,
            isEditing ? "Failed to update customer" : "Failed to create customer"
          )
        })
      }
    },
    [customer, form, isEditing, onClose, queryClient]
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

  return (
    <FormProvider {...form}>
      <form
        className="flex min-w-0 max-w-full flex-col gap-6 overflow-x-hidden p-2"
        onSubmit={(e) => {
          e.preventDefault()
          requestSubmitWithBlur()
        }}
        noValidate
      >
        <FormError form={form} />

        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <TextField
              isInvalid={fieldState.invalid}
              isDisabled={isPending}
              name={field.name}
              onBlur={field.onBlur}
              onChange={field.onChange}
              value={field.value}
              ref={field.ref}
            >
              <Label>Customer name</Label>
              <Input placeholder="Enter customer name" aria-label="Name" />
              <FieldError>{fieldState.error?.message}</FieldError>
            </TextField>
          )}
        />

        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <TextField
              isInvalid={fieldState.invalid}
              isDisabled={isPending}
              name={field.name}
              onBlur={field.onBlur}
              onChange={field.onChange}
              value={field.value ?? ""}
              ref={field.ref}
              type="email"
            >
              <Label>Email</Label>
              <Input
                placeholder="customer@example.com"
                aria-label="Email"
              />
              <FieldError>{fieldState.error?.message}</FieldError>
            </TextField>
          )}
        />

        <Controller
          control={form.control}
          name="phone"
          render={({ field, fieldState }) => (
            <TextField
              isInvalid={fieldState.invalid}
              isDisabled={isPending}
              name={field.name}
              onBlur={field.onBlur}
              onChange={field.onChange}
              value={field.value ?? ""}
              ref={field.ref}
              type="tel"
            >
              <Label>Phone</Label>
              <Input placeholder="+1234567890" aria-label="Phone" />
              <FieldError>{fieldState.error?.message}</FieldError>
            </TextField>
          )}
        />

        <Controller
          control={form.control}
          name="address"
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
              <Label>Address</Label>
              <Input placeholder="Enter customer address" aria-label="Address" />
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
              "Update Customer"
            ) : (
              "Create Customer"
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
