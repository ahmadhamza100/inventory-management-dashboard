import { NextResponse, type NextRequest } from "next/server"
import { updateSession } from "@/utils/supabase/middleware"
import { ROUTES, isPublicRoute, isProtectedRoute } from "@/utils/routes"

export async function proxy(request: NextRequest) {
  const { user, response } = await updateSession(request)
  const pathname = request.nextUrl.pathname

  const isPublic = isPublicRoute(pathname)
  const isProtected = isProtectedRoute(pathname)

  if (isProtected && !user) {
    return NextResponse.redirect(new URL(ROUTES.login, request.url))
  }

  if (isPublic && user && pathname === ROUTES.login) {
    return NextResponse.redirect(new URL(ROUTES.dashboard, request.url))
  }

  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  ]
}
