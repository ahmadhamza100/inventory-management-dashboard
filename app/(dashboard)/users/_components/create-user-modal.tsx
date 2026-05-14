"use client"

import { Modal, useOverlayState } from "@heroui/react"
import { useUserModalStore } from "@/stores/use-user-modal-store"
import { UsersForm } from "./users-form"

export function CreateUserModal() {
  const onClose = useUserModalStore((state) => state.onClose)
  const storeOpen = useUserModalStore(
    (state) => state.isOpen && state.type === "create"
  )

  const overlay = useOverlayState({
    isOpen: storeOpen,
    onOpenChange: (open) => {
      if (!open) onClose()
    }
  })

  return (
    <Modal state={overlay}>
      <Modal.Backdrop>
        <Modal.Container size="lg" scroll="outside">
          <Modal.Dialog>
            <Modal.Header className="relative flex flex-col gap-1 pr-12">
              <Modal.CloseTrigger className="absolute end-3 top-3" />
              <Modal.Heading className="text-xl font-semibold">
                Create User
              </Modal.Heading>
              <p className="text-sm font-normal text-default-500">
                Add a new user to the system
              </p>
            </Modal.Header>
            <Modal.Body className="p-1">
              <UsersForm />
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
