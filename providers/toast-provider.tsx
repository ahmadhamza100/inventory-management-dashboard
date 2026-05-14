"use client"

import { Toast } from "@heroui/react"

/**
 * HeroUI `Toast.Provider` must not wrap the app as `children`: that replaces the
 * toast region’s default renderer and can yield a blank tree when the queue is empty.
 * Mount this as a sibling of your routes; use `toast.*` from `@heroui/react` anywhere.
 */
export function ToastProvider() {
  return <Toast.Provider placement="top end" />
}
