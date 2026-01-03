"use client"

import { Link } from "@/components/link"
import { resetPasswordSchema } from "@/validations/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { Button, Input } from "@heroui/react"
import { Logo } from "@/components/logo"

export default function ResetPasswordPage() {
  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: ""
    }
  })

  const onSubmit = form.handleSubmit((data) => {
    console.log(data)
  })

  return (
    <div className="w-full max-w-sm">
      <header className="space-y-2 text-center">
        <Logo href="/login" className="mx-auto size-10 text-foreground" />
        <h1 className="text-xl font-semibold">Reset your password</h1>
        <p className="text-sm text-default-500">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </header>

      <form onSubmit={onSubmit} className="mt-8 mb-6 flex flex-col gap-4">
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
            />
          )}
        />

        <Button type="submit" color="primary" className="w-full">
          Send reset link
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
