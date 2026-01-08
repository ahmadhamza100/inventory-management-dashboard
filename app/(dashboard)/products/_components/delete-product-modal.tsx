"use client"

import { useTransition } from "react"
import { api } from "@/utils/api"
import { useQueryClient } from "@tanstack/react-query"
import { useProductModalStore } from "@/stores/use-product-modal-store"
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

export function DeleteProductModal() {
  const onClose = useProductModalStore((state) => state.onClose)
  const product = useProductModalStore((state) => state.product)
  const isOpen = useProductModalStore(
    (state) => state.isOpen && state.type === "delete"
  )
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (!product) return

    startTransition(async () => {
      try {
        await api.products[":id"].$delete({
          param: { id: product.id }
        })

        queryClient.invalidateQueries({ queryKey: ["products"] })
        addToast({
          title: "Product deleted",
          color: "success"
        })
        onClose()
      } catch (error) {
        addToast({
          title: gerErrorMessage(error, "Failed to delete product"),
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
            <h2 className="text-xl font-semibold">Delete Product</h2>
          </div>
        </ModalHeader>
        <ModalBody className="pb-6">
          <div className="flex flex-col gap-4">
            <p className="text-sm text-default-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                {product?.name || "this product"}
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
