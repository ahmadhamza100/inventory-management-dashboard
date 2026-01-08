"use client"

import { useTransition } from "react"
import { api } from "@/utils/api"
import { useQueryClient } from "@tanstack/react-query"
import { useCustomerModalStore } from "@/stores/use-customer-modal-store"
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

export function DeleteCustomerModal() {
  const onClose = useCustomerModalStore((state) => state.onClose)
  const customer = useCustomerModalStore((state) => state.customer)
  const isOpen = useCustomerModalStore(
    (state) => state.isOpen && state.type === "delete"
  )
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (!customer) return

    startTransition(async () => {
      try {
        await api.customers[":id"].$delete({
          param: { id: customer.id }
        })

        queryClient.invalidateQueries({ queryKey: ["customers"] })
        addToast({
          title: "Customer deleted",
          color: "success"
        })
        onClose()
      } catch (error) {
        addToast({
          title: gerErrorMessage(error, "Failed to delete customer"),
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
            <h2 className="text-xl font-semibold">Delete Customer</h2>
          </div>
        </ModalHeader>
        <ModalBody className="pb-6">
          <div className="flex flex-col gap-4">
            <p className="text-sm text-default-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                {customer?.name || "this customer"}
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
