"use client"

import { Modal, useOverlayState } from "@heroui/react"
import { useCustomerModalStore } from "@/stores/use-customer-modal-store"
import { CustomersForm } from "./customers-form"

export function CreateCustomerModal() {
  const onClose = useCustomerModalStore((state) => state.onClose)
  const storeOpen = useCustomerModalStore(
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
                Create Customer
              </Modal.Heading>
              <p className="text-sm font-normal text-default-500">
                Add a new customer to your system
              </p>
            </Modal.Header>
            <Modal.Body className="p-1">
              <CustomersForm />
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
