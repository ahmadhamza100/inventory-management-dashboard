import { z } from "zod"
import { transactionTypeEnum } from "@/db/schema"

export const transactionSchema = z.object({
  type: z.enum(transactionTypeEnum.enumValues, "Transaction type is required"),
  amount: z
    .number("Amount is required")
    .positive("Amount must be greater than 0"),
  date: z.coerce.date("Please select transaction date"),
  description: z.string().optional()
})

export type TransactionSchema = z.infer<typeof transactionSchema>
