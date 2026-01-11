"use client"

import { useCurrentUserQuery } from "@/queries/use-current-user-query"
import { UpdateNameForm } from "./_components/update-name-form"
import { ChangePasswordForm } from "./_components/change-password-form"
import { Spinner } from "@heroui/react"

export default function SettingsPage() {
  const { user, isLoading } = useCurrentUserQuery()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-default-500 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="flex flex-col gap-6 max-w-2xl">
        <UpdateNameForm initialName={user?.name || ""} />
        <ChangePasswordForm />
      </div>
    </div>
  )
}
