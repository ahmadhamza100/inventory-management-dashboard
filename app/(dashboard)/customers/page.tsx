"use client"

import { Button } from "@heroui/react"
import { IconPlus } from "@tabler/icons-react"
import { CustomersTable } from "./_components/customers-table"
import { useCustomerModalStore } from "@/stores/use-customer-modal-store"
import { CreateCustomerModal } from "./_components/create-customer-modal"
import { UpdateCustomerModal } from "./_components/update-customer-modal"
import { DeleteCustomerModal } from "./_components/delete-customer-modal"

export default function CustomersPage() {
  const onOpen = useCustomerModalStore((state) => state.onOpen)

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Customers</h1>

          <Button
            color="primary"
            startContent={<IconPlus size={18} />}
            onPress={() => onOpen("create")}
          >
            Create customer
          </Button>
        </div>

        <CustomersTable />
      </div>
      <CreateCustomerModal />
      <UpdateCustomerModal />
      <DeleteCustomerModal />
    </>
  )
}
