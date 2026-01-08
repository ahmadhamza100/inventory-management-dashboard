"use client"

import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/react"
import { useCustomerModalStore } from "@/stores/use-customer-modal-store"
import { CustomersForm } from "./customers-form"

export function CreateCustomerModal() {
  const onClose = useCustomerModalStore((state) => state.onClose)
  const isOpen = useCustomerModalStore(
    (state) => state.isOpen && state.type === "create"
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">Create Customer</h2>
          <p className="text-sm font-normal text-default-500">
            Add a new customer to your system
          </p>
        </ModalHeader>
        <ModalBody className="pb-6">
          <CustomersForm />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
