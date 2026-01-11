import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { ROUTES } from "@/utils/routes"

const LOGOUT_MUTATION_KEY = ["logout"]

export function useLogout() {
  const router = useRouter()

  const { mutate, isPending, ...mutation } = useMutation({
    mutationKey: LOGOUT_MUTATION_KEY,
    mutationFn: async () => {
      await createClient().auth.signOut()
      router.push(ROUTES.login)
    }
  })

  return { logout: mutate, isLoggingOut: isPending, ...mutation }
}
