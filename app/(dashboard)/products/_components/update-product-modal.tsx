"use client"

import { ProductsForm } from "./products-form"
import { useProductModalStore } from "@/stores/use-product-modal-store"
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/react"

export function UpdateProductModal() {
  const onClose = useProductModalStore((state) => state.onClose)
  const productName = useProductModalStore((state) => state.product?.name)
  const isOpen = useProductModalStore(
    (state) => state.isOpen && state.type === "update"
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">Update Product </h2>
          <p className="text-sm font-normal text-default-500">
            Update details for{" "}
            <span className="font-medium text-foreground">
              {productName ?? "this product"}
            </span>
          </p>
        </ModalHeader>
        <ModalBody className="pb-6">
          <ProductsForm />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
