"use client"

import { useEffect, useMemo } from "react"
import { api } from "@/utils/api"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { Button, Input, addToast } from "@heroui/react"
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

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (isEditing) {
        await api.customers[":id"].$patch({
          json: values,
          param: { id: customer?.id }
        })
        addToast({
          title: "Customer updated successfully",
          color: "success"
        })
      } else {
        await api.customers.$post({ json: values })
        addToast({
          title: "Customer created successfully",
          color: "success"
        })
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
  })

  const isPending = form.formState.isSubmitting

  useEffect(() => {
    return () => {
      form.reset(defaultValues)
    }
  }, [form, defaultValues])

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        <FormError form={form} />

        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <Input
              {...field}
              type="text"
              value={field.value}
              onValueChange={field.onChange}
              label="Name"
              labelPlacement="outside"
              placeholder="Enter customer name"
              isInvalid={fieldState.invalid}
              errorMessage={fieldState.error?.message}
              isDisabled={isPending}
            />
          )}
        />

        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <Input
              {...field}
              type="email"
              value={field.value || ""}
              onValueChange={field.onChange}
              label="Email"
              labelPlacement="outside"
              placeholder="customer@example.com"
              isInvalid={fieldState.invalid}
              errorMessage={fieldState.error?.message}
              isDisabled={isPending}
            />
          )}
        />

        <Controller
          control={form.control}
          name="phone"
          render={({ field, fieldState }) => (
            <Input
              {...field}
              type="tel"
              value={field.value || ""}
              onValueChange={field.onChange}
              label="Phone"
              labelPlacement="outside"
              placeholder="+1234567890"
              isInvalid={fieldState.invalid}
              errorMessage={fieldState.error?.message}
              isDisabled={isPending}
            />
          )}
        />

        <Controller
          control={form.control}
          name="address"
          render={({ field, fieldState }) => (
            <Input
              {...field}
              type="text"
              value={field.value || ""}
              onValueChange={field.onChange}
              label="Address"
              labelPlacement="outside"
              placeholder="Enter customer address"
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
            {isEditing ? "Update Customer" : "Create Customer"}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
