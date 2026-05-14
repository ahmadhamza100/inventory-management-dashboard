"use client"

import { useMemo } from "react"
import { Label, RangeCalendar } from "@heroui/react"
import type { CalendarDate as CalDateType } from "@internationalized/date"
import { parseDate } from "@internationalized/date"

export type InlineDateRangeFieldProps = {
  label: string
  description?: string
  startDate: string
  endDate: string
  onChange: (start: string, end: string) => void
  /** Passed to RangeCalendar for remount when URL-driven range resets */
  remountKey?: string
  ariaLabel?: string
}

export function InlineDateRangeField({
  label,
  description,
  startDate,
  endDate,
  onChange,
  remountKey,
  ariaLabel = "Date range"
}: InlineDateRangeFieldProps) {
  const value = useMemo(() => {
    if (startDate && endDate) {
      try {
        return {
          start: parseDate(startDate),
          end: parseDate(endDate)
        }
      } catch {
        return null
      }
    }
    if (startDate) {
      try {
        const d = parseDate(startDate)
        return { start: d, end: d }
      } catch {
        return null
      }
    }
    return null
  }, [startDate, endDate])

  const pickerKey = remountKey ?? `${startDate}|${endDate}`

  const handleChange = (
    range: { start: CalDateType; end: CalDateType } | null | undefined
  ) => {
    if (range?.start && range?.end) {
      onChange(range.start.toString(), range.end.toString())
    } else {
      onChange("", "")
    }
  }

  return (
    <div className="min-w-0 w-full">
      <Label className="text-foreground mb-2 block text-sm font-medium">
        {label}
      </Label>
      {description ? (
        <p className="text-default-500 mb-3 text-xs">{description}</p>
      ) : null}
      <div className="border-divider w-full min-w-0 overflow-hidden rounded-xl border p-2">
        <RangeCalendar
          key={pickerKey}
          className="w-full min-w-0"
          aria-label={ariaLabel}
          value={value}
          onChange={handleChange}
        >
          <RangeCalendar.Header>
            <RangeCalendar.YearPickerTrigger>
              <RangeCalendar.YearPickerTriggerHeading />
              <RangeCalendar.YearPickerTriggerIndicator />
            </RangeCalendar.YearPickerTrigger>
            <RangeCalendar.NavButton slot="previous" />
            <RangeCalendar.NavButton slot="next" />
          </RangeCalendar.Header>
          <RangeCalendar.Grid weekdayStyle="short" className="w-full min-w-0">
            <RangeCalendar.GridHeader>
              {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
            </RangeCalendar.GridHeader>
            <RangeCalendar.GridBody>
              {(d) => <RangeCalendar.Cell date={d} />}
            </RangeCalendar.GridBody>
          </RangeCalendar.Grid>
          <RangeCalendar.YearPickerGrid>
            <RangeCalendar.YearPickerGridBody />
          </RangeCalendar.YearPickerGrid>
        </RangeCalendar>
      </div>
    </div>
  )
}
