import type { User } from "@supabase/supabase-js"

export function isAdmin(user: Partial<User> | null | undefined): boolean {
  if (!user) return false
  return user.user_metadata?.role === "admin"
}

export function getUserName(user: Partial<User> | null | undefined): string {
  if (!user) return ""
  return user.user_metadata?.full_name || user.email?.split("@")[0] || ""
}

export function isBanned(user: Partial<User> | null | undefined): boolean {
  if (!user) return false
  return user.user_metadata?.banned || false
}
