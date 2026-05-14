"use client"

import { useCallback, useMemo } from "react"
import { Link } from "@/components/link"
import { loginSchema } from "@/validations/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { Button, Input, TextField, FieldError, toast } from "@heroui/react"
import { Logo } from "@/components/logo"
import { createClient } from "@/utils/supabase/client"
import { ROUTES } from "@/utils/routes"
import { FormError } from "@/components/form-error"

export default function LoginPage() {
  const supabase = useMemo(() => createClient(), [])

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  })

  const onSubmit = useCallback(
    async (data: { email: string; password: string }) => {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      })

      if (error) {
        form.setError("root", { message: error?.message })
      } else {
        toast.success("Login successful")
        window?.location?.replace(ROUTES.dashboard)
      }
    },
    [form, supabase]
  )

  const submit = useCallback(() => {
    const active = document.activeElement
    if (active instanceof HTMLElement) {
      active.blur()
    }
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        void form.handleSubmit(onSubmit)()
      })
    })
  }, [form, onSubmit])

  const isSubmitting = form.formState.isSubmitting

  return (
    <div className="w-full max-w-sm">
      <header className="space-y-2 text-center">
        <Logo href="/login" className="mx-auto size-10 text-foreground" />
        <h1 className="text-xl font-semibold text-foreground">
          Sign in to your account
        </h1>
      </header>

      <form
        className="mt-8 mb-6 flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
        noValidate
      >
        <FormError form={form} />

        <Controller
          control={form.control}
          name="email"
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
                type="email"
                placeholder="you@example.com"
                aria-label="Email"
              />
              <FieldError>{fieldState.error?.message}</FieldError>
            </TextField>
          )}
        />

        <Controller
          control={form.control}
          name="password"
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
                aria-label="Password"
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
          {isSubmitting ? "Signing in…" : "Continue"}
        </Button>
      </form>

      <div className="flex items-center justify-center">
        <Link
          className="text-sm"
          href={ROUTES.resetPassword}
          aria-disabled={isSubmitting}
          tabIndex={isSubmitting ? -1 : undefined}
        >
          Forgot your password?
        </Link>
      </div>
    </div>
  )
}
