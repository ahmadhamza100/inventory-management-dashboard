import { api } from "@/utils/api"
import { useQuery } from "@tanstack/react-query"

export function usePaymentStatusQuery() {
  return useQuery({
    queryKey: ["analytics", "payment-status"],
    queryFn: async () => {
      const response = await api.analytics["payment-status"].$get()
      return response.json()
    }
  })
}
