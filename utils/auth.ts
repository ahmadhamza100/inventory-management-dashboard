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

/**
 * Resolves the tenant (admin) ID for a given user.
 * - Admin users: returns their own `user.id`
 * - Staff users: returns `user_metadata.adminId` (set when the admin created them)
 * - Invalid/missing role: returns `null`
 */
export function getAdminId(user: Partial<User> | null | undefined): string | null {
  if (!user) return null

  const role = user.user_metadata?.role
  if (role === "admin") return user.id ?? null
  if (role === "user") {
    const adminId = user.user_metadata?.adminId
    return typeof adminId === "string" && adminId.length > 0 ? adminId : null
  }

  return null
}
