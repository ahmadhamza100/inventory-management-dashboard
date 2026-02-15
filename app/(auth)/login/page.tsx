"use client"

import { Link } from "@/components/link"
import { loginSchema } from "@/validations/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { addToast, Button, Input } from "@heroui/react"
import { Logo } from "@/components/logo"
import { PasswordInput } from "@/components/password-input"
import { createClient } from "@/utils/supabase/client"
import { ROUTES } from "@/utils/routes"
import { FormError } from "@/components/form-error"

export default function LoginPage() {
  const supabase = createClient()

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  })

  const onSubmit = form.handleSubmit(async (data) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password
    })

    if (error) {
      form.setError("root", { message: error?.message })
    } else {
      addToast({
        title: "Login successful",
        color: "success"
      })

      window?.location?.replace(ROUTES.dashboard)
    }
  })

  const isSubmitting = form.formState.isSubmitting

  return (
    <div className="w-full max-w-sm">
      <header className="space-y-2 text-center">
        <Logo href="/login" className="mx-auto size-10 text-foreground" />
        <h1 className="text-xl font-semibold">Sign in to your account</h1>
      </header>

      <form onSubmit={onSubmit} className="mt-8 mb-6 flex flex-col gap-4">
        <FormError form={form} />

        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <Input
              {...field}
              type="email"
              label="Email"
              isDisabled={isSubmitting}
              labelPlacement="outside"
              placeholder="you@example.com"
              isInvalid={fieldState.invalid}
              errorMessage={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <PasswordInput
              {...field}
              label="Password"
              isDisabled={isSubmitting}
              labelPlacement="outside"
              placeholder="••••••••"
              isInvalid={fieldState.invalid}
              errorMessage={fieldState.error?.message}
            />
          )}
        />

        <Button
          type="submit"
          color="primary"
          className="w-full"
          isLoading={isSubmitting}
        >
          Continue
        </Button>
      </form>

      <div className="flex items-center justify-center">
        <Link size="sm" href={ROUTES.resetPassword} isDisabled={isSubmitting}>
          Forgot your password?
        </Link>
      </div>
    </div>
  )
}
