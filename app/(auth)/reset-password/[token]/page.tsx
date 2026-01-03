"use client"

import { Link } from "@/components/link"
import { newPasswordSchema } from "@/validations/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { Button } from "@heroui/react"
import { Logo } from "@/components/logo"
import { PasswordInput } from "@/components/password-input"

export default function NewPasswordPage() {
  const form = useForm({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: ""
    }
  })

  const onSubmit = form.handleSubmit((data) => {
    console.log(data)
  })

  return (
    <div className="w-full max-w-sm">
      <header className="space-y-2 text-center">
        <Logo href="/login" className="mx-auto size-10 text-foreground" />
        <h1 className="text-xl font-semibold">Set new password</h1>
      </header>

      <form onSubmit={onSubmit} className="mt-8 mb-6 flex flex-col gap-4">
        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <PasswordInput
              {...field}
              label="New password"
              labelPlacement="outside"
              placeholder="••••••••"
              isInvalid={fieldState.invalid}
              errorMessage={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={form.control}
          name="confirmPassword"
          render={({ field, fieldState }) => (
            <PasswordInput
              {...field}
              label="Confirm password"
              labelPlacement="outside"
              placeholder="••••••••"
              isInvalid={fieldState.invalid}
              errorMessage={fieldState.error?.message}
            />
          )}
        />

        <Button type="submit" color="primary" className="w-full">
          Reset password
        </Button>
      </form>

      <div className="flex items-center justify-center">
        <Link size="sm" href="/login">
          Back to sign in
        </Link>
      </div>
    </div>
  )
}
