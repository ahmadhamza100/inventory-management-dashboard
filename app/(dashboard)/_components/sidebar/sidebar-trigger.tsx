"use client"

import { Button, Tooltip } from "@heroui/react"
import { IconLayoutSidebar } from "@tabler/icons-react"
import { useSidebar } from "./context"

export function SidebarTrigger() {
  const { toggle } = useSidebar()

  return (
    <Tooltip content="Toggle sidebar" delay={0}>
      <Button
        isIconOnly
        variant="light"
        size="sm"
        onPress={toggle}
        aria-label="Toggle sidebar"
      >
        <IconLayoutSidebar size={20} />
      </Button>
    </Tooltip>
  )
}
