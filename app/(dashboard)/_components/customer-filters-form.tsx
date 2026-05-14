"use client"

import { InlineDateRangeField } from "@/components/inline-date-range-field"

export type CustomerFilterDraft = {
  startDate: string
  endDate: string
}

type CustomerFiltersFormProps = {
  draft: CustomerFilterDraft
  setDraft: (patch: Partial<CustomerFilterDraft>) => void
}

export function CustomerFiltersForm({ draft, setDraft }: CustomerFiltersFormProps) {
  return (
    <div className="flex min-w-0 flex-col gap-6">
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
        ariaLabel="Customer created date range"
      />
    </div>
  )
}
