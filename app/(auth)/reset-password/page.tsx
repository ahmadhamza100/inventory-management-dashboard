"use client"

import { Link } from "@/components/link"
import { resetPasswordSchema } from "@/validations/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { addToast, Button, Input } from "@heroui/react"
import { Logo } from "@/components/logo"
import { createClient } from "@/utils/supabase/client"
import { ROUTES } from "@/utils/routes"
import { IconMail } from "@tabler/icons-react"
import { FormError } from "@/components/form-error"
import { env } from "@/env.config"

export default function ResetPasswordPage() {
  const supabase = createClient()

  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: ""
    }
  })

  const onSubmit = form.handleSubmit(async (data) => {
    const baseUrl = env.NEXT_PUBLIC_APP_URL || window.location.origin
    const redirectTo = `${baseUrl}${ROUTES.resetPassword}`

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo
    })

    if (error) {
      form.setError("root", { message: error.message })
    } else {
      addToast({
        title: "Reset link sent",
        color: "success"
      })
    }
  })

  const { isSubmitting, isSubmitSuccessful } = form.formState

  if (isSubmitSuccessful) {
    return (
      <div className="w-full max-w-sm">
        <header className="space-y-2 text-center">
          <Logo
            href={ROUTES.login}
            className="mx-auto size-10 text-foreground"
          />
          <h1 className="text-xl font-semibold">Check your email</h1>
        </header>

        <div className="mt-8 space-y-6">
          <div className="flex flex-col items-center gap-4 rounded-lg border border-default-200 bg-default-50/50 p-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <IconMail className="size-8 text-success" />
            </div>
            <div className="space-y-1 text-center">
              <p className="text-sm font-medium text-foreground">
                Reset link sent
              </p>
              <p className="text-xs text-default-500">
                We&apos;ve sent a password reset link to your email address.
                Please check your inbox and follow the instructions.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              as={Link}
              href={ROUTES.login}
              color="primary"
              className="w-full"
            >
              Back to sign in
            </Button>
            <p className="text-center text-xs text-default-400">
              Didn&apos;t receive the email? Check your spam folder or{" "}
              <button
                type="button"
                onClick={() => form.reset()}
                className="font-medium text-primary hover:underline"
              >
                try again
              </button>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <header className="space-y-2 text-center">
        <Logo href={ROUTES.login} className="mx-auto size-10 text-foreground" />
        <h1 className="text-xl font-semibold">Reset your password</h1>
        <p className="text-sm text-default-500">
          Enter your email and we&apos;ll send you a reset link
        </p>
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
              labelPlacement="outside"
              placeholder="you@example.com"
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
          Send reset link
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
