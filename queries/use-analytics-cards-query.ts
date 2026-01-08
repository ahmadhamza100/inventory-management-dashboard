import { api } from "@/utils/api"
import { useQuery } from "@tanstack/react-query"

export function useAnalyticsCardsQuery() {
  return useQuery({
    queryKey: ["analytics", "cards"],
    queryFn: async () => {
      const response = await api.analytics.cards.$get()
      return response.json()
    }
  })
}
