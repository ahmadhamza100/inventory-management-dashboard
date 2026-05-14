"use client"

import { Checkbox, Label } from "@heroui/react"
import { transactionTypeEnum } from "@/db/schema"
import { toSentenceCase } from "@/utils/helpers"
import { InlineDateRangeField } from "@/components/inline-date-range-field"

type TxType = (typeof transactionTypeEnum.enumValues)[number]

export type TransactionFilterDraft = {
  type: TxType | null
  startDate: string
  endDate: string
}

type TransactionFiltersFormProps = {
  draft: TransactionFilterDraft
  setDraft: (patch: Partial<TransactionFilterDraft>) => void
}

const TYPE_OPTIONS: { value: TxType | "all"; label: string }[] = [
  { value: "all", label: "All types" },
  ...transactionTypeEnum.enumValues.map((value) => ({
    value,
    label: toSentenceCase(value)
  }))
]

export function TransactionFiltersForm({
  draft,
  setDraft
}: TransactionFiltersFormProps) {
  return (
    <div className="flex min-w-0 flex-col gap-8">
      <div>
        <Label className="text-foreground mb-3 block text-sm font-medium">
          Transaction type
        </Label>
        <div className="border-divider bg-content1/40 flex flex-col gap-0 rounded-xl border p-1">
          {TYPE_OPTIONS.map((opt) => (
            <div
              key={opt.value}
              className="hover:bg-default-100/80 rounded-lg px-1 py-0.5"
            >
              <Checkbox
                isSelected={
                  opt.value === "all" ? draft.type == null : draft.type === opt.value
                }
                onChange={(selected) => {
                  if (!selected) return
                  setDraft({
                    type: opt.value === "all" ? null : opt.value
                  })
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
        label="Transaction date range"
        description="Select a start and end date. Tap a day twice for a single day."
        startDate={draft.startDate}
        endDate={draft.endDate}
        onChange={(s, e) =>
          setDraft({
            startDate: s,
            endDate: e
          })
        }
        ariaLabel="Transaction date range"
      />
    </div>
  )
}
