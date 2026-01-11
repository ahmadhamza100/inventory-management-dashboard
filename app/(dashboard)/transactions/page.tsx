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

          <Button
            color="primary"
            startContent={<IconPlus size={18} />}
            onPress={() => onOpen("create")}
          >
            Create transaction
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
