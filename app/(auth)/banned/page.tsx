"use client"

import { Button } from "@heroui/react"
import { IconBan, IconLogout } from "@tabler/icons-react"
import { useLogout } from "@/mutations/use-logout"

export default function BannedPage() {
  const { logout, isLoggingOut } = useLogout()

  return (
    <div className="w-full max-w-md">
      <div className="space-y-8 text-center">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-danger/10">
            <IconBan size={40} className="text-danger" />
          </div>
        </div>

        {/* Content */}
        <header className="space-y-3">
          <h1 className="text-3xl font-bold">Account Suspended</h1>
          <p className="text-lg text-default-500">
            Your account has been banned from accessing this application.
          </p>
        </header>

        {/* Message Card */}
        <div className="rounded-lg border border-danger/20 bg-danger/5 p-6 text-left">
          <h2 className="mb-2 font-semibold text-danger">What does this mean?</h2>
          <p className="text-sm text-default-600">
            Your account has been permanently suspended due to a violation of our
            terms of service. You no longer have access to any features or data
            within this application.
          </p>
        </div>

        {/* Action */}
        <div className="space-y-4">
          <Button
            color="danger"
            size="lg"
            className="w-full"
            startContent={
              isLoggingOut ? null : <IconLogout size={20} />
            }
            onPress={() => logout()}
            isLoading={isLoggingOut}
          >
            {isLoggingOut ? "Logging out..." : "Log Out"}
          </Button>
          <p className="text-xs text-default-400">
            If you believe this is an error, please contact support.
          </p>
        </div>
      </div>
    </div>
  )
}
