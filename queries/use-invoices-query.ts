import { api } from "@/utils/api"
import { useQuery } from "@tanstack/react-query"

export function useInvoicesQuery() {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const response = await api.invoices.$get()
      return response.json()
    }
  })
}
