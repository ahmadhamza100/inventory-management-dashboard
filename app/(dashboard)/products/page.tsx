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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold">Products</h1>

          <Button
            variant="primary"
            onPress={() => onOpen("create")}
            className="w-full sm:w-auto"
          >
            <span className="flex items-center gap-2">
              <IconPlus size={18} />
              Create product
            </span>
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
