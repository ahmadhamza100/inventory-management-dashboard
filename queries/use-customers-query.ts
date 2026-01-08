import { api } from "@/utils/api"
import { useQuery } from "@tanstack/react-query"

export function useCustomersQuery() {
  return useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await api.customers.$get()
      return response.json()
    }
  })
}
