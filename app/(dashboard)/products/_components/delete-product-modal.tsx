"use client"

import { useTransition } from "react"
import { api } from "@/utils/api"
import { useQueryClient } from "@tanstack/react-query"
import { useProductModalStore } from "@/stores/use-product-modal-store"
import { productsQueryKey, type ProductListItem } from "@/queries/use-products-query"
import {
  Modal,
  useOverlayState,
  Button,
  Spinner,
  toast
} from "@heroui/react"
import { IconAlertTriangle } from "@tabler/icons-react"
import { gerErrorMessage } from "@/utils/error-handler"
import { removeProductFromList } from "@/utils/query-updaters"

export function DeleteProductModal() {
  const onClose = useProductModalStore((state) => state.onClose)
  const product = useProductModalStore((state) => state.product)
  const storeOpen = useProductModalStore(
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
    if (!product) return

    startTransition(async () => {
      try {
        await api.products[":id"].$delete({
          param: { id: product.id }
        })

        queryClient.setQueryData(productsQueryKey, (current?: ProductListItem[]) =>
          removeProductFromList(current, product.id)
        )
        toast.success("Product deleted")
        onClose()
      } catch (error) {
        toast.danger(gerErrorMessage(error, "Failed to delete product"))
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
                  Delete Product
                </Modal.Heading>
              </div>
            </Modal.Header>
            <Modal.Body className="p-1">
              <div className="flex flex-col gap-4">
                <p className="text-sm text-default-600">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-foreground">
                    {product?.name || "this product"}
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
