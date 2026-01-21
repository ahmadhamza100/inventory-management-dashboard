import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"
import { getUserName } from "@/utils/auth"

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
      name: getUserName(data)
    }
  }
}
