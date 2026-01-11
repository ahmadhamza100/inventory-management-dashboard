"use client"

import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/react"
import { useInvoiceModalStore } from "@/stores/use-invoice-modal-store"
import { InvoiceForm } from "./invoice-form"

export function CreateInvoiceModal() {
  const onClose = useInvoiceModalStore((state) => state.onClose)
  const isOpen = useInvoiceModalStore(
    (state) => state.isOpen && state.type === "create"
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">Create Invoice</h2>
          <p className="text-sm font-normal text-default-500">
            Add a new invoice to your system
          </p>
        </ModalHeader>
        <ModalBody className="pb-6">
          <InvoiceForm />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
