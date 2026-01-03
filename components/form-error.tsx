"use client"

import { FieldValues, UseFormReturn } from "react-hook-form"
import { IconAlertTriangleFilled, IconX } from "@tabler/icons-react"

export function FormError<T extends FieldValues>({
  form
}: {
  form: UseFormReturn<T>
}) {
  const error = form.formState.errors.root?.message

  if (!error) {
    return null
  }

  return (
    <div className="flex items-center gap-2 rounded-lg bg-danger/10 p-3 text-sm text-danger">
      <IconAlertTriangleFilled className="size-4.5 shrink-0 text-danger-400" />
      <span className="flex-1">{error}</span>
      <button
        type="button"
        onClick={() => form.clearErrors("root")}
        className="shrink-0 text-danger-400 transition-colors hover:text-danger"
        aria-label="Dismiss error"
      >
        <IconX className="size-3.5" />
      </button>
    </div>
  )
}
