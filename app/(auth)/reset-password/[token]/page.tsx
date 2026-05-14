"use client"

import { useRouter } from "next/navigation"
import { Link } from "@/components/link"
import { newPasswordSchema } from "@/validations/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { Button, TextField, Input, FieldError, toast } from "@heroui/react"
import { Logo } from "@/components/logo"
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
      toast.success("Password updated")
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
            <TextField
              isInvalid={fieldState.invalid}
              isDisabled={isSubmitting}
              name={field.name}
              onBlur={field.onBlur}
              onChange={field.onChange}
              value={field.value}
              ref={field.ref}
            >
              <Input
                type="password"
                placeholder="••••••••"
                aria-label="New password"
              />
              <FieldError>{fieldState.error?.message}</FieldError>
            </TextField>
          )}
        />

        <Controller
          control={form.control}
          name="confirmPassword"
          render={({ field, fieldState }) => (
            <TextField
              isInvalid={fieldState.invalid}
              isDisabled={isSubmitting}
              name={field.name}
              onBlur={field.onBlur}
              onChange={field.onChange}
              value={field.value}
              ref={field.ref}
            >
              <Input
                type="password"
                placeholder="••••••••"
                aria-label="Confirm password"
              />
              <FieldError>{fieldState.error?.message}</FieldError>
            </TextField>
          )}
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          isDisabled={isSubmitting}
        >
          {isSubmitting ? "Resetting password…" : "Reset password"}
        </Button>
      </form>

      <div className="flex items-center justify-center">
        <Link
          href={ROUTES.login}
          className="text-sm"
          aria-disabled={isSubmitting}
          tabIndex={isSubmitting ? -1 : undefined}
        >
          Back to sign in
        </Link>
      </div>
    </div>
  )
}
