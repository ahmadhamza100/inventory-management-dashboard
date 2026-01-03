"use client"

import {
  HeroUIProvider as NextHeroUIProvider,
  ToastProvider
} from "@heroui/react"

export function HeroUIProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextHeroUIProvider>
      <ToastProvider placement="top-right" />
      {children}
    </NextHeroUIProvider>
  )
}
