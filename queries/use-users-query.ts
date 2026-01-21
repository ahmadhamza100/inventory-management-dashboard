import { api } from "@/utils/api"
import { useQuery } from "@tanstack/react-query"

export function useUsersQuery() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await api.users.$get()
      return response.json()
    }
  })
}

export type User = NonNullable<
  NonNullable<Awaited<ReturnType<typeof useUsersQuery>>>["data"]
>[number]
