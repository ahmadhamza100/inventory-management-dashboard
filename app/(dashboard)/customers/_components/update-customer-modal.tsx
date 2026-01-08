"use client"

import { CustomersForm } from "./customers-form"
import { useCustomerModalStore } from "@/stores/use-customer-modal-store"
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/react"

export function UpdateCustomerModal() {
  const onClose = useCustomerModalStore((state) => state.onClose)
  const customer = useCustomerModalStore((state) => state.customer)
  const isOpen = useCustomerModalStore(
    (state) => state.isOpen && state.type === "update"
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">Update Customer</h2>
          <p className="text-sm font-normal text-default-500">
            Update details for{" "}
            <span className="font-medium text-foreground">
              {customer?.name ?? "this customer"}
            </span>
          </p>
        </ModalHeader>
        <ModalBody className="pb-6">
          <CustomersForm />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
