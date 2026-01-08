import { create } from "zustand"
import type { Customer } from "@/db/schema"

type CustomerModalType = "create" | "update" | "delete" | "view-invoices"

interface CustomerModalStore {
  type: CustomerModalType | null
  customer?: Customer
  isOpen: boolean
  onOpen: (type: CustomerModalType, customer?: Customer) => void
  onClose: () => void
}

export const useCustomerModalStore = create<CustomerModalStore>((set) => ({
  type: null,
  customer: undefined,
  isOpen: false,
  onOpen: (type, customer) => set({ type, customer: customer, isOpen: true }),
  onClose: () => set({ type: null, isOpen: false, customer: undefined })
}))
