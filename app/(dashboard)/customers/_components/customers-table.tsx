"use client"

import orderBy from "lodash.orderby"
import filter from "lodash.filter"
import { useRouter } from "next/navigation"
import { useMemo, useCallback } from "react"
import { useCustomerModalStore } from "@/stores/use-customer-modal-store"
import { useCustomersQuery } from "@/queries/use-customers-query"
import { formatDate } from "@/utils/helpers"
import { parseAsString, useQueryStates } from "nuqs"
import { customerSortParser } from "@/utils/sorting-parsers"
import { TableLoadingOverlay } from "@/components/table-loading-overlay"
import { TableFilterDrawer } from "@/components/table-filter-drawer"
import {
  CustomerFiltersForm,
  type CustomerFilterDraft
} from "@/app/(dashboard)/_components/customer-filters-form"
import type { Customer } from "@/db/schema"
import {
  IconAlertTriangle,
  IconRefresh,
  IconDotsVertical,
  IconFileInvoice,
  IconPencil,
  IconTrash
} from "@tabler/icons-react"
import {
  Table,
  Spinner,
  Button,
  Dropdown,
  SearchField,
  cn
} from "@heroui/react"
import type { SortDescriptor } from "@heroui/react"

type CustomerWithInvoicesCount = Customer & { invoicesCount: number }

const columns = [
  { name: "NAME", id: "name", sortable: true },
  { name: "EMAIL", id: "email", sortable: true },
  { name: "PHONE", id: "phone", sortable: true },
  { name: "INVOICES", id: "invoicesCount", sortable: true },
  { name: "DATE", id: "createdAt", sortable: true },
  { name: "", id: "actions", sortable: false }
] as const

export function CustomersTable() {
  const router = useRouter()
  const {
    data: customers,
    isLoading,
    isError,
    refetch,
    isFetching
  } = useCustomersQuery()

  const openCustomerModal = useCustomerModalStore((state) => state.onOpen)
  const [{ q, startDate, endDate, sort }, setSearchParams] = useQueryStates({
    q: parseAsString.withDefault(""),
    startDate: parseAsString.withDefault(""),
    endDate: parseAsString.withDefault(""),
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

    if (startDate) {
      const start = new Date(startDate)
      filtered = filter(
        filtered,
        (customer) => new Date(customer.createdAt) >= start
      )
    }

    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      filtered = filter(
        filtered,
        (customer) => new Date(customer.createdAt) <= end
      )
    }

    return filtered
  }, [customers, q, startDate, endDate])

  const sortedItems = useMemo(() => {
    const lodashDirection = sort.direction === "ascending" ? "asc" : "desc"
    return orderBy(filteredItems, [sort.column], [lodashDirection])
  }, [filteredItems, sort])

  const renderCell = useCallback(
    (customer: CustomerWithInvoicesCount, columnKey: React.Key) => {
      switch (columnKey) {
        case "name":
          return (
            <span className="block min-w-0 truncate text-sm font-medium">
              {customer.name}
            </span>
          )
        case "email":
          return (
            <span className="block min-w-0 truncate text-sm text-default-500">
              {customer.email || "-"}
            </span>
          )
        case "phone":
          return (
            <span className="block min-w-0 truncate text-sm text-default-500">
              {customer.phone || "-"}
            </span>
          )
        case "invoicesCount":
          return (
            <span className="text-sm font-medium tabular-nums whitespace-nowrap">
              {customer.invoicesCount}
            </span>
          )
        case "createdAt":
          return (
            <span className="text-sm tabular-nums whitespace-nowrap text-default-500">
              {formatDate(customer.createdAt)}
            </span>
          )
        case "actions":
          return (
            <Dropdown>
              <Dropdown.Trigger aria-label="Customer actions">
                <IconDotsVertical size={18} />
              </Dropdown.Trigger>
              <Dropdown.Popover>
                <Dropdown.Menu
                  aria-label="Customer actions"
                  onAction={(key) => {
                    if (key === "invoices") {
                      router.push(`/invoices?customer=${customer.id}`)
                    } else if (key === "edit") {
                      openCustomerModal("update", customer)
                    } else if (key === "delete") {
                      openCustomerModal("delete", customer)
                    }
                  }}
                >
                  <Dropdown.Item id="invoices" textValue="View invoices">
                    <span className="flex items-center gap-2">
                      <IconFileInvoice size={16} />
                      View invoices
                    </span>
                  </Dropdown.Item>
                  <Dropdown.Item id="edit" textValue="Edit customer">
                    <span className="flex items-center gap-2">
                      <IconPencil size={16} />
                      Edit customer
                    </span>
                  </Dropdown.Item>
                  <Dropdown.Item
                    id="delete"
                    textValue="Delete customer"
                    variant="danger"
                  >
                    <span className="flex items-center gap-2">
                      <IconTrash size={16} />
                      Delete customer
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
    [openCustomerModal, router]
  )

  const totalCount = customers?.length ?? 0
  const filteredCount = filteredItems.length

  const activeFilterCount = useMemo(() => {
    let n = 0
    if (q.trim()) n += 1
    if (startDate || endDate) n += 1
    return n
  }, [q, startDate, endDate])

  const committedFilters = useMemo(
    (): CustomerFilterDraft => ({
      startDate,
      endDate
    }),
    [startDate, endDate]
  )

  const defaultCustomerFilters = useCallback(
    (): CustomerFilterDraft => ({
      startDate: "",
      endDate: ""
    }),
    []
  )

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
        <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-3">
          <SearchField
            className="min-w-0"
            value={q}
            onChange={(value) => setSearchParams({ q: value })}
          >
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Search by name, email, phone..." />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>

          <TableFilterDrawer<CustomerFilterDraft>
            title="Filter customers"
            description="Refine the list by created date."
            activeCount={activeFilterCount}
            committed={committedFilters}
            getDefaultDraft={defaultCustomerFilters}
            onApply={(d) =>
              void setSearchParams({
                startDate: d.startDate,
                endDate: d.endDate
              })
            }
            triggerClassName="w-full justify-center sm:w-auto"
            rootClassName="w-full justify-center sm:w-auto"
          >
            {({ draft, setDraft }) => (
              <CustomerFiltersForm draft={draft} setDraft={setDraft} />
            )}
          </TableFilterDrawer>
        </div>
      </div>
    )
  }, [
    q,
    filteredCount,
    totalCount,
    setSearchParams,
    activeFilterCount,
    committedFilters,
    defaultCustomerFilters
  ])

  const sortDescriptor: SortDescriptor = useMemo(
    () => ({
      column: sort.column,
      direction: sort.direction
    }),
    [sort.column, sort.direction]
  )

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
      <Table aria-label="Customers table">
        <Table.ScrollContainer
          className={cn(
            "relative min-w-0",
            isLoading && sortedItems.length === 0 && "min-h-[200px]"
          )}
        >
          <TableLoadingOverlay
            show={isLoading}
            label="Loading customers"
          />
          <Table.Content
            sortDescriptor={sortDescriptor}
            onSortChange={(descriptor) => {
              setSearchParams({
                sort: {
                  column: descriptor.column as (typeof sort)["column"],
                  direction: descriptor.direction as (typeof sort)["direction"]
                }
              })
            }}
            className={cn(isLoading && "pointer-events-none opacity-40")}
          >
            <Table.Header columns={[...columns]}>
              {(column) => (
                <Table.Column
                  id={column.id}
                  isRowHeader={column.id === "name"}
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
                      No customers found
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
