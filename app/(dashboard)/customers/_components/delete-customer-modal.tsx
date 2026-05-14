"use client"

import { useTransition } from "react"
import { api } from "@/utils/api"
import { useQueryClient } from "@tanstack/react-query"
import { useCustomerModalStore } from "@/stores/use-customer-modal-store"
import {
  Modal,
  useOverlayState,
  Button,
  Spinner,
  toast
} from "@heroui/react"
import { IconAlertTriangle } from "@tabler/icons-react"
import { gerErrorMessage } from "@/utils/error-handler"

export function DeleteCustomerModal() {
  const onClose = useCustomerModalStore((state) => state.onClose)
  const customer = useCustomerModalStore((state) => state.customer)
  const storeOpen = useCustomerModalStore(
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
    if (!customer) return

    startTransition(async () => {
      try {
        await api.customers[":id"].$delete({
          param: { id: customer.id }
        })

        queryClient.invalidateQueries({ queryKey: ["customers"] })
        toast.success("Customer deleted")
        onClose()
      } catch (error) {
        toast.danger(gerErrorMessage(error, "Failed to delete customer"))
      }
    })
  }

  return (
    <Modal state={overlay}>
      <Modal.Backdrop>
        <Modal.Container size="md" scroll="outside">
          <Modal.Dialog>
            <Modal.Header className="relative flex flex-col gap-1 pr-12">
              <Modal.CloseTrigger className="absolute end-3 top-3" />
              <div className="flex items-center gap-2">
                <IconAlertTriangle className="text-danger" size={24} />
                <Modal.Heading className="text-xl font-semibold">
                  Delete Customer
                </Modal.Heading>
              </div>
            </Modal.Header>
            <Modal.Body className="p-1">
              <div className="flex flex-col gap-4">
                <p className="text-sm text-default-600">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-foreground">
                    {customer?.name || "this customer"}
                  </span>
                  ? This action cannot be undone.
                </p>

                <div className="flex justify-end gap-3">
                  <Button variant="secondary" onPress={onClose} isDisabled={isPending}>
                    Cancel
                  </Button>
                  <Button variant="danger" onPress={handleDelete} isDisabled={isPending}>
                    {isPending ? (
                      <Spinner size="sm" color="current" />
                    ) : (
                      "Delete"
                    )}
                  </Button>
                </div>
              </div>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
