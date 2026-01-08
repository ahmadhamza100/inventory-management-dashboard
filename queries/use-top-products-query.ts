import { api } from "@/utils/api"
import { useQuery } from "@tanstack/react-query"

export function useTopProductsQuery() {
  return useQuery({
    queryKey: ["analytics", "top-products"],
    queryFn: async () => {
      const response = await api.analytics["top-products"].$get()
      return response.json()
    }
  })
}
