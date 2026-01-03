import { create } from "zustand"
import { type Product } from "@/queries/use-products-query"

type ProductModalType = "create" | "update" | "delete" | "view-invoices"

interface ProductModalStore {
  type: ProductModalType | null
  product?: Product
  isOpen: boolean
  onOpen: (type: ProductModalType, product?: Product) => void
  onClose: () => void
}

export const useProductModalStore = create<ProductModalStore>((set) => ({
  type: null,
  product: undefined,
  isOpen: false,
  onOpen: (type, product) => set({ type, product: product, isOpen: true }),
  onClose: () => set({ type: null, isOpen: false, product: undefined })
}))
