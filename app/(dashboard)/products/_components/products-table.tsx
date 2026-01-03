"use client"

import orderBy from "lodash.orderby"
import filter from "lodash.filter"
import { useMemo, useState, useCallback } from "react"
import { useProductModalStore } from "@/stores/use-product-modal-store"
import { useProductsQuery, type Product } from "@/queries/use-products-query"
import { formatPrice, formatDate } from "@/utils/helpers"
import {
  IconSearch,
  IconAlertTriangle,
  IconRefresh,
  IconDotsVertical,
  IconFileInvoice,
  IconPencil,
  IconTrash
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
  DropdownItem,
  type SortDescriptor
} from "@heroui/react"

const columns = [
  { name: "PRODUCT", uid: "name", sortable: true },
  { name: "SKU", uid: "sku", sortable: false },
  { name: "PRICE", uid: "price", sortable: true },
  { name: "STOCK", uid: "stock", sortable: true },
  { name: "CREATED", uid: "createdAt", sortable: true },
  { name: "", uid: "actions", sortable: false }
]

type Availability = "all" | "in_stock" | "out_of_stock"

export function ProductsTable() {
  const {
    data: products,
    isLoading,
    isError,
    refetch,
    isFetching
  } = useProductsQuery()

  const openProductModal = useProductModalStore((state) => state.onOpen)
  const [filterValue, setFilterValue] = useState("")
  const [availability, setAvailability] = useState<Availability>("all")
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "createdAt",
    direction: "descending"
  })

  const filteredItems = useMemo(() => {
    if (!products) return []

    let filtered = [...products]

    const query = filterValue.trim().toLowerCase()
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

    return filtered
  }, [products, filterValue, availability])

  const sortedItems = useMemo(() => {
    const column = sortDescriptor.column as keyof Product
    const direction = sortDescriptor.direction === "descending" ? "desc" : "asc"

    return orderBy(filteredItems, [column], [direction])
  }, [filteredItems, sortDescriptor])

  const renderCell = useCallback(
    (product: Product, columnKey: React.Key) => {
      switch (columnKey) {
        case "name":
          return (
            <div className="flex items-center gap-3">
              <Image
                src={product.image}
                alt={product.name}
                width={40}
                height={40}
                radius="md"
                className="shrink-0 object-cover"
              />
              <span className="truncate text-sm font-medium">
                {product.name}
              </span>
            </div>
          )
        case "sku":
          return (
            <button
              className="font-mono text-sm text-default-500"
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
            value={filterValue}
            onClear={() => setFilterValue("")}
            onValueChange={setFilterValue}
          />
          <Select
            className="w-full sm:w-40"
            selectedKeys={[availability]}
            aria-label="Filter by availability"
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as Availability
              setAvailability(selected)
            }}
          >
            <SelectItem key="all">All</SelectItem>
            <SelectItem key="in_stock">In Stock</SelectItem>
            <SelectItem key="out_of_stock">Out of Stock</SelectItem>
          </Select>
        </div>
      </div>
    )
  }, [filterValue, availability, filteredCount, totalCount])

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
      sortDescriptor={sortDescriptor}
      onSortChange={setSortDescriptor}
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
