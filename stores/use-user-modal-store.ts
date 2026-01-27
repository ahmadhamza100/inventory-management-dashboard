import { create } from "zustand"
import type { User } from "@/queries/use-users-query"

type UserModalType =
  | "create"
  | "update"
  | "ban"
  | "unban"
  | "delete"
  | "change-password"

interface UserModalStore {
  type: UserModalType | null
  user?: User
  isOpen: boolean
  onOpen: (type: UserModalType, user?: User) => void
  onClose: () => void
}

export const useUserModalStore = create<UserModalStore>((set) => ({
  type: null,
  user: undefined,
  isOpen: false,
  onOpen: (type, user) => set({ type, user: user, isOpen: true }),
  onClose: () => set({ type: null, isOpen: false, user: undefined })
}))
