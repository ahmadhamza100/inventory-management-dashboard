"use client"

import { Logo } from "@/components/logo"
import { cn } from "@heroui/react"
import { useSidebar } from "./context"
import { SidebarItem } from "./sidebar-item"
import {
  IconLayoutDashboard,
  IconPackage,
  IconFileInvoice,
  IconUsers
} from "@tabler/icons-react"

const sidebarItems = [
  {
    href: "/",
    icon: <IconLayoutDashboard size={20} />,
    label: "Dashboard"
  },
  {
    href: "/products",
    icon: <IconPackage size={20} />,
    label: "Products"
  },
  {
    href: "/invoices",
    icon: <IconFileInvoice size={20} />,
    label: "Invoices"
  },
  {
    href: "/customers",
    icon: <IconUsers size={20} />,
    label: "Customers"
  }
]

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
        {sidebarItems.map((item) => (
          <SidebarItem key={item.href} {...item} />
        ))}
      </nav>
    </aside>
  )
}
