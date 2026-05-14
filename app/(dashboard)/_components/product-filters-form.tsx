"use client"

import { Checkbox, Label } from "@heroui/react"
import { InlineDateRangeField } from "@/components/inline-date-range-field"

export type ProductFilterDraft = {
  availability: "all" | "in_stock" | "out_of_stock"
  startDate: string
  endDate: string
}

type ProductFiltersFormProps = {
  draft: ProductFilterDraft
  setDraft: (patch: Partial<ProductFilterDraft>) => void
}

const OPTIONS: { value: ProductFilterDraft["availability"]; label: string }[] = [
  { value: "all", label: "All" },
  { value: "in_stock", label: "In stock" },
  { value: "out_of_stock", label: "Out of stock" }
]

export function ProductFiltersForm({ draft, setDraft }: ProductFiltersFormProps) {
  return (
    <div className="flex min-w-0 flex-col gap-8">
      <div>
        <Label className="text-foreground mb-3 block text-sm font-medium">
          Availability
        </Label>
        <div className="border-divider bg-content1/40 flex flex-col gap-0 rounded-xl border p-1">
          {OPTIONS.map((opt) => (
            <div
              key={opt.value}
              className="hover:bg-default-100/80 rounded-lg px-1 py-0.5"
            >
              <Checkbox
                isSelected={draft.availability === opt.value}
                onChange={(selected) => {
                  if (selected) setDraft({ availability: opt.value })
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

      <InlineDateRangeField
        label="Created date range"
        description="Select a start and end date. Tap a day twice for a single day."
        startDate={draft.startDate}
        endDate={draft.endDate}
        onChange={(s, e) =>
          setDraft({
            startDate: s,
            endDate: e
          })
        }
        ariaLabel="Product created date range"
      />
    </div>
  )
}
