import { create } from "zustand"
import type { Invoice } from "@/db/schema"

type InvoiceModalType = "create" | "update" | "delete" | "view"

interface InvoiceModalStore {
  type: InvoiceModalType | null
  invoice?: Invoice
  isOpen: boolean
  onOpen: (type: InvoiceModalType, invoice?: Invoice) => void
  onClose: () => void
}

export const useInvoiceModalStore = create<InvoiceModalStore>((set) => ({
  type: null,
  invoice: undefined,
  isOpen: false,
  onOpen: (type, invoice) => set({ type, invoice: invoice, isOpen: true }),
  onClose: () => set({ type: null, isOpen: false, invoice: undefined })
}))
