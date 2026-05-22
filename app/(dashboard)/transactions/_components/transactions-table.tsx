"use client"

import orderBy from "lodash.orderby"
import filter from "lodash.filter"
import { useMemo, useCallback } from "react"
import { useTransactionModalStore } from "@/stores/use-transaction-modal-store"
import { useTransactionsQuery } from "@/queries/use-transactions-query"
import { formatDate, formatPrice } from "@/utils/helpers"
import { parseAsString, parseAsStringEnum, useQueryStates } from "nuqs"
import { transactionSortParser } from "@/utils/sorting-parsers"
import { transactionTypeEnum } from "@/db/schema"
import { TableLoadingOverlay } from "@/components/table-loading-overlay"
import { TableFilterDrawer } from "@/components/table-filter-drawer"
import {
  TransactionFiltersForm,
  type TransactionFilterDraft
} from "@/app/(dashboard)/_components/transaction-filters-form"
import type { Transaction } from "@/db/schema"
import {
  IconAlertTriangle,
  IconRefresh,
  IconDotsVertical,
  IconPencil,
  IconTrash,
  IconArrowDown,
  IconArrowUp
} from "@tabler/icons-react"
import {
  Table,
  Spinner,
  Chip,
  Button,
  Dropdown,
  SearchField,
  cn
} from "@heroui/react"
import type { SortDescriptor } from "@heroui/react"

const columns = [
  { name: "TYPE", id: "type", sortable: false },
  { name: "AMOUNT", id: "amount", sortable: true },
  { name: "DATE", id: "date", sortable: true },
  { name: "DESCRIPTION", id: "description", sortable: false },
  { name: "", id: "actions", sortable: false }
] as const

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
              variant="soft"
              color={isCashIn ? "success" : "danger"}
            >
              <span className="flex items-center gap-1">
                {isCashIn ? (
                  <IconArrowDown size={14} />
                ) : (
                  <IconArrowUp size={14} />
                )}
                {isCashIn ? "Cash In" : "Cash Out"}
              </span>
            </Chip>
          )
        }
        case "amount": {
          const isCashInAmount = transaction.type === "cash_in"
          return (
            <span
              className={cn(
                "font-semibold tabular-nums whitespace-nowrap",
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
            <span className="text-sm tabular-nums whitespace-nowrap text-default-500">
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
              <Dropdown.Trigger aria-label="Transaction actions">
                <IconDotsVertical size={18} />
              </Dropdown.Trigger>
              <Dropdown.Popover>
                <Dropdown.Menu
                  aria-label="Transaction actions"
                  onAction={(key) => {
                    if (key === "edit") {
                      openTransactionModal("update", transaction)
                    } else if (key === "delete") {
                      openTransactionModal("delete", transaction)
                    }
                  }}
                >
                  <Dropdown.Item id="edit" textValue="Edit transaction">
                    <span className="flex items-center gap-2">
                      <IconPencil size={16} />
                      Edit transaction
                    </span>
                  </Dropdown.Item>
                  <Dropdown.Item
                    id="delete"
                    textValue="Delete transaction"
                    variant="danger"
                  >
                    <span className="flex items-center gap-2">
                      <IconTrash size={16} />
                      Delete transaction
                    </span>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown.Popover>
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

  const activeFilterCount = useMemo(() => {
    let n = 0
    if (q.trim()) n += 1
    if (type != null) n += 1
    if (startDate || endDate) n += 1
    return n
  }, [q, type, startDate, endDate])

  const committedFilters = useMemo(
    (): TransactionFilterDraft => ({
      type,
      startDate,
      endDate
    }),
    [type, startDate, endDate]
  )

  const defaultTransactionFilters = useCallback(
    (): TransactionFilterDraft => ({
      type: null,
      startDate: "",
      endDate: ""
    }),
    []
  )

  const sortDescriptor: SortDescriptor = useMemo(
    () => ({
      column: sort.column,
      direction: sort.direction
    }),
    [sort.column, sort.direction]
  )

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
                  totalCash >= 0 ? "text-success" : "text-danger"
                )}
              >
                Total Cash: {totalCash >= 0 ? "+" : ""}
                {formatPrice(totalCash)}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:gap-3">
            <SearchField
              className="min-w-0"
              aria-label="Search transactions"
              value={q}
              onChange={(value) => setSearchParams({ q: value })}
            >
              <SearchField.Group>
                <SearchField.SearchIcon />
                <SearchField.Input placeholder="Search by description or amount..." />
                <SearchField.ClearButton />
              </SearchField.Group>
            </SearchField>

            <TableFilterDrawer<TransactionFilterDraft>
              title="Filter transactions"
              description="Transaction type and date range."
              activeCount={activeFilterCount}
              committed={committedFilters}
              getDefaultDraft={defaultTransactionFilters}
              onApply={(d) =>
                void setSearchParams({
                  type: d.type,
                  startDate: d.startDate,
                  endDate: d.endDate
                })
              }
              triggerClassName="w-full justify-center sm:w-auto"
              rootClassName="w-full justify-center sm:w-auto"
            >
              {({ draft, setDraft }) => (
                <TransactionFiltersForm draft={draft} setDraft={setDraft} />
              )}
            </TableFilterDrawer>
          </div>
        </div>
      </div>
    )
  }, [
    q,
    filteredCount,
    totalCount,
    totalCash,
    setSearchParams,
    activeFilterCount,
    committedFilters,
    defaultTransactionFilters
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
          variant="secondary"
          isDisabled={isFetching}
          onPress={() => refetch()}
        >
          <span className="flex items-center justify-center gap-2">
            {isFetching ? (
              <Spinner size="sm" color="current" />
            ) : (
              <>
                <IconRefresh size={18} />
                Try again
              </>
            )}
          </span>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {topContent}
      <Table aria-label="Transactions table">
        <Table.ScrollContainer
          className={cn(
            "relative min-w-0",
            isLoading && sortedItems.length === 0 && "min-h-[200px]"
          )}
        >
          <TableLoadingOverlay
            show={isLoading}
            label="Loading transactions"
          />
          <Table.Content
            sortDescriptor={sortDescriptor}
            onSortChange={(descriptor) => {
              const col = descriptor.column as (typeof sort)["column"]
              const dir =
                (descriptor.direction as (typeof sort)["direction"]) ??
                "descending"
              const isSame = col === sort.column
              setSearchParams({
                sort: {
                  column: col ?? "date",
                  direction: isSame ? dir : "descending"
                }
              })
            }}
            className={cn(isLoading && "pointer-events-none opacity-40")}
          >
            <Table.Header columns={[...columns]}>
              {(column) => (
                <Table.Column
                  id={column.id}
                  isRowHeader={column.id === "type"}
                  allowsSorting={column.sortable}
                >
                  {column.name}
                </Table.Column>
              )}
            </Table.Header>
            {!isLoading && sortedItems.length === 0 ? (
              <Table.Body>
                <Table.Row id="empty">
                  <Table.Cell colSpan={columns.length}>
                    <p className="py-10 text-center text-default-500">
                      No transactions found
                    </p>
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            ) : isLoading && sortedItems.length === 0 ? (
              <Table.Body key="initial-loading" aria-label="Loading" />
            ) : (
              <Table.Body key="loaded" items={sortedItems}>
                {(item) => (
                  <Table.Row
                    columns={columns.map((c) => ({ id: c.id }))}
                    id={item.id}
                  >
                    {(column) => (
                      <Table.Cell>
                        {renderCell(
                          item,
                          (column as { id: React.Key }).id
                        )}
                      </Table.Cell>
                    )}
                  </Table.Row>
                )}
              </Table.Body>
            )}
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
    </div>
  )
}
