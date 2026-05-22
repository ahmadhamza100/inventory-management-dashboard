import { api } from "@/utils/api"
import { useQuery } from "@tanstack/react-query"

export const invoicesQueryKey = ["invoices"] as const

export function useInvoicesQuery() {
  return useQuery({
    queryKey: invoicesQueryKey,
    queryFn: async () => {
      const response = await api.invoices.$get()
      return response.json()
    }
  })
}

export type InvoicesQueryData = Awaited<
  ReturnType<Awaited<ReturnType<typeof api.invoices.$get>>["json"]>
>

export type InvoiceListItem = InvoicesQueryData[number]
