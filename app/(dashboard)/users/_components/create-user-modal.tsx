"use client"

import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/react"
import { useUserModalStore } from "@/stores/use-user-modal-store"
import { UsersForm } from "./users-form"

export function CreateUserModal() {
  const onClose = useUserModalStore((state) => state.onClose)
  const isOpen = useUserModalStore(
    (state) => state.isOpen && state.type === "create"
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">Create User</h2>
          <p className="text-sm font-normal text-default-500">
            Add a new user to the system
          </p>
        </ModalHeader>
        <ModalBody className="pb-6">
          <UsersForm />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
