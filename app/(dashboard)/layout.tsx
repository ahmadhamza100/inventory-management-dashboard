import { cookies } from "next/headers"
import { Header } from "./_components/header"
import { Sidebar } from "./_components/sidebar"
import { SidebarProvider } from "./_components/sidebar/context"

const SIDEBAR_COOKIE_NAME = "sidebar:state"

export default async function DashboardLayout({ children }: LayoutProps<"/">) {
  const cookieStore = await cookies()
  const sidebarCookie = cookieStore.get(SIDEBAR_COOKIE_NAME)
  const defaultOpen = sidebarCookie?.value !== "false"

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <div className="flex h-svh overflow-hidden">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
