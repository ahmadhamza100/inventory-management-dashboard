"use client"

import orderBy from "lodash.orderby"
import filter from "lodash.filter"
import { useMemo, useCallback } from "react"
import { useInvoiceModalStore } from "@/stores/use-invoice-modal-store"
import { useInvoicesQuery } from "@/queries/use-invoices-query"
import { useCustomersQuery } from "@/queries/use-customers-query"
import { useProductsQuery } from "@/queries/use-products-query"
import { formatDate, formatPrice, getPaymentStatus } from "@/utils/helpers"
import { parseAsString, useQueryStates } from "nuqs"
import { invoiceSortParser } from "@/utils/sorting-parsers"
import { useDownloadInvoice } from "@/mutations/use-download-invoice"
import { TableLoadingOverlay } from "@/components/table-loading-overlay"
import { TableFilterDrawer } from "@/components/table-filter-drawer"
import {
  InvoiceFiltersForm,
  type InvoiceFilterDraft
} from "./invoice-filters-form"
import type { InvoiceWithDetails } from "@/stores/use-invoice-modal-store"
import {
  IconAlertTriangle,
  IconRefresh,
  IconDotsVertical,
  IconEye,
  IconPencil,
  IconTrash,
  IconDownload,
  IconPlus
} from "@tabler/icons-react"
import {
  Table,
  Spinner,
  Button,
  Dropdown,
  SearchField,
  Chip,
  cn
} from "@heroui/react"
import type { SortDescriptor } from "@heroui/react"

const columns = [
  { name: "ID", id: "id", sortable: true },
  { name: "CUSTOMER", id: "customer", sortable: false },
  { name: "PRODUCTS", id: "products", sortable: false },
  { name: "TOTAL", id: "total", sortable: true },
  { name: "PAYMENT STATUS", id: "paymentStatus", sortable: false },
  { name: "AMOUNT PAID", id: "amountPaid", sortable: false },
  { name: "DATE", id: "createdAt", sortable: true },
  { name: "", id: "actions", sortable: false }
] as const

export function InvoicesTable() {
  const openInvoiceModal = useInvoiceModalStore((state) => state.onOpen)
  const {
    data: invoices,
    isLoading,
    isError,
    refetch,
    isFetching
  } = useInvoicesQuery()
  const { data: customers } = useCustomersQuery()
  const { data: products } = useProductsQuery()

  const [
    { q, sort, customer, product, paymentStatus, startDate, endDate },
    setSearchParams
  ] = useQueryStates({
    q: parseAsString.withDefault(""),
    customer: parseAsString.withDefault(""),
    product: parseAsString.withDefault(""),
    paymentStatus: parseAsString.withDefault(""),
    startDate: parseAsString.withDefault(""),
    endDate: parseAsString.withDefault(""),
    sort: invoiceSortParser.withDefault({
      column: "createdAt",
      direction: "descending"
    })
  })

  const filteredItems = useMemo(() => {
    if (!invoices) return []

    let filtered = [...invoices]

    const query = q.trim().toLowerCase()
    if (query) {
      filtered = filter(filtered, (invoice) => {
        const invoiceId = `#${String(invoice.id).toLowerCase()}`
        const customerName = invoice.customer.name?.toLowerCase() || ""
        const customerEmail = invoice.customer.email?.toLowerCase() || ""
        const customerPhone = invoice.customer.phone?.toLowerCase() || ""
        const productNames = invoice.products
          .map((p) => p.name?.toLowerCase() || "")
          .join(" ")

        return (
          invoiceId.includes(query) ||
          customerName.includes(query) ||
          customerEmail.includes(query) ||
          customerPhone.includes(query) ||
          productNames.includes(query)
        )
      })
    }

    if (customer) {
      filtered = filter(filtered, (invoice) => {
        return invoice.customerId !== null && invoice.customerId === customer
      })
    }

    if (product) {
      const selectedProduct = products?.find((p) => p.id === product)
      if (selectedProduct) {
        const filterProductName = selectedProduct.name.trim().toLowerCase()
        filtered = filter(filtered, (invoice) => {
          return invoice.products.some(
            (item) => item.name?.toLowerCase() === filterProductName
          )
        })
      }
    }

    if (paymentStatus) {
      filtered = filter(filtered, (invoice) => {
        const status = getPaymentStatus(invoice.total, invoice.amountPaid)
        return status === paymentStatus
      })
    }

    if (startDate) {
      const start = new Date(startDate)
      filtered = filter(
        filtered,
        (invoice) => new Date(invoice.createdAt) >= start
      )
    }

    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      filtered = filter(
        filtered,
        (invoice) => new Date(invoice.createdAt) <= end
      )
    }

    return filtered
  }, [invoices, q, customer, product, paymentStatus, products, startDate, endDate])

  const sortedItems = useMemo(() => {
    const lodashDirection = sort.direction === "ascending" ? "asc" : "desc"
    return orderBy(filteredItems, [sort.column], [lodashDirection])
  }, [filteredItems, sort])

  const { downloadInvoice } = useDownloadInvoice()

  const renderCell = useCallback(
    (invoice: InvoiceWithDetails, columnKey: React.Key) => {
      switch (columnKey) {
        case "id":
          return (
            <button
              type="button"
              onClick={() => openInvoiceModal("view", invoice)}
              className="font-mono text-sm font-medium whitespace-nowrap"
            >
              #{invoice.id}
            </button>
          )
        case "customer":
          return (
            <div className="min-w-0">
              <div className="flex flex-col">
                <span className="truncate text-sm font-medium">
                  {invoice.customer.name}
                </span>
                {invoice.customer.email && (
                  <span className="truncate text-xs text-default-500">
                    {invoice.customer.email}
                  </span>
                )}
              </div>
            </div>
          )
        case "products":
          return (
            <div className="min-w-0 max-w-full">
              {invoice.products.length === 0 ? (
                <span className="text-xs text-default-400">No products</span>
              ) : (
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {invoice.products.map((line, index) => (
                    <li
                      key={`${invoice.id}-line-${index}`}
                      className="min-w-0 max-w-full"
                    >
                      <div className="flex min-w-0 max-w-full flex-wrap items-start gap-x-2 gap-y-1">
                        <span
                          className="min-w-0 flex-1 text-sm leading-snug font-medium text-foreground break-words"
                          title={line.name || "Unknown Product"}
                        >
                          {line.name || "Unknown Product"}
                        </span>
                        <span
                          className="shrink-0 rounded-md bg-default-200 px-2 py-0.5 text-center text-[11px] leading-none font-semibold whitespace-nowrap text-default-800 tabular-nums dark:bg-default-300/35 dark:text-default-100"
                          title={`Quantity ${line.quantity}`}
                        >
                          ×{line.quantity}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        case "total":
          return (
            <span className="block text-sm font-semibold tabular-nums whitespace-nowrap">
              {formatPrice(invoice.total)}
            </span>
          )
        case "paymentStatus":
          return (() => {
            const status = getPaymentStatus(invoice.total, invoice.amountPaid)
            const statusConfig = {
              paid: { label: "Paid", color: "success" as const },
              partially_paid: {
                label: "Partially Paid",
                color: "warning" as const
              },
              unpaid: { label: "Unpaid", color: "danger" as const }
            }
            const config = statusConfig[status]
            return (
              <span className="inline-flex max-w-full whitespace-nowrap">
                <Chip size="sm" color={config.color} variant="soft">
                  {config.label}
                </Chip>
              </span>
            )
          })()
        case "amountPaid":
          return (
            <span className="text-sm tabular-nums whitespace-nowrap text-default-600">
              {formatPrice(invoice.amountPaid)}
            </span>
          )
        case "createdAt":
          return (
            <span className="text-sm tabular-nums whitespace-nowrap text-default-500">
              {formatDate(invoice.createdAt)}
            </span>
          )
        case "actions":
          return (
            <Dropdown>
              <Dropdown.Trigger aria-label="Invoice actions">
                <IconDotsVertical size={18} />
              </Dropdown.Trigger>
              <Dropdown.Popover>
                <Dropdown.Menu
                  aria-label="Invoice actions"
                  onAction={(key) => {
                    if (key === "view") openInvoiceModal("view", invoice)
                    else if (key === "edit")
                      openInvoiceModal("update", invoice)
                    else if (key === "download") void downloadInvoice(invoice)
                    else if (key === "delete") openInvoiceModal("delete", invoice)
                  }}
                >
                  <Dropdown.Item id="view" textValue="View">
                    <span className="flex items-center gap-2">
                      <IconEye size={16} />
                      View
                    </span>
                  </Dropdown.Item>
                  <Dropdown.Item id="edit" textValue="Edit">
                    <span className="flex items-center gap-2">
                      <IconPencil size={16} />
                      Edit
                    </span>
                  </Dropdown.Item>
                  <Dropdown.Item id="download" textValue="Download">
                    <span className="flex items-center gap-2">
                      <IconDownload size={16} />
                      Download
                    </span>
                  </Dropdown.Item>
                  <Dropdown.Item
                    id="delete"
                    textValue="Delete"
                    variant="danger"
                  >
                    <span className="flex items-center gap-2">
                      <IconTrash size={16} />
                      Delete
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
    [openInvoiceModal, downloadInvoice]
  )

  const totalCount = invoices?.length ?? 0
  const filteredCount = filteredItems.length

  const activeFilterCount = useMemo(() => {
    let n = 0
    if (q.trim()) n += 1
    if (customer) n += 1
    if (product) n += 1
    if (paymentStatus) n += 1
    if (startDate || endDate) n += 1
    return n
  }, [q, customer, product, paymentStatus, startDate, endDate])

  const committedFilters = useMemo(
    (): InvoiceFilterDraft => ({
      customer,
      product,
      paymentStatus,
      startDate,
      endDate
    }),
    [customer, product, paymentStatus, startDate, endDate]
  )

  const defaultInvoiceFilters = useCallback((): InvoiceFilterDraft => {
    return {
      customer: "",
      product: "",
      paymentStatus: "",
      startDate: "",
      endDate: ""
    }
  }, [])

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <h1 className="text-2xl font-bold">Invoices</h1>
          <Button
            variant="primary"
            className="h-10 min-h-10 w-full shrink-0 px-4 sm:ml-auto sm:w-auto"
            onPress={() => openInvoiceModal("create")}
          >
            <span className="flex items-center justify-center gap-2">
              <IconPlus size={18} />
              Create Invoice
            </span>
          </Button>
        </div>

        <TableFilterDrawer<InvoiceFilterDraft>
          title="Filter invoices"
          description="Refine by customer, product, payment status, or invoice date."
          activeCount={activeFilterCount}
          committed={committedFilters}
          getDefaultDraft={defaultInvoiceFilters}
          onApply={(d) =>
            void setSearchParams({
              customer: d.customer,
              product: d.product,
              paymentStatus: d.paymentStatus,
              startDate: d.startDate,
              endDate: d.endDate
            })
          }
          rootClassName="w-full justify-center sm:w-auto"
          toolbarSlot={(toolbar) => (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-default-500">
                {filteredCount === totalCount
                  ? `${totalCount} invoices`
                  : `${filteredCount} of ${totalCount} invoices`}
              </p>
              <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-3">
                <SearchField
                  className="min-w-0 sm:min-w-0"
                  value={q}
                  onChange={(value) => setSearchParams({ q: value })}
                >
                  <SearchField.Group>
                    <SearchField.SearchIcon />
                    <SearchField.Input placeholder="Search invoices…" />
                    <SearchField.ClearButton />
                  </SearchField.Group>
                </SearchField>
                <div className="flex justify-center sm:justify-end">{toolbar}</div>
              </div>
            </div>
          )}
        >
          {({ draft, setDraft }) => (
            <InvoiceFiltersForm
              customers={customers}
              products={products}
              draft={draft}
              setDraft={setDraft}
            />
          )}
        </TableFilterDrawer>
      </div>
    )
  }, [
    q,
    activeFilterCount,
    filteredCount,
    totalCount,
    setSearchParams,
    committedFilters,
    defaultInvoiceFilters,
    customers,
    products,
    openInvoiceModal
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
          <h3 className="text-lg font-semibold">Failed to load invoices</h3>
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
      <Table aria-label="Invoices table">
        <Table.ScrollContainer
          className={cn(
            "relative min-w-0",
            isLoading && sortedItems.length === 0 && "min-h-[200px]"
          )}
        >
          <TableLoadingOverlay
            show={isLoading}
            label="Loading invoices"
          />
          <Table.Content
            sortDescriptor={sortDescriptor}
            onSortChange={({ column, direction }) => {
              const isSameColumn = column === sort.column
              const dir =
                (direction ?? "descending") as (typeof sort)["direction"]
              setSearchParams({
                sort: {
                  column:
                    ((column ?? "createdAt") as (typeof sort)["column"]) ??
                    "createdAt",
                  direction: isSameColumn ? dir : "descending"
                }
              })
            }}
            className={cn(
              isLoading && "pointer-events-none opacity-40",
              "min-w-[920px]"
            )}
          >
            <Table.Header columns={[...columns]}>
              {(column) => (
                <Table.Column
                  id={column.id}
                  isRowHeader={column.id === "id"}
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
                      No invoices found
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
                    id={String(item.id)}
                  >
                    {(column) => {
                      const colId = (column as { id: string }).id
                      return (
                        <Table.Cell
                          className={cn(
                            colId === "customer" &&
                              "min-w-[9rem] max-w-[14rem] align-top",
                            colId === "products" &&
                              "min-w-[11rem] max-w-[18rem] overflow-hidden align-top sm:max-w-[22rem]",
                            colId === "total" && "w-[1%] whitespace-nowrap",
                            colId === "paymentStatus" && "whitespace-nowrap",
                            colId === "amountPaid" && "whitespace-nowrap",
                            colId === "id" && "whitespace-nowrap",
                            colId === "createdAt" && "whitespace-nowrap",
                            colId === "actions" && "w-14 min-w-14"
                          )}
                        >
                          {renderCell(item, colId)}
                        </Table.Cell>
                      )
                    }}
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
