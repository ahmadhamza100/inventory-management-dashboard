import { z } from "zod"

export const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().max(15, "Phone must be less than 15 characters").optional(),
  address: z.string().optional()
})

export type CustomerSchema = z.infer<typeof customerSchema>
