"use client"

import { useEffect, useMemo } from "react"
import { api } from "@/utils/api"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@heroui/react"
import { useInvoiceModalStore } from "@/stores/use-invoice-modal-store"
import { gerErrorMessage } from "@/utils/error-handler"
import { FormError } from "@/components/form-error"
import { type InvoiceSchema, invoiceSchema } from "@/validations/invoice"
import {
  useForm,
  FormProvider,
  type DefaultValues
} from "react-hook-form"
import { addToast } from "@heroui/react"

export function InvoiceForm() {
  const onClose = useInvoiceModalStore((state) => state.onClose)
  const invoice = useInvoiceModalStore((state) => state.invoice)
  const queryClient = useQueryClient()

  const isEditing = !!invoice

  const defaultValues: DefaultValues<InvoiceSchema> = useMemo(() => {
    return {
      customerId: invoice?.customerId || "",
      items: [], // Form fields will be added later, so we'll handle items population then
      amountPaid: invoice ? Number(invoice.amountPaid) : 0
    }
  }, [invoice])

  const form = useForm<InvoiceSchema>({
    resolver: zodResolver(invoiceSchema),
    defaultValues
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (isEditing && invoice) {
        await api.invoices[":id"].$patch({
          json: values,
          param: { id: invoice.id }
        })
        addToast({
          title: "Invoice updated successfully",
          color: "success"
        })
      } else {
        await api.invoices.$post({ json: values })
        addToast({
          title: "Invoice created successfully",
          color: "success"
        })
      }

      queryClient.invalidateQueries({ queryKey: ["invoices"] })
      onClose()
    } catch (error) {
      addToast({
        title: gerErrorMessage(
          error,
          isEditing ? "Failed to update invoice" : "Failed to create invoice"
        ),
        color: "danger"
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

        {/* Form fields will be added here later */}

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="flat" onPress={onClose} isDisabled={isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            color="primary"
            isLoading={isPending}
            isDisabled={isPending}
          >
            {isEditing ? "Update Invoice" : "Create Invoice"}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
