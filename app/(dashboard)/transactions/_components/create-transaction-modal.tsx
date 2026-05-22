"use client"

import { Modal, useOverlayState } from "@heroui/react"
import { useTransactionModalStore } from "@/stores/use-transaction-modal-store"
import { TransactionForm } from "./transaction-form"

export function CreateTransactionModal() {
  const onClose = useTransactionModalStore((state) => state.onClose)
  const storeOpen = useTransactionModalStore(
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
                Create Transaction
              </Modal.Heading>
              <p className="text-sm font-normal text-default-500">
                Add a new cash transaction to your system
              </p>
            </Modal.Header>
            <Modal.Body className="p-2">
              <TransactionForm />
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
