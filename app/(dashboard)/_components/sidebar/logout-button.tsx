"use client"

import { Button, Tooltip, Spinner } from "@heroui/react"
import { IconLogout } from "@tabler/icons-react"
import { useLogout } from "@/mutations/use-logout"

interface LogoutButtonProps {
  showLabel?: boolean
  onPress?: () => void
}

export function LogoutButton({ showLabel = true, onPress }: LogoutButtonProps) {
  const { logout, isLoggingOut } = useLogout()

  const handleLogout = () => {
    logout()
    onPress?.()
  }

  if (showLabel) {
    return (
      <Button
        variant="ghost"
        className="w-full justify-start gap-3 text-danger"
        onPress={handleLogout}
        isDisabled={isLoggingOut}
      >
        <span className="flex min-w-0 flex-1 items-center gap-3">
          {isLoggingOut ? (
            <Spinner size="sm" color="current" className="shrink-0" />
          ) : (
            <IconLogout size={20} className="shrink-0" />
          )}
          <span className="truncate text-sm font-medium">Log out</span>
        </span>
      </Button>
    )
  }

  const buttonContent = (
    <Button
      isIconOnly
      variant="ghost"
      className="h-10 min-h-10 w-full shrink-0 text-danger"
      onPress={handleLogout}
      isDisabled={isLoggingOut}
    >
      {isLoggingOut ? (
        <Spinner size="sm" className="text-danger" />
      ) : (
        <IconLogout size={20} />
      )}
    </Button>
  )

  return (
    <Tooltip>
      <Tooltip.Trigger className="block w-full shrink-0">
        {buttonContent}
      </Tooltip.Trigger>
      <Tooltip.Content>Log out</Tooltip.Content>
    </Tooltip>
  )
}
