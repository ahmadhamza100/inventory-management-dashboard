"use client"

import { InvoicesTable } from "./_components/invoices-table"
import { CreateInvoiceModal } from "./_components/create-invoice-modal"
import { EditInvoiceModal } from "./_components/edit-invoice-modal"
import { DeleteInvoiceModal } from "./_components/delete-invoice-modal"
import { ViewInvoiceDrawer } from "./_components/view-invoice-drawer"

export default function InvoicesPage() {
  return (
    <>
      <InvoicesTable />
      <CreateInvoiceModal />
      <EditInvoiceModal />
      <DeleteInvoiceModal />
      <ViewInvoiceDrawer />
    </>
  )
}
