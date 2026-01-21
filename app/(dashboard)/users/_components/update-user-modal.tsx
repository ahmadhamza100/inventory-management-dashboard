"use client"

import { UsersForm } from "./users-form"
import { useUserModalStore } from "@/stores/use-user-modal-store"
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/react"

export function UpdateUserModal() {
  const onClose = useUserModalStore((state) => state.onClose)
  const userName = useUserModalStore((state) => state.user?.name)
  const isOpen = useUserModalStore(
    (state) => state.isOpen && state.type === "update"
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">Update User</h2>
          <p className="text-sm font-normal text-default-500">
            Update details for{" "}
            <span className="font-medium text-foreground">
              {userName ?? "this user"}
            </span>
          </p>
        </ModalHeader>
        <ModalBody className="pb-6">
          <UsersForm />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
