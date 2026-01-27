"use client"

import orderBy from "lodash.orderby"
import filter from "lodash.filter"
import { useMemo, useCallback } from "react"
import { useProductModalStore } from "@/stores/use-product-modal-store"
import { useProductsQuery } from "@/queries/use-products-query"
import { formatPrice, formatDate } from "@/utils/helpers"
import { parseAsString, parseAsStringEnum, useQueryStates } from "nuqs"
import { productSortParser } from "@/utils/sorting-parsers"
import { DateRangeFilter } from "@/app/(dashboard)/_components/date-range-filter"
import type { Product } from "@/db/schema"
import {
  IconSearch,
  IconAlertTriangle,
  IconRefresh,
  IconDotsVertical,
  IconFileInvoice,
  IconPencil,
  IconTrash,
  IconPhoto,
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
  Image,
  Chip,
  Select,
  SelectItem,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem
} from "@heroui/react"

const columns = [
  { name: "PRODUCT", uid: "name", sortable: true },
  { name: "SKU", uid: "sku", sortable: false },
  { name: "PRICE", uid: "price", sortable: true },
  { name: "STOCK", uid: "stock", sortable: true },
  { name: "DATE", uid: "createdAt", sortable: true },
  { name: "", uid: "actions", sortable: false }
]

export function ProductsTable() {
  const {
    data: products,
    isLoading,
    isError,
    refetch,
    isFetching
  } = useProductsQuery()

  const openProductModal = useProductModalStore((state) => state.onOpen)
  const [{ q, availability, startDate, endDate, sort }, setSearchParams] =
    useQueryStates({
      q: parseAsString.withDefault(""),
      availability: parseAsStringEnum([
        "all",
        "in_stock",
        "out_of_stock"
      ]).withDefault("all"),
      startDate: parseAsString.withDefault(""),
      endDate: parseAsString.withDefault(""),
      sort: productSortParser.withDefault({
        column: "createdAt",
        direction: "descending"
      })
    })

  const filteredItems = useMemo(() => {
    if (!products) return []

    let filtered = [...products]

    const query = q.trim().toLowerCase()
    if (query) {
      filtered = filter(
        filtered,
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.sku.toLowerCase().includes(query)
      )
    }

    if (availability === "in_stock") {
      filtered = filter(filtered, (product) => product.stock > 0)
    } else if (availability === "out_of_stock") {
      filtered = filter(filtered, (product) => product.stock === 0)
    }

    if (startDate) {
      const start = new Date(startDate)
      filtered = filter(
        filtered,
        (product) => new Date(product.createdAt) >= start
      )
    }

    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      filtered = filter(
        filtered,
        (product) => new Date(product.createdAt) <= end
      )
    }

    return filtered
  }, [products, q, availability, startDate, endDate])

  const sortedItems = useMemo(() => {
    const lodashDirection = sort.direction === "ascending" ? "asc" : "desc"
    return orderBy(filteredItems, [sort.column], [lodashDirection])
  }, [filteredItems, sort])

  const renderCell = useCallback(
    (product: Product, columnKey: React.Key) => {
      switch (columnKey) {
        case "name":
          return (
            <div className="flex items-center gap-3">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  width={40}
                  height={40}
                  radius="md"
                  className="shrink-0 object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-default-100">
                  <IconPhoto className="size-5 text-default-400" />
                </div>
              )}
              <span className="truncate text-sm font-medium">
                {product.name}
              </span>
            </div>
          )
        case "sku":
          return (
            <button
              type="button"
              className="font-mono text-sm whitespace-nowrap text-default-500"
              onClick={() => navigator.clipboard.writeText(product.sku)}
            >
              {product.sku}
            </button>
          )
        case "price":
          return (
            <span className="font-medium">{formatPrice(product.price)}</span>
          )
        case "stock":
          return (
            <Chip
              size="sm"
              variant="flat"
              color={
                product.stock > 100
                  ? "success"
                  : product.stock > 0
                    ? "warning"
                    : "danger"
              }
            >
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </Chip>
          )
        case "createdAt":
          return (
            <span className="text-sm whitespace-nowrap text-default-500">
              {formatDate(product.createdAt)}
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
              <DropdownMenu aria-label="Product actions">
                <DropdownItem
                  key="invoices"
                  startContent={<IconFileInvoice size={16} />}
                >
                  View invoices
                </DropdownItem>
                <DropdownItem
                  key="edit"
                  startContent={<IconPencil size={16} />}
                  onPress={() => openProductModal("update", product)}
                >
                  Edit product
                </DropdownItem>
                <DropdownItem
                  key="delete"
                  color="danger"
                  className="text-danger"
                  startContent={<IconTrash size={16} />}
                  onPress={() => openProductModal("delete", product)}
                >
                  Delete product
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          )
        default:
          return null
      }
    },
    [openProductModal]
  )

  const totalCount = products?.length ?? 0
  const filteredCount = filteredItems.length

  type Availability = NonNullable<typeof availability>

  const hasActiveFilters =
    q.trim() !== "" ||
    availability !== "all" ||
    startDate !== "" ||
    endDate !== ""

  const handleClearFilters = useCallback(() => {
    setSearchParams({
      q: "",
      availability: "all",
      startDate: "",
      endDate: "",
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
              ? `${totalCount} products`
              : `${filteredCount} of ${totalCount} products`}
          </p>
        </div>
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Input
            isClearable
            className="w-full sm:max-w-xs"
            placeholder="Search by name..."
            startContent={<IconSearch size={18} className="text-default-400" />}
            value={q}
            onClear={() => setSearchParams({ q: "" })}
            onValueChange={(value) => setSearchParams({ q: value })}
          />
          <Select
            className="w-full sm:w-40"
            selectedKeys={[availability]}
            aria-label="Filter by availability"
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0]
              setSearchParams({ availability: selected as Availability })
            }}
          >
            <SelectItem key="all">All</SelectItem>
            <SelectItem key="in_stock">In Stock</SelectItem>
            <SelectItem key="out_of_stock">Out of Stock</SelectItem>
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
    )
  }, [
    q,
    availability,
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
          <h3 className="text-lg font-semibold">Failed to load products</h3>
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
      aria-label="Products table"
      topContent={topContent}
      topContentPlacement="outside"
      sortDescriptor={{ column: sort.column, direction: sort.direction }}
      onSortChange={({ column, direction }) => {
        setSearchParams({
          sort: {
            column: column as typeof sort.column,
            direction: direction as typeof sort.direction
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
        emptyContent={<p className="text-default-500">No products found</p>}
        loadingContent={
          <Spinner className="pt-10" label="Loading products..." />
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
