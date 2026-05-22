"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Button,
  Card,
  CardHeader,
  Spinner,
  toast,
  TextField,
  Input,
  FieldError,
  Label
} from "@heroui/react"
import { FormError } from "@/components/form-error"
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

    const { error: updateError } = await supabase.auth.updateUser({
      password: data.newPassword
    })

    if (updateError) {
      form.setError("root", { message: updateError.message })
    } else {
      toast.success("Password updated successfully")
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
      <Card.Content>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <FormError form={form} />

          <Controller
            control={form.control}
            name="oldPassword"
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
                <Label>Current password</Label>
                <Input
                  type="password"
                  placeholder="Enter current password"
                  aria-label="Current password"
                />
                <FieldError>{fieldState.error?.message}</FieldError>
              </TextField>
            )}
          />

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
                <Label>New password</Label>
                <Input
                  type="password"
                  placeholder="Enter new password"
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
                <Label>Confirm new password</Label>
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  aria-label="Confirm new password"
                />
                <FieldError>{fieldState.error?.message}</FieldError>
              </TextField>
            )}
          />

          <div className="flex justify-end">
            <Button type="submit" variant="primary" isDisabled={isSubmitting}>
              {isSubmitting ? (
                <Spinner size="sm" color="current" />
              ) : (
                "Change Password"
              )}
            </Button>
          </div>
        </form>
      </Card.Content>
    </Card>
  )
}
