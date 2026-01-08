import { api } from "@/utils/api"
import { useQuery } from "@tanstack/react-query"

export function useMonthlyPerformanceQuery() {
  return useQuery({
    queryKey: ["analytics", "monthly-performance"],
    queryFn: async () => {
      const response = await api.analytics["monthly-performance"].$get()
      return response.json()
    }
  })
}
