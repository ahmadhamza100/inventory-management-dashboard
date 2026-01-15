import { api } from "@/utils/api"
import { useQuery } from "@tanstack/react-query"

export type AnalyticsResponse = {
  monthlySales: number
  todaySales: number
  totalCustomers: number
  monthlyGrowth: number
  dailyTransactionsFlow: { in: number; out: number; flow: number }
  monthlyTransactionsFlow: { in: number; out: number; flow: number }
}

export function useAnalyticsCardsQuery() {
  return useQuery({
    queryKey: ["analytics", "cards"],
    queryFn: async () => {
      const response = await api.analytics.cards.$get()
      return (await response.json()) as AnalyticsResponse
    }
  })
}
