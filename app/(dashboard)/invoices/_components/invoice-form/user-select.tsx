"use client"

import { useCustomersQuery } from "@/queries/use-customers-query"
import { FieldError } from "@heroui/react"
import { useFormContext, Controller } from "react-hook-form"
import type { InvoiceSchema } from "@/validations/invoice"
import { SearchableEntityList } from "@/components/searchable-entity-list"
import type { Customer } from "@/db/schema"

export function UserSelect() {
  const { data: customers } = useCustomersQuery()
  const form = useFormContext<InvoiceSchema>()
  const isDisabled = form.formState.isSubmitting

  return (
    <Controller
      control={form.control}
      name="customerId"
      render={({ field, fieldState }) => (
        <div className="flex flex-col gap-1">
          <SearchableEntityList<Customer>
            label="Customer"
            items={customers}
            isLoading={customers === undefined}
            isDisabled={isDisabled}
            selectedId={field.value || undefined}
            onSelect={(id) => field.onChange(id)}
            getItemId={(c) => c.id}
            getTextValue={(c) =>
              [c.name, c.email, c.phone, c.address].filter(Boolean).join(" ")
            }
            getSelectedSummary={(c) => c.name}
            searchPlaceholder="Search customers…"
            searchAriaLabel="Search customers"
            listAriaLabel="Customers"
            emptyNoData="No customers found"
            emptyNoMatch="No customers match your search"
            listMaxHeightClassName="max-h-52"
            renderItem={(customer) => (
              <div className="flex flex-col py-0.5">
                <span className="text-small">{customer.name}</span>
                {customer.email ? (
                  <span className="text-tiny text-default-400">
                    {customer.email}
                  </span>
                ) : null}
              </div>
            )}
          />
          <FieldError>{fieldState.error?.message}</FieldError>
        </div>
      )}
    />
  )
}
