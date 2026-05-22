"use client"

import { Modal, useOverlayState } from "@heroui/react"
import { useProductModalStore } from "@/stores/use-product-modal-store"
import { ProductsForm } from "./products-form"

export function CreateProductModal() {
  const onClose = useProductModalStore((state) => state.onClose)
  const storeOpen = useProductModalStore(
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
                Create Product
              </Modal.Heading>
              <p className="text-sm font-normal text-default-500">
                Add a new product to your inventory
              </p>
            </Modal.Header>
            <Modal.Body className="p-2">
              <ProductsForm key="create" />
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
