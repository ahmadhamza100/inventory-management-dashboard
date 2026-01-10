"use client"

import { Button } from "@heroui/react"
import { IconPlus } from "@tabler/icons-react"
import { InvoicesTable } from "./_components/invoices-table"
import { useInvoiceModalStore } from "@/stores/use-invoice-modal-store"
import { CreateInvoiceModal } from "./_components/create-invoice-modal"
import { EditInvoiceModal } from "./_components/edit-invoice-modal"
import { DeleteInvoiceModal } from "./_components/delete-invoice-modal"
import { ViewInvoiceDrawer } from "./_components/view-invoice-drawer"

export default function InvoicesPage() {
  const onOpen = useInvoiceModalStore((state) => state.onOpen)

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Invoices</h1>

          <Button
            color="primary"
            startContent={<IconPlus size={18} />}
            onPress={() => onOpen("create")}
          >
            Create Invoice
          </Button>
        </div>

        <InvoicesTable />
      </div>
      <CreateInvoiceModal />
      <EditInvoiceModal />
      <DeleteInvoiceModal />
      <ViewInvoiceDrawer />
    </>
  )
}
