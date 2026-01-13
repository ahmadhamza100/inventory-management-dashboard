"use client"

import { useCurrentUserQuery } from "@/queries/use-current-user-query"
import { UpdateNameForm } from "./_components/update-name-form"
import { ChangePasswordForm } from "./_components/change-password-form"
import { Spinner } from "@heroui/react"

export default function SettingsPage() {
  const { user, isLoading } = useCurrentUserQuery()

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-default-500">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="flex max-w-2xl flex-col gap-6">
        <UpdateNameForm initialName={user?.name || ""} />
        <ChangePasswordForm />
      </div>
    </div>
  )
}
