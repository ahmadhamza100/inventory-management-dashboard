"use client"

import { useEffect, useMemo, useRef, useCallback } from "react"
import { api } from "@/utils/api"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { useInvoiceModalStore } from "@/stores/use-invoice-modal-store"
import { useProductsQuery } from "@/queries/use-products-query"
import { gerErrorMessage } from "@/utils/error-handler"
import { FormError } from "@/components/form-error"
import { Button, Separator, Spinner, toast, cn } from "@heroui/react"
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
  const hasResetForm = useRef(false)

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional re-run on invoice change
  useEffect(() => {
    hasResetForm.current = false
  }, [invoice?.id])

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
        items,
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

  const onSubmit = useCallback(
    async (values: InvoiceSchema) => {
      try {
        if (isEditing && invoice) {
          await api.invoices[":id"].$patch({
            json: values,
            param: { id: invoice.id }
          })
          toast.success("Invoice updated successfully")
        } else {
          await api.invoices.$post({ json: values })
          toast.success("Invoice created successfully")
        }

        queryClient.invalidateQueries({ queryKey: ["invoices"] })
        queryClient.invalidateQueries({ queryKey: ["products"] })
        onClose()
      } catch (error) {
        toast.danger(
          gerErrorMessage(
            error,
            isEditing ? "Failed to update invoice" : "Failed to create invoice"
          )
        )
      }
    },
    [invoice, isEditing, onClose, queryClient]
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
    if (
      (!isEditing && !hasResetForm.current) ||
      (isEditing &&
        allProducts &&
        allProducts.length > 0 &&
        !hasResetForm.current)
    ) {
      form.reset(defaultValues)
      hasResetForm.current = true
    }
  }, [form, defaultValues, isEditing, allProducts])

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

        <UserSelect />

        <ProductsList />

        <Separator />

        <InvoiceSummary />

        <div
          className={cn(
            "mt-6 flex min-w-0 flex-wrap justify-end gap-3 border-t border-divider",
            "bg-overlay px-4 py-4 sm:px-5"
          )}
        >
          <Button
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
              "Update Invoice"
            ) : (
              "Create Invoice"
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
