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
    password: z
      .string()
      .min(8, { error: "Password must be at least 8 characters" }),
    confirmPassword: z
      .string()
      .min(1, { error: "Please confirm your password" })
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords do not match",
    path: ["confirmPassword"]
  })

export type NewPasswordSchema = z.infer<typeof newPasswordSchema>
