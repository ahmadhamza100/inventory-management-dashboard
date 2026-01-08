"use client"

import { usePathname } from "next/navigation"
import { Link } from "@/components/link"
import { Logo } from "@/components/logo"
import { SIDEBAR_ITEMS } from "./items"
import {
  Button,
  cn,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody
} from "@heroui/react"

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
                {SIDEBAR_ITEMS.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Button
                      key={item.href}
                      as={Link}
                      onPress={onClose}
                      href={item.href}
                      variant={isActive ? "flat" : "light"}
                      color={isActive ? "primary" : "default"}
                      className="w-full justify-start gap-3"
                      startContent={
                        <item.icon
                          size={20}
                          className={cn(isActive && "text-primary")}
                        />
                      }
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
