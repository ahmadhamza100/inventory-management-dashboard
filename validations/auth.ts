import { z } from "zod"

export const loginSchema = z.object({
  email: z.email({
    error: (e) => (e.input ? "Invalid email address" : "Email is required")
  }),
  password: z.string().min(1, "Password is required")
})

export type LoginSchema = z.infer<typeof loginSchema>

export const resetPasswordSchema = loginSchema.pick({ email: true })

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>

export const newPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, { error: "Password must be at least 8 characters" }),
    confirmPassword: z
      .string()
      .min(1, { error: "Please confirm your password" })
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    error: "Passwords do not match",
    path: ["confirmPassword"]
  })

export type NewPasswordSchema = z.infer<typeof newPasswordSchema>

export const updateNameSchema = z.object({
  name: z.string().min(1, "Name is required").max(256, "Name is too long")
})

export type UpdateNameSchema = z.infer<typeof updateNameSchema>

export const changePasswordSchema = newPasswordSchema
  .extend({
    oldPassword: z.string().min(1, "Current password is required")
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    error: "New password must be different from current password",
    path: ["newPassword"]
  })

export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>
