"use client"

import { Button } from "@heroui/react"
import { IconMenu2 } from "@tabler/icons-react"

type MobileSidebarTriggerProps = {
  onPress: () => void
}

export function MobileSidebarTrigger({ onPress }: MobileSidebarTriggerProps) {
  return (
    <Button
      isIconOnly
      variant="light"
      size="sm"
      onPress={onPress}
      aria-label="Open menu"
      className="md:hidden"
    >
      <IconMenu2 size={20} />
    </Button>
  )
}
