"use client"

import { usePathname } from "next/navigation"
import { Link } from "@/components/link"
import { Button, Tooltip, cn } from "@heroui/react"
import { useSidebar } from "./context"
import type { ISidebarItem } from "./items"

export function SidebarItem({ href, icon: Icon, label }: ISidebarItem) {
  const pathname = usePathname()
  const { isOpen } = useSidebar()
  const isActive = pathname === href

  const buttonContent = (
    <Button
      as={Link}
      href={href}
      variant={isActive ? "flat" : "light"}
      color={isActive ? "primary" : "default"}
      className={cn(
        "w-full min-w-0 justify-start gap-3",
        !isOpen && "justify-center px-0"
      )}
      startContent={
        <Icon
          size={20}
          className={cn("shrink-0", isActive && "text-primary")}
        />
      }
    >
      {isOpen && <span className="truncate text-sm font-medium">{label}</span>}
    </Button>
  )

  if (!isOpen) {
    return (
      <Tooltip content={label} placement="right" delay={0}>
        {buttonContent}
      </Tooltip>
    )
  }

  return buttonContent
}
