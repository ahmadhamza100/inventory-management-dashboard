"use client"

import { Link } from "@/components/link"
import { Button, cn } from "@heroui/react"
import type { ISidebarItem } from "./items"

type NavItemButtonProps = ISidebarItem & {
  isActive?: boolean
  showLabel?: boolean
  onPress?: () => void
}

export function NavItemButton({
  href,
  icon: Icon,
  label,
  isActive = false,
  showLabel = true,
  onPress
}: NavItemButtonProps) {
  return (
    <Button
      as={Link}
      href={href}
      onPress={onPress}
      variant={isActive ? "flat" : "light"}
      color={isActive ? "primary" : "default"}
      className={cn(
        "w-full min-w-0 justify-start gap-3",
        !showLabel && "justify-center px-0"
      )}
      startContent={
        <Icon
          size={20}
          className={cn("shrink-0", isActive && "text-primary")}
        />
      }
    >
      {showLabel && (
        <span className={cn("text-sm font-medium", !showLabel && "truncate")}>
          {label}
        </span>
      )}
    </Button>
  )
}
