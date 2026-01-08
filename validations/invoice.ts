import { z } from "zod"

export const invoiceItemSchema = z.object({
  productId: z.uuid("Invalid product ID"),
  quantity: z
    .number("Quantity is required")
    .int("Quantity must be a whole number")
    .positive("Quantity must be greater than 0")
    .min(1, "Quantity must be at least 1"),
  price: z
    .number("Price is required")
    .positive("Price must be greater than 0")
    .min(0.01, "Price must be at least 0.01")
})

export const invoiceSchema = z.object({
  customerId: z.uuid("Customer is required"),
  items: z.array(invoiceItemSchema).min(1, "Please add at least one product"),
  amountPaid: z
    .number("Amount paid is required")
    .min(0, "Amount paid cannot be negative")
})

export type InvoiceSchema = z.infer<typeof invoiceSchema>
export type InvoiceItemSchema = z.infer<typeof invoiceItemSchema>
