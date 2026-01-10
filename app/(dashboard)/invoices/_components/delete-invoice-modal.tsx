"use client"

import { useTransition } from "react"
import { api } from "@/utils/api"
import { useQueryClient } from "@tanstack/react-query"
import { useInvoiceModalStore } from "@/stores/use-invoice-modal-store"
import { addToast } from "@heroui/react"
import { IconAlertTriangle } from "@tabler/icons-react"
import { gerErrorMessage } from "@/utils/error-handler"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button
} from "@heroui/react"

export function DeleteInvoiceModal() {
  const onClose = useInvoiceModalStore((state) => state.onClose)
  const invoice = useInvoiceModalStore((state) => state.invoice)
  const isOpen = useInvoiceModalStore(
    (state) => state.isOpen && state.type === "delete"
  )
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (!invoice) return

    startTransition(async () => {
      try {
        await api.invoices[":id"].$delete({
          param: { id: invoice.id }
        })

        queryClient.invalidateQueries({ queryKey: ["invoices"] })
        addToast({
          title: "Invoice deleted",
          color: "success"
        })
        onClose()
      } catch (error) {
        addToast({
          title: gerErrorMessage(error, "Failed to delete invoice"),
          color: "danger"
        })
      }
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" placement="center">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <IconAlertTriangle className="text-danger" size={24} />
            <h2 className="text-xl font-semibold">Delete Invoice</h2>
          </div>
        </ModalHeader>
        <ModalBody className="pb-6">
          <div className="flex flex-col gap-4">
            <p className="text-sm text-default-600">
              Are you sure you want to delete the invoice for{" "}
              <span className="font-semibold text-foreground">
                {invoice?.customer.name || "this customer"}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <Button variant="flat" onPress={onClose} isDisabled={isPending}>
                Cancel
              </Button>
              <Button
                color="danger"
                onPress={handleDelete}
                isLoading={isPending}
              >
                Delete
              </Button>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
