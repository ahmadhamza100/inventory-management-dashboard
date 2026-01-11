import { api } from "@/utils/api"
import { useQuery } from "@tanstack/react-query"

export function useTransactionsQuery() {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const response = await api.transactions.$get()
      return response.json()
    }
  })
}
