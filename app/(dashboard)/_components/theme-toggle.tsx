"use client"

import { Button, Tooltip } from "@heroui/react"
import { IconSunFilled, IconMoonFilled } from "@tabler/icons-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()

  const isDark = resolvedTheme === "dark"

  return (
    <Tooltip>
      <Tooltip.Trigger>
        <Button
          isIconOnly
          variant="ghost"
          size="sm"
          onPress={() => setTheme(isDark ? "light" : "dark")}
        >
          <IconSunFilled className="size-4 dark:hidden" />
          <IconMoonFilled className="hidden size-4 dark:block" />
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content>
        {isDark ? "Light mode" : "Dark mode"}
      </Tooltip.Content>
    </Tooltip>
  )
}
