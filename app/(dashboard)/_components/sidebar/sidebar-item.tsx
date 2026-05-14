"use client"

import NextLink from "next/link"
import { usePathname } from "next/navigation"
import { buttonVariants, Tooltip, cn } from "@heroui/react"
import { useSidebar } from "./context"
import type { ISidebarItem } from "./items"

export function SidebarItem({ href, icon: Icon, label }: ISidebarItem) {
  const pathname = usePathname()
  const { isOpen } = useSidebar()
  const isActive = pathname === href

  const btnClass = cn(
    buttonVariants({
      variant: isActive ? "secondary" : "ghost",
      size: "md"
    }),
    "flex w-full min-w-0 shrink-0 items-center justify-start gap-3 no-underline",
    !isOpen && "h-10 min-h-10 justify-center gap-0 px-0"
  )

  const inner = (
    <>
      <Icon
        size={20}
        className={cn("shrink-0", isActive && "text-primary")}
      />
      {isOpen && (
        <span className="truncate text-sm font-medium">{label}</span>
      )}
    </>
  )

  const linkBody = (
    <NextLink href={href} className={btnClass}>
      {inner}
    </NextLink>
  )

  if (!isOpen) {
    return (
      <Tooltip>
        <Tooltip.Trigger className="block w-full shrink-0">
          {linkBody}
        </Tooltip.Trigger>
        <Tooltip.Content placement="right">{label}</Tooltip.Content>
      </Tooltip>
    )
  }

  return linkBody
}
