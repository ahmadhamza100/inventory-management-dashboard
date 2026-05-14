"use client"

import { Button } from "@heroui/react"
import { IconPlus } from "@tabler/icons-react"
import { TransactionsTable } from "./_components/transactions-table"
import { useTransactionModalStore } from "@/stores/use-transaction-modal-store"
import { CreateTransactionModal } from "./_components/create-transaction-modal"
import { EditTransactionModal } from "./_components/edit-transaction-modal"
import { DeleteTransactionModal } from "./_components/delete-transaction-modal"

export default function TransactionsPage() {
  const onOpen = useTransactionModalStore((state) => state.onOpen)

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Transactions</h1>

          <Button variant="primary" onPress={() => onOpen("create")}>
            <span className="flex items-center gap-2">
              <IconPlus size={18} />
              Create transaction
            </span>
          </Button>
        </div>

        <TransactionsTable />
      </div>
      <CreateTransactionModal />
      <EditTransactionModal />
      <DeleteTransactionModal />
    </>
  )
}
