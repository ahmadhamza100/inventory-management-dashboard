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
        variant="light"
        color="danger"
        className="w-full justify-start gap-3"
        startContent={
          isLoggingOut ? (
            <Spinner size="sm" color="danger" />
          ) : (
            <IconLogout size={20} />
          )
        }
        onPress={handleLogout}
        isDisabled={isLoggingOut}
      >
        <span className="truncate text-sm font-medium">Log out</span>
      </Button>
    )
  }

  const buttonContent = (
    <Button
      isIconOnly
      variant="light"
      color="danger"
      className="w-full"
      onPress={handleLogout}
      isDisabled={isLoggingOut}
    >
      {isLoggingOut ? (
        <Spinner size="sm" color="danger" />
      ) : (
        <IconLogout size={20} />
      )}
    </Button>
  )

  return (
    <Tooltip content="Log out" placement="right" delay={0}>
      {buttonContent}
    </Tooltip>
  )
}
