"use client"

import orderBy from "lodash.orderby"
import filter from "lodash.filter"
import { useMemo, useCallback, useState } from "react"
import { useInvoiceModalStore } from "@/stores/use-invoice-modal-store"
import { useInvoicesQuery } from "@/queries/use-invoices-query"
import { useCustomersQuery } from "@/queries/use-customers-query"
import { useProductsQuery } from "@/queries/use-products-query"
import { formatDate, formatPrice, getPaymentStatus } from "@/utils/helpers"
import { parseAsString, useQueryStates } from "nuqs"
import { invoiceSortParser } from "@/utils/sorting-parsers"
import type { InvoiceWithDetails } from "@/stores/use-invoice-modal-store"
import {
  IconSearch,
  IconAlertTriangle,
  IconRefresh,
  IconDotsVertical,
  IconEye,
  IconPencil,
  IconTrash,
  IconDownload,
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
  DropdownItem,
  Autocomplete,
  AutocompleteItem,
  Select,
  SelectItem,
  Chip
} from "@heroui/react"

const columns = [
  { name: "ID", uid: "id", sortable: true },
  { name: "CUSTOMER", uid: "customer", sortable: false },
  { name: "PRODUCTS", uid: "products", sortable: false },
  { name: "TOTAL", uid: "total", sortable: true },
  { name: "PAYMENT STATUS", uid: "paymentStatus", sortable: false },
  { name: "AMOUNT PAID", uid: "amountPaid", sortable: false },
  { name: "DATE", uid: "createdAt", sortable: true },
  { name: "", uid: "actions", sortable: false }
]

export function InvoicesTable() {
  const {
    data: invoices,
    isLoading,
    isError,
    refetch,
    isFetching
  } = useInvoicesQuery()
  const { data: customers } = useCustomersQuery()
  const { data: products } = useProductsQuery()

  const openInvoiceModal = useInvoiceModalStore((state) => state.onOpen)
  const [{ q, sort, customer, product, paymentStatus }, setSearchParams] =
    useQueryStates({
      q: parseAsString.withDefault(""),
      customer: parseAsString.withDefault(""),
      product: parseAsString.withDefault(""),
      paymentStatus: parseAsString.withDefault(""),
      sort: invoiceSortParser.withDefault({
        column: "createdAt",
        direction: "descending"
      })
    })

  const [customerSearchValue, setCustomerSearchValue] = useState("")
  const [productSearchValue, setProductSearchValue] = useState("")

  const customerInputValue = useMemo(() => {
    if (customer && customers) {
      const selectedCustomer = customers.find((c) => c.id === customer)
      return selectedCustomer?.name || customerSearchValue
    }
    return customerSearchValue
  }, [customer, customers, customerSearchValue])

  const productInputValue = useMemo(() => {
    if (product && products) {
      const selectedProduct = products.find((p) => p.id === product)
      return selectedProduct?.name || productSearchValue
    }
    return productSearchValue
  }, [product, products, productSearchValue])

  const filteredItems = useMemo(() => {
    if (!invoices) return []

    let filtered = [...invoices]

    const query = q.trim().toLowerCase()
    if (query) {
      filtered = filter(filtered, (invoice) => {
        const invoiceId = `#${invoice.id.toLowerCase()}` || ""
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

    return filtered
  }, [invoices, q, customer, product, paymentStatus, products])

  const sortedItems = useMemo(() => {
    const lodashDirection = sort.direction === "ascending" ? "asc" : "desc"
    return orderBy(filteredItems, [sort.column], [lodashDirection])
  }, [filteredItems, sort])

  const renderCell = useCallback(
    (invoice: InvoiceWithDetails, columnKey: React.Key) => {
      switch (columnKey) {
        case "id":
          return (
            <button
              onClick={() => openInvoiceModal("view", invoice)}
              className="font-mono text-sm font-medium"
            >
              #{invoice.id}
            </button>
          )
        case "customer":
          return (
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {invoice.customer.name}
              </span>
              {invoice.customer.email && (
                <span className="text-xs text-default-500">
                  {invoice.customer.email}
                </span>
              )}
            </div>
          )
        case "products":
          return (
            <div className="flex flex-wrap gap-1">
              {invoice.products.slice(0, 2).map((product, index) => (
                <Chip key={index} size="sm" variant="flat" className="text-xs">
                  {product.name || "Unknown Product"} ({product.quantity})
                </Chip>
              ))}
              {invoice.products.length > 2 && (
                <Chip size="sm" variant="flat" className="text-xs">
                  +{invoice.products.length - 2} more
                </Chip>
              )}
              {invoice.products.length === 0 && (
                <span className="text-xs text-default-400">No products</span>
              )}
            </div>
          )
        case "total":
          return (
            <span className="text-sm font-semibold tabular-nums">
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
              <Chip size="sm" color={config.color} variant="flat">
                {config.label}
              </Chip>
            )
          })()
        case "amountPaid":
          return (
            <span className="text-sm text-default-600 tabular-nums">
              {formatPrice(invoice.amountPaid)}
            </span>
          )
        case "createdAt":
          return (
            <span className="text-sm whitespace-nowrap text-default-500">
              {formatDate(invoice.createdAt)}
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
              <DropdownMenu aria-label="Invoice actions">
                <DropdownItem
                  key="view"
                  startContent={<IconEye size={16} />}
                  onPress={() => openInvoiceModal("view", invoice)}
                >
                  View
                </DropdownItem>
                <DropdownItem
                  key="edit"
                  startContent={<IconPencil size={16} />}
                  onPress={() => openInvoiceModal("update", invoice)}
                >
                  Edit
                </DropdownItem>
                <DropdownItem
                  key="download"
                  startContent={<IconDownload size={16} />}
                  onPress={() => {
                    console.log("Download invoice", invoice.id)
                  }}
                >
                  Download
                </DropdownItem>
                <DropdownItem
                  key="delete"
                  color="danger"
                  className="text-danger"
                  startContent={<IconTrash size={16} />}
                  onPress={() => openInvoiceModal("delete", invoice)}
                >
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          )
        default:
          return null
      }
    },
    [openInvoiceModal]
  )

  const totalCount = invoices?.length ?? 0
  const filteredCount = filteredItems.length

  const hasActiveFilters =
    q.trim() !== "" || customer !== "" || product !== "" || paymentStatus !== ""

  const handleClearFilters = useCallback(() => {
    setSearchParams({
      q: "",
      customer: "",
      product: "",
      paymentStatus: "",
      sort: {
        column: "createdAt",
        direction: "descending"
      }
    })
    setCustomerSearchValue("")
    setProductSearchValue("")
  }, [setSearchParams])

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-default-500">
            {filteredCount === totalCount
              ? `${totalCount} invoices`
              : `${filteredCount} of ${totalCount} invoices`}
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-4 overflow-x-auto [&>svg]:shrink-0 sm:flex-row">
            <Input
              isClearable
              className="w-full sm:max-w-xs"
              placeholder="Search invoices..."
              startContent={
                <IconSearch size={18} className="text-default-400" />
              }
              value={q}
              onClear={() => setSearchParams({ q: "" })}
              onValueChange={(value) => setSearchParams({ q: value })}
            />

            <Autocomplete
              className="md:max-w-[14rem] w-full"
              placeholder="Filter by customer"
              defaultItems={customers || []}
              selectedKey={customer || null}
              onSelectionChange={(key) => {
                const selectedCustomer = customers?.find((c) => c.id === key)
                setSearchParams({
                  customer: key ? String(key) : ""
                })
                if (selectedCustomer) {
                  setCustomerSearchValue(selectedCustomer.name)
                } else {
                  setCustomerSearchValue("")
                }
              }}
              inputValue={customerInputValue}
              onInputChange={(value) => {
                setCustomerSearchValue(value)
                if (customer) {
                  const selectedCustomer = customers?.find((c) => c.id === customer)
                  if (value !== selectedCustomer?.name) {
                    setSearchParams({ customer: "" })
                  }
                }
              }}
              allowsCustomValue={false}
              labelPlacement="outside"
              isClearable
              onClear={() => {
                setSearchParams({ customer: "" })
                setCustomerSearchValue("")
              }}
            >
              {(customer) => (
                <AutocompleteItem key={customer.id} textValue={customer.name}>
                  <div className="flex flex-col">
                    <span className="text-small">{customer.name}</span>
                    {customer.email && (
                      <span className="text-tiny text-default-400">
                        {customer.email}
                      </span>
                    )}
                  </div>
                </AutocompleteItem>
              )}
            </Autocomplete>

            <Autocomplete
              className="md:max-w-[14rem] w-full"
              placeholder="Filter by product"
              defaultItems={products || []}
              selectedKey={product || null}
              onSelectionChange={(key) => {
                const selectedProduct = products?.find((p) => p.id === key)
                setSearchParams({
                  product: key ? String(key) : ""
                })
                if (selectedProduct) {
                  setProductSearchValue(selectedProduct.name)
                } else {
                  setProductSearchValue("")
                }
              }}
              inputValue={productInputValue}
              onInputChange={(value) => {
                setProductSearchValue(value)
                if (product) {
                  const selectedProduct = products?.find((p) => p.id === product)
                  if (value !== selectedProduct?.name) {
                    setSearchParams({ product: "" })
                  }
                }
              }}
              allowsCustomValue={false}
              labelPlacement="outside"
              isClearable
              onClear={() => {
                setSearchParams({ product: "" })
                setProductSearchValue("")
              }}
            >
              {(product) => (
                <AutocompleteItem key={product.id} textValue={product.name}>
                  <div className="flex flex-col">
                    <span className="text-small">{product.name}</span>
                    <span className="text-tiny text-default-400">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                </AutocompleteItem>
              )}
            </Autocomplete>

            <Select
              className="md:max-w-auto md:w-auto w-full"
              fullWidth={false}
              placeholder="Payment status"
              selectedKeys={paymentStatus ? [paymentStatus] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string | undefined
                setSearchParams({
                  paymentStatus: selected || ""
                })
              }}
              labelPlacement="outside"
              isClearable
              onClear={() => {
                setSearchParams({ paymentStatus: "" })
              }}
            >
              <SelectItem key="paid">Paid</SelectItem>
              <SelectItem key="partially_paid">Partially Paid</SelectItem>
              <SelectItem key="unpaid">Unpaid</SelectItem>
            </Select>

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
    filteredCount,
    totalCount,
    setSearchParams,
    hasActiveFilters,
    handleClearFilters,
    customers,
    products,
    customer,
    product,
    paymentStatus,
    customerInputValue,
    productInputValue
  ])

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
      aria-label="Invoices table"
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
            column: (column as typeof sort.column) || "createdAt",
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
        emptyContent={<p className="text-default-500">No invoices found</p>}
        loadingContent={
          <Spinner className="pt-10" label="Loading invoices..." />
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
