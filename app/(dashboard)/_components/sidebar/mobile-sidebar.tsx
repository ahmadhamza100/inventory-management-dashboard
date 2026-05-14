"use client"

import { useOverlayState, Drawer } from "@heroui/react"
import { usePathname } from "next/navigation"
import { Logo } from "@/components/logo"
import { useSidebarItems } from "./items"
import { NavItemButton } from "./nav-item-button"
import { LogoutButton } from "./logout-button"
import { Separator } from "@heroui/react"

type MobileSidebarProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileSidebar({ isOpen, onOpenChange }: MobileSidebarProps) {
  const pathname = usePathname()
  const items = useSidebarItems()

  const overlay = useOverlayState({
    isOpen,
    onOpenChange
  })

  return (
    <Drawer state={overlay}>
      <Drawer.Backdrop>
        <Drawer.Content placement="left" className="flex h-full max-h-[100dvh] min-h-0 max-w-[16rem]">
          <Drawer.Dialog className="border-0 bg-overlay !p-0 shadow-2xl">
            <Drawer.Header className="relative flex min-h-11 items-center border-b border-divider/50 px-2.5 py-2 pr-10">
              <Drawer.CloseTrigger className="absolute end-1.5 top-1/2 -translate-y-1/2" />
              <Logo showText />
            </Drawer.Header>
            <Drawer.Body className="flex flex-col p-1.5">
              <nav className="flex-1 space-y-0">
                {items.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <NavItemButton
                      key={item.href}
                      {...item}
                      isActive={isActive}
                      showLabel={true}
                      onPress={() => overlay.close()}
                    />
                  )
                })}
              </nav>
              <Separator className="my-1" />
              <LogoutButton
                showLabel={true}
                onPress={() => onOpenChange(false)}
              />
            </Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  )
}
