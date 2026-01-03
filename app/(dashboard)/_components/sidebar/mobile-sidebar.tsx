"use client"

import { usePathname } from "next/navigation"
import { Link } from "@/components/link"
import { Logo } from "@/components/logo"
import {
  Button,
  cn,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody
} from "@heroui/react"
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

type MobileSidebarProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileSidebar({ isOpen, onOpenChange }: MobileSidebarProps) {
  const pathname = usePathname()

  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="left"
      size="xs"
      hideCloseButton
    >
      <DrawerContent>
        {(onClose) => (
          <>
            <DrawerHeader className="border-b border-divider/50">
              <Logo showText />
            </DrawerHeader>
            <DrawerBody className="p-3">
              <nav className="space-y-1">
                {sidebarItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Button
                      key={item.href}
                      as={Link}
                      href={item.href}
                      variant={isActive ? "flat" : "light"}
                      color={isActive ? "primary" : "default"}
                      className="w-full justify-start gap-3"
                      startContent={
                        <span className={cn(isActive && "text-primary")}>
                          {item.icon}
                        </span>
                      }
                      onPress={onClose}
                    >
                      <span className="text-sm font-medium">{item.label}</span>
                    </Button>
                  )
                })}
              </nav>
            </DrawerBody>
          </>
        )}
      </DrawerContent>
    </Drawer>
  )
}
