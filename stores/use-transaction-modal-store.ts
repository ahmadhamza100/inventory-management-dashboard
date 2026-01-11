import { create } from "zustand"
import { type Transaction } from "@/db/schema"

type TransactionModalType = "create" | "update" | "delete"

interface TransactionModalStore {
  type: TransactionModalType | null
  transaction?: Transaction
  isOpen: boolean
  onOpen: (type: TransactionModalType, transaction?: Transaction) => void
  onClose: () => void
}

export const useTransactionModalStore = create<TransactionModalStore>((set) => ({
  type: null,
  transaction: undefined,
  isOpen: false,
  onOpen: (type, transaction) => set({ type, transaction: transaction, isOpen: true }),
  onClose: () => set({ type: null, isOpen: false, transaction: undefined })
}))
