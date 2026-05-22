import type { InvoiceListItem, InvoicesQueryData } from "@/queries/use-invoices-query"
import type { ProductListItem, ProductsQueryData } from "@/queries/use-products-query"

export function upsertProductInList(
  current: ProductsQueryData | undefined,
  product: ProductListItem
): ProductsQueryData {
  if (!current) {
    return [product]
  }

  const existingIndex = current.findIndex((item) => item.id === product.id)
  if (existingIndex === -1) {
    return [product, ...current]
  }

  return current.map((item) => (item.id === product.id ? product : item))
}

export function removeProductFromList(
  current: ProductsQueryData | undefined,
  productId: string
): ProductsQueryData {
  return (current ?? []).filter((item) => item.id !== productId)
}

export function mergeProductsInList(
  current: ProductsQueryData | undefined,
  products: ProductListItem[]
): ProductsQueryData {
  return products.reduce(
    (acc, product) => upsertProductInList(acc, product),
    current ?? []
  )
}

export function upsertInvoiceInList(
  current: InvoicesQueryData | undefined,
  invoice: InvoiceListItem
): InvoicesQueryData {
  if (!current) {
    return [invoice]
  }

  const withoutTarget = current.filter((item) => item.id !== invoice.id)
  return [invoice, ...withoutTarget]
}

export function removeInvoiceFromList(
  current: InvoicesQueryData | undefined,
  invoiceId: string
): InvoicesQueryData {
  return (current ?? []).filter((item) => item.id !== invoiceId)
}
