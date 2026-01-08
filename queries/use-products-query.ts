import { api } from "@/utils/api"
import { useQuery } from "@tanstack/react-query"

export function useProductsQuery() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await api.products.$get()
      return response.json()
    }
  })
}
