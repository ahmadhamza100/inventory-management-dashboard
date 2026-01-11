"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Card, CardHeader, CardBody } from "@heroui/react"
import { addToast } from "@heroui/react"
import { FormError } from "@/components/form-error"
import { PasswordInput } from "@/components/password-input"
import {
  changePasswordSchema,
  type ChangePasswordSchema
} from "@/validations/auth"
import { createClient } from "@/utils/supabase/client"

export function ChangePasswordForm() {
  const supabase = createClient()

  const form = useForm<ChangePasswordSchema>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  })

  const onSubmit = form.handleSubmit(async (data) => {
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user?.email) {
      form.setError("root", { message: "User not found" })
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: data.oldPassword
    })

    if (signInError) {
      form.setError("oldPassword", {
        message: "Current password is incorrect"
      })
      return
    }

    // If old password is correct, update to new password
    const { error: updateError } = await supabase.auth.updateUser({
      password: data.newPassword
    })

    if (updateError) {
      form.setError("root", { message: updateError.message })
    } else {
      addToast({
        title: "Password updated successfully",
        color: "success"
      })
      form.reset()
    }
  })

  const isSubmitting = form.formState.isSubmitting

  return (
    <Card>
      <CardHeader className="flex flex-col items-start gap-1">
        <h3 className="text-lg font-semibold">Change Password</h3>
        <p className="text-sm text-default-500">
          Update your password to keep your account secure
        </p>
      </CardHeader>
      <CardBody>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <FormError form={form} />

          <Controller
            control={form.control}
            name="oldPassword"
            render={({ field, fieldState }) => (
              <PasswordInput
                {...field}
                label="Current Password"
                placeholder="Enter current password"
                labelPlacement="outside"
                isDisabled={isSubmitting}
                isInvalid={fieldState.invalid}
                errorMessage={fieldState.error?.message}
              />
            )}
          />

          <Controller
            control={form.control}
            name="newPassword"
            render={({ field, fieldState }) => (
              <PasswordInput
                {...field}
                label="New Password"
                placeholder="Enter new password"
                labelPlacement="outside"
                isDisabled={isSubmitting}
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
                label="Confirm New Password"
                placeholder="Confirm new password"
                labelPlacement="outside"
                isDisabled={isSubmitting}
                isInvalid={fieldState.invalid}
                errorMessage={fieldState.error?.message}
              />
            )}
          />

          <div className="flex justify-end">
            <Button
              type="submit"
              color="primary"
              isLoading={isSubmitting}
              isDisabled={isSubmitting}
            >
              Change Password
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  )
}
