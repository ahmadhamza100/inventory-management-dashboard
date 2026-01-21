import { z } from "zod"

export const createUserSchema = z.object({
  name: z.string(),
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
})

export type CreateUserSchema = z.infer<typeof createUserSchema>

export const updateUserSchema = createUserSchema.omit({ password: true })
export type UpdateUserSchema = z.infer<typeof updateUserSchema>
