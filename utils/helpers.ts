export function formatPrice(amount: string | number, currency = "PKR") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  }).format(Number(amount))
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
