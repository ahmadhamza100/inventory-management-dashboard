"use client"

import { useMemo } from "react"
import { DateRangePicker } from "@heroui/react"
import {
  parseDate,
  today,
  getLocalTimeZone,
  CalendarDate
} from "@internationalized/date"
import { parseAsString, useQueryState } from "nuqs"

interface DateRangeFilterProps {
  startDateParam?: string
  endDateParam?: string
}

export function DateRangeFilter({
  startDateParam = "startDate",
  endDateParam = "endDate"
}: DateRangeFilterProps) {
  const [startDate, setStartDate] = useQueryState(
    startDateParam,
    parseAsString.withDefault("")
  )
  const [endDate, setEndDate] = useQueryState(
    endDateParam,
    parseAsString.withDefault("")
  )

  const value = useMemo(() => {
    if (startDate && endDate) {
      try {
        return {
          start: parseDate(startDate),
          end: parseDate(endDate)
        }
      } catch {
        return undefined
      }
    }
    if (startDate) {
      try {
        return {
          start: parseDate(startDate),
          end: parseDate(startDate)
        }
      } catch {
        return undefined
      }
    }
    return undefined
  }, [startDate, endDate])

  const maxValue = today(getLocalTimeZone())

  const handleChange = (
    range: { start: CalendarDate; end: CalendarDate } | null
  ) => {
    if (range?.start && range?.end) {
      setStartDate(range.start.toString())
      setEndDate(range.end.toString())
    } else {
      setStartDate(null)
      setEndDate(null)
    }
  }

  return (
    <DateRangePicker
      value={value}
      onChange={handleChange}
      maxValue={maxValue}
      variant="flat"
      fullWidth={false}
    />
  )
}
