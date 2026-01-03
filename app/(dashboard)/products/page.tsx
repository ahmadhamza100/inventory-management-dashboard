"use client"

import { Button } from "@heroui/react"
import { IconPlus } from "@tabler/icons-react"
import { ProductsTable } from "./_components/products-table"
import { useProductModalStore } from "@/stores/use-product-modal-store"
import { CreateProductModal } from "./_components/create-product-modal"
import { UpdateProductModal } from "./_components/update-product-modal"
import { DeleteProductModal } from "./_components/delete-product-modal"

export default function ProductsPage() {
  const onOpen = useProductModalStore((state) => state.onOpen)

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Products</h1>

          <Button
            color="primary"
            startContent={<IconPlus size={18} />}
            onPress={() => onOpen("create")}
          >
            Create product
          </Button>
        </div>

        <ProductsTable />
      </div>
      <CreateProductModal />
      <UpdateProductModal />
      <DeleteProductModal />
    </>
  )
}
