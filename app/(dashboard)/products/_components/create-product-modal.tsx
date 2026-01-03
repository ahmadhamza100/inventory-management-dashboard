"use client"

import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/react"
import { useProductModalStore } from "@/stores/use-product-modal-store"
import { ProductsForm } from "./products-form"

export function CreateProductModal() {
  const onClose = useProductModalStore((state) => state.onClose)
  const isOpen = useProductModalStore(
    (state) => state.isOpen && state.type === "create"
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">Create Product</h2>
          <p className="text-sm font-normal text-default-500">
            Add a new product to your inventory
          </p>
        </ModalHeader>
        <ModalBody className="pb-6">
          <ProductsForm />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
