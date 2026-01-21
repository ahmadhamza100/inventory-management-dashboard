"use client"

import { usePathname } from "next/navigation"
import { Logo } from "@/components/logo"
import { useSidebarItems } from "./items"
import { NavItemButton } from "./nav-item-button"
import { LogoutButton } from "./logout-button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Divider
} from "@heroui/react"

type MobileSidebarProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileSidebar({ isOpen, onOpenChange }: MobileSidebarProps) {
  const pathname = usePathname()
  const items = useSidebarItems()

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
            <DrawerBody className="flex flex-col p-3">
              <nav className="flex-1 space-y-1">
                {items.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <NavItemButton
                      key={item.href}
                      {...item}
                      isActive={isActive}
                      showLabel={true}
                      onPress={onClose}
                    />
                  )
                })}
              </nav>
              <Divider className="my-2" />
              <LogoutButton
                showLabel={true}
                onPress={() => onOpenChange(false)}
              />
            </DrawerBody>
          </>
        )}
      </DrawerContent>
    </Drawer>
  )
}
