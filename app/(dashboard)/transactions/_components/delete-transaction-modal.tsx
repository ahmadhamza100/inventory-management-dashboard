"use client"

import { useTransition } from "react"
import { api } from "@/utils/api"
import { useQueryClient } from "@tanstack/react-query"
import { useTransactionModalStore } from "@/stores/use-transaction-modal-store"
import {
  Modal,
  useOverlayState,
  Button,
  Spinner,
  toast
} from "@heroui/react"
import { IconAlertTriangle } from "@tabler/icons-react"
import { gerErrorMessage } from "@/utils/error-handler"
import { formatDate, formatPrice, toSentenceCase } from "@/utils/helpers"

export function DeleteTransactionModal() {
  const onClose = useTransactionModalStore((state) => state.onClose)
  const transaction = useTransactionModalStore((state) => state.transaction)
  const storeOpen = useTransactionModalStore(
    (state) => state.isOpen && state.type === "delete"
  )
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()

  const overlay = useOverlayState({
    isOpen: storeOpen,
    onOpenChange: (open) => {
      if (!open) onClose()
    }
  })

  const handleDelete = () => {
    if (!transaction) return

    startTransition(async () => {
      try {
        await api.transactions[":id"].$delete({
          param: { id: transaction.id }
        })

        queryClient.invalidateQueries({ queryKey: ["transactions"] })
        toast.success("Transaction deleted")
        onClose()
      } catch (error) {
        toast.danger(gerErrorMessage(error, "Failed to delete transaction"))
      }
    })
  }

  if (!transaction) return null

  return (
    <Modal state={overlay}>
      <Modal.Backdrop>
        <Modal.Container size="md" scroll="outside">
          <Modal.Dialog>
            <Modal.Header className="relative flex flex-col gap-1 pr-12">
              <Modal.CloseTrigger className="absolute end-3 top-3" />
              <Modal.Heading className="text-xl font-semibold">
                Delete Transaction
              </Modal.Heading>
              <p className="text-sm font-normal text-default-500">
                Are you sure you want to delete this transaction?
              </p>
            </Modal.Header>
            <Modal.Body className="p-1">
              <div className="flex flex-col gap-4">
                <div className="flex min-w-0 items-center gap-4 rounded-lg border border-divider/50 bg-content1 p-4">
                  <div className="flex size-12 items-center justify-center rounded-full bg-danger/10">
                    <IconAlertTriangle size={24} className="text-danger" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {toSentenceCase(transaction.type)}
                    </p>
                    <p className="min-w-0 text-sm text-default-500">
                      <span className="tabular-nums whitespace-nowrap">
                        {formatPrice(transaction.amount)}
                      </span>
                      <span aria-hidden> • </span>
                      <span className="tabular-nums whitespace-nowrap">
                        {formatDate(transaction.date)}
                      </span>
                    </p>
                    {transaction.description && (
                      <p className="mt-1 text-sm text-default-400">
                        {transaction.description}
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-sm text-default-600">
                  This action cannot be undone. This will permanently delete the
                  transaction from your system.
                </p>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onPress={onClose} isDisabled={isPending}>
                Cancel
              </Button>
              <Button variant="danger" onPress={handleDelete} isDisabled={isPending}>
                {isPending ? (
                  <Spinner size="sm" color="current" />
                ) : (
                  "Delete Transaction"
                )}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
