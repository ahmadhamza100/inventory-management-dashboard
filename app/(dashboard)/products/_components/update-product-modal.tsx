"use client"

import { Modal, useOverlayState } from "@heroui/react"
import { ProductsForm } from "./products-form"
import { useProductModalStore } from "@/stores/use-product-modal-store"

export function UpdateProductModal() {
  const onClose = useProductModalStore((state) => state.onClose)
  const product = useProductModalStore((state) => state.product)
  const productName = product?.name
  const productId = product?.id
  const storeOpen = useProductModalStore(
    (state) => state.isOpen && state.type === "update"
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
                Update Product
              </Modal.Heading>
              <p className="text-sm font-normal text-default-500">
                Update details for{" "}
                <span className="font-medium text-foreground">
                  {productName ?? "this product"}
                </span>
              </p>
            </Modal.Header>
            <Modal.Body className="p-1">
              <ProductsForm key={productId ?? "update"} />
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
