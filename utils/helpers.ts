export const FORMAT_CURRENCY_OPTS = {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 2,
  minimumFractionDigits: 0
} satisfies Intl.NumberFormatOptions

export function formatPrice(amount: string | number) {
  return new Intl.NumberFormat("en-US", FORMAT_CURRENCY_OPTS).format(
    Number(amount)
  )
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(new Date(date))
}

export function generateSKU() {
  return `SKU-${Math.random().toString(36).substring(2, 15)}`
}

export function generateInvoiceId(sequenceNumber: number): string {
  const padded = sequenceNumber.toString().padStart(6, "0")
  return `INV-${padded}`
}

export type PaymentStatus = "paid" | "partially_paid" | "unpaid"

export function getPaymentStatus(
  total: string | number,
  amountPaid: string | number
): PaymentStatus {
  const totalNum = Number(total)
  const paidNum = Number(amountPaid)

  if (paidNum >= totalNum) {
    return "paid"
  } else if (paidNum > 0) {
    return "partially_paid"
  } else {
    return "unpaid"
  }
}
