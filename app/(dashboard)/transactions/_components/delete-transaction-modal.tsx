"use client"

import { useTransition } from "react"
import { api } from "@/utils/api"
import { useQueryClient } from "@tanstack/react-query"
import { useTransactionModalStore } from "@/stores/use-transaction-modal-store"
import { addToast } from "@heroui/react"
import { IconAlertTriangle } from "@tabler/icons-react"
import { gerErrorMessage } from "@/utils/error-handler"
import { formatDate, formatPrice, toSentenceCase } from "@/utils/helpers"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button
} from "@heroui/react"

export function DeleteTransactionModal() {
  const onClose = useTransactionModalStore((state) => state.onClose)
  const transaction = useTransactionModalStore((state) => state.transaction)
  const isOpen = useTransactionModalStore(
    (state) => state.isOpen && state.type === "delete"
  )
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (!transaction) return

    startTransition(async () => {
      try {
        await api.transactions[":id"].$delete({
          param: { id: transaction.id }
        })

        queryClient.invalidateQueries({ queryKey: ["transactions"] })
        addToast({
          title: "Transaction deleted",
          color: "success"
        })
        onClose()
      } catch (error) {
        addToast({
          title: gerErrorMessage(error, "Failed to delete transaction"),
          color: "danger"
        })
      }
    })
  }

  if (!transaction) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">Delete Transaction</h2>
          <p className="text-sm font-normal text-default-500">
            Are you sure you want to delete this transaction?
          </p>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 rounded-lg border border-divider/50 bg-content1 p-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-danger/10">
                <IconAlertTriangle size={24} className="text-danger" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {toSentenceCase(transaction.type)}
                </p>
                <p className="text-sm text-default-500">
                  {formatPrice(transaction.amount)} •{" "}
                  {formatDate(transaction.date)}
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
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose} isDisabled={isPending}>
            Cancel
          </Button>
          <Button
            color="danger"
            onPress={handleDelete}
            isLoading={isPending}
            isDisabled={isPending}
          >
            Delete Transaction
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
