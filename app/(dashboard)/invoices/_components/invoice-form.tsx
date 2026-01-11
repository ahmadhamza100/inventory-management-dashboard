"use client"

import { useEffect, useMemo, useState } from "react"
import { api } from "@/utils/api"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { useInvoiceModalStore } from "@/stores/use-invoice-modal-store"
import { useCustomersQuery } from "@/queries/use-customers-query"
import { useProductsQuery } from "@/queries/use-products-query"
import { gerErrorMessage } from "@/utils/error-handler"
import { FormError } from "@/components/form-error"
import { IconPlus } from "@tabler/icons-react"
import { ProductSelect } from "./product-select"
import { InvoiceItemCard } from "./invoice-item-card"
import { InvoiceSummary } from "./invoice-summary"
import { type InvoiceSchema, invoiceSchema } from "@/validations/invoice"
import {
  Button,
  Autocomplete,
  AutocompleteItem,
  Divider,
  addToast
} from "@heroui/react"
import {
  useForm,
  FormProvider,
  Controller,
  useWatch,
  useFormContext,
  type DefaultValues
} from "react-hook-form"

export function InvoiceForm() {
  const onClose = useInvoiceModalStore((state) => state.onClose)
  const invoice = useInvoiceModalStore((state) => state.invoice)
  const queryClient = useQueryClient()
  const { data: customers } = useCustomersQuery()
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

  const customerId = useWatch({ control: form.control, name: "customerId" })

  const [customerSearchValue, setCustomerSearchValue] = useState("")

  const customerInputValue = useMemo(() => {
    if (customerId && customers) {
      const selectedCustomer = customers.find((c) => c.id === customerId)
      return selectedCustomer?.name || customerSearchValue
    }
    return customerSearchValue
  }, [customerId, customers, customerSearchValue])

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

        <Controller
          control={form.control}
          name="customerId"
          render={({ field, fieldState }) => (
            <Autocomplete
              label="Customer"
              placeholder="Select customer"
              defaultItems={customers || []}
              selectedKey={field.value || null}
              onSelectionChange={(key) => {
                field.onChange(key ? String(key) : "")
              }}
              inputValue={customerInputValue}
              onInputChange={setCustomerSearchValue}
              allowsCustomValue={false}
              labelPlacement="outside"
              isClearable
              isInvalid={fieldState.invalid}
              errorMessage={fieldState.error?.message}
              isDisabled={isPending}
              onClear={() => {
                field.onChange("")
                setCustomerSearchValue("")
              }}
            >
              {(customer) => (
                <AutocompleteItem key={customer.id} textValue={customer.name}>
                  <div className="flex flex-col">
                    <span className="text-small">{customer.name}</span>
                    {customer.email && (
                      <span className="text-tiny text-default-400">
                        {customer.email}
                      </span>
                    )}
                  </div>
                </AutocompleteItem>
              )}
            </Autocomplete>
          )}
        />

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

function ProductsList() {
  const form = useFormContext<InvoiceSchema>()

  const items = useWatch({
    control: form.control,
    name: "items"
  })

  return (
    <div className="flex flex-col gap-3">
      <ProductSelect />

      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item, index) => (
            <InvoiceItemCard key={item.productId + index} index={index} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-divider/50 bg-content1 p-8">
          <IconPlus className="mb-2 size-8 text-default-400" />
          <p className="text-sm text-default-500">
            No products added. Select a product above to get started.
          </p>
        </div>
      )}
    </div>
  )
}
