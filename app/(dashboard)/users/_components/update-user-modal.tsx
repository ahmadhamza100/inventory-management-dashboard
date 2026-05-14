"use client"

import { Modal, useOverlayState } from "@heroui/react"
import { useUserModalStore } from "@/stores/use-user-modal-store"
import { UsersForm } from "./users-form"

export function UpdateUserModal() {
  const onClose = useUserModalStore((state) => state.onClose)
  const userName = useUserModalStore((state) => state.user?.name)
  const storeOpen = useUserModalStore(
    (state) => state.isOpen && state.type === "update"
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
                Update User
              </Modal.Heading>
              <p className="text-sm font-normal text-default-500">
                Update details for{" "}
                <span className="font-medium text-foreground">
                  {userName ?? "this user"}
                </span>
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
