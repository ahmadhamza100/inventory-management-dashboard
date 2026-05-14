"use client"

import { Button, Tooltip } from "@heroui/react"
import { IconLayoutSidebar } from "@tabler/icons-react"
import { useSidebar } from "./context"

export function SidebarTrigger() {
  const { toggle } = useSidebar()

  return (
    <Tooltip>
      <Tooltip.Trigger>
        <Button
          isIconOnly
          variant="ghost"
          size="sm"
          onPress={toggle}
          aria-label="Toggle sidebar"
        >
          <IconLayoutSidebar size={20} />
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content>Toggle sidebar</Tooltip.Content>
    </Tooltip>
  )
}
