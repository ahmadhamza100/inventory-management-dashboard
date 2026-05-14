"use client"

import { Checkbox, Label } from "@heroui/react"
import type { Customer, Product } from "@/db/schema"
import { SearchableEntityList } from "@/components/searchable-entity-list"
import { InlineDateRangeField } from "@/components/inline-date-range-field"
import { ProductThumbnail } from "@/components/product-thumbnail"

export type InvoiceFilterDraft = {
  customer: string
  product: string
  paymentStatus: string
  startDate: string
  endDate: string
}

type InvoiceFiltersFormProps = {
  customers: Customer[] | undefined
  products: Product[] | undefined
  draft: InvoiceFilterDraft
  setDraft: (patch: Partial<InvoiceFilterDraft>) => void
}

const PAYMENT_OPTIONS = [
  { value: "", label: "Any status" },
  { value: "paid", label: "Paid" },
  { value: "partially_paid", label: "Partially paid" },
  { value: "unpaid", label: "Unpaid" }
] as const

function SectionRule() {
  return (
    <hr className="my-8 shrink-0 border-0 border-t border-divider" aria-hidden="true" />
  )
}

function PaymentStatusField({
  paymentStatus,
  setPaymentStatus
}: {
  paymentStatus: string
  setPaymentStatus: (v: string) => void
}) {
  return (
    <div>
      <Label className="text-foreground mb-3 block text-sm font-medium">
        Payment status
      </Label>
      <div className="border-divider bg-content1/40 flex flex-col gap-0 rounded-xl border p-1">
        {PAYMENT_OPTIONS.map((opt) => (
          <div
            key={opt.value || "any"}
            className="hover:bg-default-100/80 rounded-lg px-1 py-0.5"
          >
            <Checkbox
              isSelected={
                opt.value === ""
                  ? paymentStatus === ""
                  : paymentStatus === opt.value
              }
              onChange={(selected) => {
                if (selected) setPaymentStatus(opt.value)
              }}
              className="w-full flex-row items-center gap-3 py-2 pl-2 pr-3"
            >
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              <Checkbox.Content className="text-sm">{opt.label}</Checkbox.Content>
            </Checkbox>
          </div>
        ))}
      </div>
    </div>
  )
}

export function InvoiceFiltersForm({
  customers,
  products,
  draft,
  setDraft
}: InvoiceFiltersFormProps) {
  return (
    <div className="flex min-w-0 flex-col">
      <SearchableEntityList<Customer>
        label="Customer"
        items={customers}
        isLoading={customers === undefined}
        selectedId={draft.customer}
        onSelect={(id) => setDraft({ customer: id })}
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
        listMaxHeightClassName="max-h-56 sm:max-h-64"
        renderItem={(c) => (
          <div className="flex flex-col py-0.5">
            <span className="text-small">{c.name}</span>
            {c.email ? (
              <span className="text-tiny text-default-400">{c.email}</span>
            ) : null}
          </div>
        )}
      />

      <SectionRule />

      <SearchableEntityList<Product>
        label="Product"
        items={products}
        isLoading={products === undefined}
        selectedId={draft.product}
        onSelect={(id) => setDraft({ product: id })}
        getItemId={(p) => p.id}
        getTextValue={(p) => `${p.name ?? ""} ${p.sku}`.trim()}
        getSelectedSummary={(p) => p.name ?? p.sku}
        searchPlaceholder="Search products…"
        searchAriaLabel="Search products"
        listAriaLabel="Products"
        emptyNoData="No products found"
        emptyNoMatch="No products match your search"
        listMaxHeightClassName="max-h-56 sm:max-h-64"
        renderItem={(productRow) => (
          <div className="flex gap-3 py-0.5">
            <ProductThumbnail
              src={productRow.images?.[0]}
              alt={productRow.name ?? "Product"}
              boxClassName="size-11 shrink-0 rounded-md"
            />
            <div className="flex min-w-0 flex-col gap-px">
              <span className="text-small truncate">{productRow.name}</span>
              <span className="text-tiny text-default-400">
                SKU {productRow.sku}
              </span>
            </div>
          </div>
        )}
      />

      <SectionRule />

      <PaymentStatusField
        paymentStatus={draft.paymentStatus}
        setPaymentStatus={(v) => setDraft({ paymentStatus: v })}
      />

      <SectionRule />

      <InlineDateRangeField
        label="Invoice date range"
        description="Select a start and end date on the calendar. Tap a day twice to begin a single-day range."
        startDate={draft.startDate}
        endDate={draft.endDate}
        onChange={(s, e) =>
          setDraft({
            startDate: s,
            endDate: e
          })
        }
        ariaLabel="Invoice date range"
      />
    </div>
  )
}
