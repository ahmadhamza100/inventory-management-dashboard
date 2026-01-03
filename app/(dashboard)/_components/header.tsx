"use client"

import { useState } from "react"
import { UserMenu } from "./user-menu"
import { ThemeToggle } from "./theme-toggle"
import { MobileSidebar } from "./sidebar/mobile-sidebar"
import { SidebarTrigger } from "./sidebar/sidebar-trigger"
import { MobileSidebarTrigger } from "./sidebar/mobile-sidebar-trigger"

export function Header() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-divider/50 bg-content1 px-4">
        <div className="flex items-center gap-2">
          <MobileSidebarTrigger onPress={() => setIsMobileSidebarOpen(true)} />
          <div className="hidden md:block">
            <SidebarTrigger />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <UserMenu />
        </div>
      </header>

      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onOpenChange={setIsMobileSidebarOpen}
      />
    </>
  )
}
