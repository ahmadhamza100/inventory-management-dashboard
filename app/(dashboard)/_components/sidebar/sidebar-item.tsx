"use client"

import { usePathname } from "next/navigation"
import { Link } from "@/components/link"
import { Button, Tooltip, cn } from "@heroui/react"
import { useSidebar } from "./context"

type SidebarItemProps = {
  href: string
  icon: React.ReactNode
  label: string
}

export function SidebarItem({ href, icon, label }: SidebarItemProps) {
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
        <span className={cn("shrink-0", isActive && "text-primary")}>
          {icon}
        </span>
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
