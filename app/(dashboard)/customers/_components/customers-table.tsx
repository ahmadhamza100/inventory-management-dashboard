"use client"

import orderBy from "lodash.orderby"
import filter from "lodash.filter"
import { useMemo, useCallback } from "react"
import { useCustomerModalStore } from "@/stores/use-customer-modal-store"
import { useCustomersQuery } from "@/queries/use-customers-query"
import { formatDate } from "@/utils/helpers"
import { parseAsString, useQueryStates } from "nuqs"
import { customerSortParser } from "@/utils/sorting-parsers"
import type { Customer } from "@/db/schema"
import {
  IconSearch,
  IconAlertTriangle,
  IconRefresh,
  IconDotsVertical,
  IconFileInvoice,
  IconPencil,
  IconTrash,
  IconX
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
  DropdownItem
} from "@heroui/react"

type CustomerWithInvoicesCount = Customer & { invoicesCount: number }

const columns = [
  { name: "NAME", uid: "name", sortable: true },
  { name: "EMAIL", uid: "email", sortable: true },
  { name: "PHONE", uid: "phone", sortable: true },
  { name: "INVOICES", uid: "invoicesCount", sortable: true },
  { name: "DATE", uid: "createdAt", sortable: true },
  { name: "", uid: "actions", sortable: false }
]

export function CustomersTable() {
  const {
    data: customers,
    isLoading,
    isError,
    refetch,
    isFetching
  } = useCustomersQuery()

  const openCustomerModal = useCustomerModalStore((state) => state.onOpen)
  const [{ q, sort }, setSearchParams] = useQueryStates({
    q: parseAsString.withDefault(""),
    sort: customerSortParser.withDefault({
      column: "createdAt",
      direction: "descending"
    })
  })

  const filteredItems = useMemo(() => {
    if (!customers) return []

    let filtered = [...customers]

    const query = q.trim().toLowerCase()
    if (query) {
      filtered = filter(filtered, (customer) => {
        const name = customer.name?.toLowerCase() || ""
        const email = customer.email?.toLowerCase() || ""
        const phone = customer.phone?.toLowerCase() || ""
        return (
          name.includes(query) || email.includes(query) || phone.includes(query)
        )
      })
    }

    return filtered
  }, [customers, q])

  const sortedItems = useMemo(() => {
    const lodashDirection = sort.direction === "ascending" ? "asc" : "desc"
    return orderBy(filteredItems, [sort.column], [lodashDirection])
  }, [filteredItems, sort])

  const renderCell = useCallback(
    (customer: CustomerWithInvoicesCount, columnKey: React.Key) => {
      switch (columnKey) {
        case "name":
          return <span className="text-sm font-medium">{customer.name}</span>
        case "email":
          return (
            <span className="text-sm text-default-500">
              {customer.email || "-"}
            </span>
          )
        case "phone":
          return (
            <span className="text-sm text-default-500">
              {customer.phone || "-"}
            </span>
          )
        case "invoicesCount":
          return (
            <span className="text-sm font-medium tabular-nums">
              {customer.invoicesCount}
            </span>
          )
        case "createdAt":
          return (
            <span className="text-sm whitespace-nowrap text-default-500">
              {formatDate(customer.createdAt)}
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
              <DropdownMenu aria-label="Customer actions">
                <DropdownItem
                  key="invoices"
                  startContent={<IconFileInvoice size={16} />}
                >
                  View invoices
                </DropdownItem>
                <DropdownItem
                  key="edit"
                  startContent={<IconPencil size={16} />}
                  onPress={() => openCustomerModal("update", customer)}
                >
                  Edit customer
                </DropdownItem>
                <DropdownItem
                  key="delete"
                  color="danger"
                  className="text-danger"
                  startContent={<IconTrash size={16} />}
                  onPress={() => openCustomerModal("delete", customer)}
                >
                  Delete customer
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          )
        default:
          return null
      }
    },
    [openCustomerModal]
  )

  const totalCount = customers?.length ?? 0
  const filteredCount = filteredItems.length

  const hasActiveFilters = q.trim() !== ""

  const handleClearFilters = useCallback(() => {
    setSearchParams({
      q: "",
      sort: {
        column: "createdAt",
        direction: "descending"
      }
    })
  }, [setSearchParams])

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-default-500">
            {filteredCount === totalCount
              ? `${totalCount} customers`
              : `${filteredCount} of ${totalCount} customers`}
          </p>
        </div>
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Input
            isClearable
            className="w-full sm:max-w-xs"
            placeholder="Search by name, email, phone..."
            startContent={<IconSearch size={18} className="text-default-400" />}
            value={q}
            onClear={() => setSearchParams({ q: "" })}
            onValueChange={(value) => setSearchParams({ q: value })}
          />

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
    )
  }, [
    q,
    filteredCount,
    totalCount,
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
          <h3 className="text-lg font-semibold">Failed to load customers</h3>
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
      aria-label="Customers table"
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
            column: column as typeof sort.column,
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
        emptyContent={<p className="text-default-500">No customers found</p>}
        loadingContent={
          <Spinner className="pt-10" label="Loading customers..." />
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
