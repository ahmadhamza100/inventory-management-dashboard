"use client"

import orderBy from "lodash.orderby"
import filter from "lodash.filter"
import { useMemo, useCallback } from "react"
import { useTransactionModalStore } from "@/stores/use-transaction-modal-store"
import { useTransactionsQuery } from "@/queries/use-transactions-query"
import { formatDate, formatPrice, toSentenceCase } from "@/utils/helpers"
import { parseAsString, parseAsStringEnum, useQueryStates } from "nuqs"
import { transactionSortParser } from "@/utils/sorting-parsers"
import { transactionTypeEnum } from "@/db/schema"
import { DateRangeFilter } from "@/app/(dashboard)/_components/date-range-filter"
import type { Transaction } from "@/db/schema"
import {
  IconSearch,
  IconAlertTriangle,
  IconRefresh,
  IconDotsVertical,
  IconPencil,
  IconTrash,
  IconX,
  IconArrowDown,
  IconArrowUp
} from "@tabler/icons-react"
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Spinner,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
  Select,
  SelectItem,
  cn
} from "@heroui/react"

const columns = [
  { name: "TYPE", uid: "type", sortable: false },
  { name: "AMOUNT", uid: "amount", sortable: true },
  { name: "DATE", uid: "date", sortable: true },
  { name: "DESCRIPTION", uid: "description", sortable: false },
  { name: "", uid: "actions", sortable: false }
]

export function TransactionsTable() {
  const [{ q, type, startDate, endDate, sort }, setSearchParams] =
    useQueryStates({
      q: parseAsString.withDefault(""),
      type: parseAsStringEnum(transactionTypeEnum.enumValues),
      startDate: parseAsString.withDefault(""),
      endDate: parseAsString.withDefault(""),
      sort: transactionSortParser.withDefault({
        column: "date",
        direction: "descending"
      })
    })

  const {
    data: transactions,
    isLoading,
    isError,
    refetch,
    isFetching
  } = useTransactionsQuery()

  const openTransactionModal = useTransactionModalStore((state) => state.onOpen)

  const filteredItems = useMemo(() => {
    if (!transactions) return []

    let filtered = [...transactions]

    const query = q.trim().toLowerCase()
    if (query) {
      filtered = filter(filtered, (transaction) => {
        const description = transaction.description?.toLowerCase() || ""
        const amount = transaction.amount.toLowerCase()
        return description.includes(query) || amount.includes(query)
      })
    }

    if (type) {
      filtered = filter(filtered, (transaction) => transaction.type === type)
    }

    if (startDate) {
      const start = new Date(startDate)
      filtered = filter(
        filtered,
        (transaction) => new Date(transaction.date) >= start
      )
    }

    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      filtered = filter(
        filtered,
        (transaction) => new Date(transaction.date) <= end
      )
    }

    return filtered
  }, [transactions, q, type, startDate, endDate])

  const sortedItems = useMemo(() => {
    const lodashDirection = sort.direction === "ascending" ? "asc" : "desc"
    return orderBy(filteredItems, [sort.column], [lodashDirection])
  }, [filteredItems, sort])

  const totalCash = useMemo(() => {
    return filteredItems.reduce((total, transaction) => {
      const amount = Number(transaction.amount)
      return transaction.type === "cash_in" ? total + amount : total - amount
    }, 0)
  }, [filteredItems])

  const renderCell = useCallback(
    (transaction: Transaction, columnKey: React.Key) => {
      switch (columnKey) {
        case "type": {
          const isCashIn = transaction.type === "cash_in"
          return (
            <Chip
              size="sm"
              variant="flat"
              color={isCashIn ? "success" : "danger"}
              startContent={
                isCashIn ? (
                  <IconArrowDown size={14} />
                ) : (
                  <IconArrowUp size={14} />
                )
              }
            >
              {isCashIn ? "Cash In" : "Cash Out"}
            </Chip>
          )
        }
        case "amount": {
          const isCashInAmount = transaction.type === "cash_in"
          return (
            <span
              className={cn(
                "font-semibold tabular-nums",
                isCashInAmount ? "text-success" : "text-danger"
              )}
            >
              {isCashInAmount ? "+" : "-"}
              {formatPrice(transaction.amount)}
            </span>
          )
        }
        case "date":
          return (
            <span className="text-sm whitespace-nowrap text-default-500">
              {formatDate(transaction.date)}
            </span>
          )
        case "description":
          return (
            <span className="text-sm text-default-600">
              {transaction.description || "-"}
            </span>
          )
        case "actions":
          return (
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <IconDotsVertical size={18} />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Transaction actions">
                <DropdownItem
                  key="edit"
                  startContent={<IconPencil size={16} />}
                  onPress={() => openTransactionModal("update", transaction)}
                >
                  Edit transaction
                </DropdownItem>
                <DropdownItem
                  key="delete"
                  color="danger"
                  className="text-danger"
                  startContent={<IconTrash size={16} />}
                  onPress={() => openTransactionModal("delete", transaction)}
                >
                  Delete transaction
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          )
        default:
          return null
      }
    },
    [openTransactionModal]
  )

  const totalCount = transactions?.length ?? 0
  const filteredCount = filteredItems.length

  const hasActiveFilters =
    q.trim() !== "" || type !== null || startDate !== "" || endDate !== ""

  const handleClearFilters = useCallback(() => {
    setSearchParams({
      q: "",
      type: null,
      startDate: "",
      endDate: "",
      sort: {
        column: "date",
        direction: "descending"
      }
    })
  }, [setSearchParams])

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-default-500">
              {filteredCount === totalCount
                ? `${totalCount} transactions`
                : `${filteredCount} of ${totalCount} transactions`}
            </p>
            {filteredCount > 0 && (
              <p
                className={cn(
                  "text-sm font-semibold tabular-nums",
                  totalCash >= 0 && "text-success",
                  totalCash < 0 && "text-danger"
                )}
              >
                Total Cash: {totalCash >= 0 && "+"}
                {formatPrice(totalCash)}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-4 overflow-x-auto sm:flex-row [&>svg]:shrink-0">
            <Input
              isClearable
              className="w-full sm:max-w-xs"
              placeholder="Search by description or amount..."
              startContent={
                <IconSearch size={18} className="text-default-400" />
              }
              value={q}
              onClear={() => setSearchParams({ q: "" })}
              onValueChange={(value) => setSearchParams({ q: value })}
            />

            <Select
              className="w-full sm:w-40"
              selectedKeys={type ? [type] : []}
              placeholder="Filter by type"
              isClearable
              onClear={() => setSearchParams({ type: null })}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as typeof type
                setSearchParams({ type: selected || null })
              }}
            >
              {transactionTypeEnum.enumValues.map((typeValue) => (
                <SelectItem key={typeValue}>
                  {toSentenceCase(typeValue)}
                </SelectItem>
              ))}
            </Select>

            <DateRangeFilter />

            {hasActiveFilters && (
              <Button
                variant="flat"
                color="danger"
                startContent={<IconX size={16} />}
                onPress={handleClearFilters}
              >
                Clear filters
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }, [
    q,
    type,
    filteredCount,
    totalCount,
    totalCash,
    setSearchParams,
    hasActiveFilters,
    handleClearFilters
  ])

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-divider bg-content1 px-8 py-16">
        <div className="flex size-16 items-center justify-center rounded-full bg-danger/10">
          <IconAlertTriangle size={32} className="text-danger" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold">Failed to load transactions</h3>
          <p className="mt-1 text-sm text-default-500">
            Something went wrong while fetching the data. Please try again.
          </p>
        </div>
        <Button
          color="primary"
          variant="flat"
          startContent={!isFetching && <IconRefresh size={18} />}
          isLoading={isFetching}
          onPress={() => refetch()}
        >
          Try again
        </Button>
      </div>
    )
  }

  return (
    <Table
      aria-label="Transactions table"
      topContent={topContent}
      topContentPlacement="outside"
      sortDescriptor={{
        column: sort.column,
        direction: sort.direction
      }}
      onSortChange={({ column, direction }) => {
        const isSameColumn = column === sort.column

        setSearchParams({
          sort: {
            column: (column as typeof sort.column) || "date",
            direction: isSameColumn
              ? (direction as typeof sort.direction)
              : "descending"
          }
        })
      }}
    >
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn key={column.uid} allowsSorting={column.sortable}>
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody
        items={sortedItems}
        isLoading={isLoading}
        emptyContent={<p className="text-default-500">No transactions found</p>}
        loadingContent={
          <Spinner className="pt-10" label="Loading transactions..." />
        }
      >
        {(item) => (
          <TableRow key={item.id}>
            {(columnKey) => (
              <TableCell>{renderCell(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
