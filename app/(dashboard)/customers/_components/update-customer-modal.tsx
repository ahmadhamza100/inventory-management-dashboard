"use client"

import { CustomersForm } from "./customers-form"
import { useCustomerModalStore } from "@/stores/use-customer-modal-store"
import { Modal, useOverlayState } from "@heroui/react"

export function UpdateCustomerModal() {
  const onClose = useCustomerModalStore((state) => state.onClose)
  const customer = useCustomerModalStore((state) => state.customer)
  const storeOpen = useCustomerModalStore(
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
                Update Customer
              </Modal.Heading>
              <p className="text-sm font-normal text-default-500">
                Update details for{" "}
                <span className="font-medium text-foreground">
                  {customer?.name ?? "this customer"}
                </span>
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
