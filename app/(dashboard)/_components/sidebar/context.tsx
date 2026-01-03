"use client"

import * as React from "react"

type SidebarContextType = {
  isOpen: boolean
  toggle: () => void
  setOpen: (open: boolean) => void
}

const SidebarContext = React.createContext<SidebarContextType | null>(null)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

type SidebarProviderProps = {
  children: React.ReactNode
  defaultOpen?: boolean
}

export function SidebarProvider({
  children,
  defaultOpen = true
}: SidebarProviderProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  const toggle = React.useCallback(() => {
    setIsOpen((prev) => {
      const newState = !prev
      document.cookie = `sidebar:state=${newState}; path=/; max-age=${60 * 60 * 24 * 365}`
      return newState
    })
  }, [])

  const setOpen = React.useCallback((open: boolean) => {
    setIsOpen(open)
    document.cookie = `sidebar:state=${open}; path=/; max-age=${60 * 60 * 24 * 365}`
  }, [])

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, setOpen }}>
      {children}
    </SidebarContext.Provider>
  )
}
