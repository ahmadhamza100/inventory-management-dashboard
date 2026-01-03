import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export function useCurrentUserQuery() {
  const { data, ...query } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data } = await createClient().auth.getUser()
      return data.user
    }
  })

  return {
    ...query,
    user: {
      ...data,
      name: data?.user_metadata?.full_name || data?.email?.split("@")[0]
    }
  }
}
