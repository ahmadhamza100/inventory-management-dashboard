"use client"

import { useRouter } from "next/navigation"
import { Link } from "@/components/link"
import { newPasswordSchema } from "@/validations/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { addToast, Button } from "@heroui/react"
import { Logo } from "@/components/logo"
import { PasswordInput } from "@/components/password-input"
import { createClient } from "@/utils/supabase/client"
import { ROUTES } from "@/utils/routes"
import { FormError } from "@/components/form-error"

export default function NewPasswordPage() {
  const router = useRouter()
  const supabase = createClient()

  const form = useForm({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: ""
    }
  })

  const onSubmit = form.handleSubmit(async (data) => {
    const { error } = await supabase.auth.updateUser({
      password: data.newPassword
    })

    if (error) {
      form.setError("root", { message: error.message })
    } else {
      addToast({
        title: "Password updated",
        color: "success"
      })
      router.push(ROUTES.dashboard)
    }
  })

  const isSubmitting = form.formState.isSubmitting

  return (
    <div className="w-full max-w-sm">
      <header className="space-y-2 text-center">
        <Logo href={ROUTES.login} className="mx-auto size-10 text-foreground" />
        <h1 className="text-xl font-semibold">Set new password</h1>
      </header>

      <form onSubmit={onSubmit} className="mt-8 mb-6 flex flex-col gap-4">
        <FormError form={form} />

        <Controller
          control={form.control}
          name="newPassword"
          render={({ field, fieldState }) => (
            <PasswordInput
              {...field}
              label="New password"
              labelPlacement="outside"
              placeholder="••••••••"
              isInvalid={fieldState.invalid}
              errorMessage={fieldState.error?.message}
              isDisabled={isSubmitting}
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
              isDisabled={isSubmitting}
            />
          )}
        />

        <Button
          type="submit"
          color="primary"
          className="w-full"
          isLoading={isSubmitting}
        >
          Reset password
        </Button>
      </form>

      <div className="flex items-center justify-center">
        <Link size="sm" href={ROUTES.login} isDisabled={isSubmitting}>
          Back to sign in
        </Link>
      </div>
    </div>
  )
}
