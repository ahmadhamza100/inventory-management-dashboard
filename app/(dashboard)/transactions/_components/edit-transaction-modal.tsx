"use client"

import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/react"
import { useTransactionModalStore } from "@/stores/use-transaction-modal-store"
import { TransactionForm } from "./transaction-form"

export function EditTransactionModal() {
  const onClose = useTransactionModalStore((state) => state.onClose)
  const isOpen = useTransactionModalStore(
    (state) => state.isOpen && state.type === "update"
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">Edit Transaction</h2>
          <p className="text-sm font-normal text-default-500">
            Update transaction details
          </p>
        </ModalHeader>
        <ModalBody className="pb-6">
          <TransactionForm />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
