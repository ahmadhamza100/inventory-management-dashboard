export const ROUTES = {
  login: "/login",
  resetPassword: "/reset-password",
  resetPasswordToken: (token: string) => `/reset-password/${token}`,
  dashboard: "/",
  products: "/products",
  customers: "/customers",
  invoices: "/invoices",
  transactions: "/transactions",
  settings: "/settings"
} as const

export const PUBLIC_ROUTES = [ROUTES.login, ROUTES.resetPassword] as const

export const PROTECTED_ROUTES = [
  ROUTES.dashboard,
  ROUTES.products,
  ROUTES.customers,
  ROUTES.invoices,
  ROUTES.transactions,
  ROUTES.settings
] as const

export function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
}

export function isProtectedRoute(pathname: string) {
  return PROTECTED_ROUTES.some((route) => {
    return pathname === route || pathname.startsWith(`${route}/`)
  })
}
