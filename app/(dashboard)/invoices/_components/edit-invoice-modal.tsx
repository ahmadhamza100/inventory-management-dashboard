"use client"

import { InvoiceForm } from "./invoice-form"
import { useInvoiceModalStore } from "@/stores/use-invoice-modal-store"
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/react"

export function EditInvoiceModal() {
  const onClose = useInvoiceModalStore((state) => state.onClose)
  const isOpen = useInvoiceModalStore(
    (state) => state.isOpen && state.type === "update"
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">Edit Invoice</h2>
          <p className="text-sm font-normal text-default-500">
            Update invoice details
          </p>
        </ModalHeader>
        <ModalBody className="pb-6">
          <InvoiceForm />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
