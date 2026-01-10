import { create } from "zustand"

export type InvoiceWithDetails = {
  id: string
  customerId: string | null
  total: string
  amountPaid: string
  deletedAt: Date | null
  createdAt: Date | string
  updatedAt: Date | string
  customer: {
    name: string
    email: string | null
    phone: string | null
    address: string | null
  }
  products: Array<{
    name: string | null
    price: string
    stock: number | null
    quantity: number
    image: string | null
  }>
}

type InvoiceModalType = "create" | "update" | "delete" | "view"

interface InvoiceModalStore {
  type: InvoiceModalType | null
  invoice?: InvoiceWithDetails
  isOpen: boolean
  onOpen: (type: InvoiceModalType, invoice?: InvoiceWithDetails) => void
  onClose: () => void
}

export const useInvoiceModalStore = create<InvoiceModalStore>((set) => ({
  type: null,
  invoice: undefined,
  isOpen: false,
  onOpen: (type, invoice) => set({ type, invoice: invoice, isOpen: true }),
  onClose: () => {
    set({ type: null, isOpen: false })
    setTimeout(() => {
      set({ invoice: undefined })
    }, 500)
  }
}))
