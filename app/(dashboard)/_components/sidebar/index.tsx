"use client"

import { Logo } from "@/components/logo"
import { cn } from "@heroui/react"
import { useSidebar } from "./context"
import { SidebarItem } from "./sidebar-item"
import { SIDEBAR_ITEMS } from "./items"
import { LogoutButton } from "./logout-button"

export function Sidebar() {
  const { isOpen } = useSidebar()

  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col border-r border-divider/50 bg-content1 transition-all duration-300 ease-in-out md:flex",
        isOpen ? "w-64" : "w-16"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-divider/50 px-4",
          !isOpen && "justify-center px-2"
        )}
      >
        <Logo showText={isOpen} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {SIDEBAR_ITEMS.map((item) => (
          <SidebarItem key={item.href} {...item} />
        ))}
      </nav>

      {/* Logout Button */}
      <div className="border-t border-divider/50 p-3">
        <LogoutButton showLabel={isOpen} />
      </div>
    </aside>
  )
}
