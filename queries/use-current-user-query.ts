import { useQuery } from "@tanstack/react-query"
import type { User } from "@supabase/supabase-js"
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

  const user: Partial<User> & { name: string } = {
    ...data,
    name: getUserName(data)
  }

  return {
    ...query,
    user
  }
}
