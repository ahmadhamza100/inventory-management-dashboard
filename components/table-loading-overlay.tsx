"use client"

import { Spinner } from "@heroui/react"

type TableLoadingOverlayProps = {
  show: boolean
  label: string
  description?: string
}

/**
 * HeroUI v3 tables: keep real header + body structure; show an overlay instead of
 * a fake “loading row” with colspan (which fights the collection model).
 */
export function TableLoadingOverlay({
  show,
  label,
  description = "Please wait…"
}: TableLoadingOverlayProps) {
  if (!show) return null

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
      style={{
        borderRadius: "min(32px, var(--radius-2xl))"
      }}
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-surface/93 backdrop-blur-[2px] dark:bg-default-50/92"
    >
      <Spinner size="lg" />
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span className="text-xs text-default-500">{description}</span>
    </div>
  )
}
