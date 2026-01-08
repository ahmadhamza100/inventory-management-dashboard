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
