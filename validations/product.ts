import { z } from "zod"

export const productSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .min(2, "Product name must be at least 2 characters"),
  price: z
    .number("Price is required")
    .positive("Price must be greater than 0")
    .min(0.01, "Price must be at least 0.01"),
  stock: z
    .number("Stock is required")
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative"),
  image: z.string().nullish()
})

export type ProductSchema = z.infer<typeof productSchema>
