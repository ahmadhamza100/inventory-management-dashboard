"use client"

import { useEffect, useMemo } from "react"
import { api } from "@/utils/api"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { useInvoiceModalStore } from "@/stores/use-invoice-modal-store"
import { useProductsQuery } from "@/queries/use-products-query"
import { gerErrorMessage } from "@/utils/error-handler"
import { FormError } from "@/components/form-error"
import { Button, Divider, addToast } from "@heroui/react"
import { UserSelect } from "./user-select"
import { ProductsList } from "./products-list"
import { InvoiceSummary } from "./invoice-summary"
import { type InvoiceSchema, invoiceSchema } from "@/validations/invoice"
import { useForm, FormProvider, type DefaultValues } from "react-hook-form"

export function InvoiceForm() {
  const onClose = useInvoiceModalStore((state) => state.onClose)
  const invoice = useInvoiceModalStore((state) => state.invoice)
  const queryClient = useQueryClient()
  const { data: allProducts } = useProductsQuery()

  const isEditing = !!invoice

  const defaultValues: DefaultValues<InvoiceSchema> = useMemo(() => {
    if (invoice) {
      const items = invoice.products
        .map((p) => {
          const product = allProducts?.find((prod) => prod.name === p.name)
          return {
            productId: product?.id || "",
            quantity: p.quantity,
            price: Number(p.price)
          }
        })
        .filter((item) => item.productId)

      return {
        customerId: invoice.customerId || "",
        items: items,
        amountPaid: Number(invoice.amountPaid)
      }
    }
    return {
      customerId: "",
      items: [],
      amountPaid: 0
    }
  }, [invoice, allProducts])

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
      queryClient.invalidateQueries({ queryKey: ["products"] })
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
    form.reset(defaultValues)
  }, [form, defaultValues])

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        <FormError form={form} />

        <UserSelect />

        <ProductsList />

        <Divider />

        <InvoiceSummary />

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
