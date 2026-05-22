"use client"

import orderBy from "lodash.orderby"
import filter from "lodash.filter"
import { useRouter } from "next/navigation"
import { useMemo, useCallback } from "react"
import { useProductModalStore } from "@/stores/use-product-modal-store"
import { useProductsQuery } from "@/queries/use-products-query"
import { formatPrice, formatDate } from "@/utils/helpers"
import { parseAsString, parseAsStringEnum, useQueryStates } from "nuqs"
import { productSortParser } from "@/utils/sorting-parsers"
import { TableLoadingOverlay } from "@/components/table-loading-overlay"
import { TableFilterDrawer } from "@/components/table-filter-drawer"
import { ProductThumbnail } from "@/components/product-thumbnail"
import {
  ProductFiltersForm,
  type ProductFilterDraft
} from "@/app/(dashboard)/_components/product-filters-form"
import type { Product } from "@/db/schema"
import { ROUTES } from "@/utils/routes"
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
  Chip,
  Button,
  Dropdown,
  SearchField,
  cn
} from "@heroui/react"
import type { SortDescriptor } from "@heroui/react"

const columns = [
  { name: "PRODUCT", id: "name", sortable: true },
  { name: "SKU", id: "sku", sortable: false },
  { name: "PRICE", id: "price", sortable: true },
  { name: "STOCK", id: "stock", sortable: true },
  { name: "DATE", id: "createdAt", sortable: true },
  { name: "", id: "actions", sortable: false }
] as const

export function ProductsTable() {
  const router = useRouter()
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
              <ProductThumbnail
                src={product.images?.[0]}
                alt={product.name}
                boxClassName="size-10 shrink-0 rounded-md"
              />
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
              onClick={() => void navigator.clipboard.writeText(product.sku)}
            >
              {product.sku}
            </button>
          )
        case "price":
          return (
            <span className="font-medium tabular-nums whitespace-nowrap">
              {formatPrice(product.price)}
            </span>
          )
        case "stock":
          return (
            <span className="inline-flex max-w-full whitespace-nowrap">
              <Chip
                size="sm"
                variant="soft"
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
            </span>
          )
        case "createdAt":
          return (
            <span className="text-sm tabular-nums whitespace-nowrap text-default-500">
              {formatDate(product.createdAt)}
            </span>
          )
        case "actions":
          return (
            <Dropdown>
              <Dropdown.Trigger aria-label="Product actions">
                <IconDotsVertical size={18} />
              </Dropdown.Trigger>
              <Dropdown.Popover>
                <Dropdown.Menu
                  aria-label="Product actions"
                  onAction={(key) => {
                    if (key === "invoices") {
                      router.push(
                        `${ROUTES.invoices}?product=${encodeURIComponent(product.id)}`
                      )
                    } else if (key === "edit") {
                      openProductModal("update", product)
                    } else if (key === "delete") {
                      openProductModal("delete", product)
                    }
                  }}
                >
                  <Dropdown.Item id="invoices" textValue="View invoices">
                    <span className="flex items-center gap-2">
                      <IconFileInvoice size={16} />
                      View invoices
                    </span>
                  </Dropdown.Item>
                  <Dropdown.Item id="edit" textValue="Edit product">
                    <span className="flex items-center gap-2">
                      <IconPencil size={16} />
                      Edit product
                    </span>
                  </Dropdown.Item>
                  <Dropdown.Item
                    id="delete"
                    textValue="Delete product"
                    variant="danger"
                  >
                    <span className="flex items-center gap-2">
                      <IconTrash size={16} />
                      Delete product
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
    [openProductModal, router]
  )

  const totalCount = products?.length ?? 0
  const filteredCount = filteredItems.length

  const activeFilterCount = useMemo(() => {
    let n = 0
    if (q.trim()) n += 1
    if (availability !== "all") n += 1
    if (startDate || endDate) n += 1
    return n
  }, [q, availability, startDate, endDate])

  const committedFilters = useMemo(
    (): ProductFilterDraft => ({
      availability,
      startDate,
      endDate
    }),
    [availability, startDate, endDate]
  )

  const defaultProductFilters = useCallback(
    (): ProductFilterDraft => ({
      availability: "all",
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
              ? `${totalCount} products`
              : `${filteredCount} of ${totalCount} products`}
          </p>
        </div>
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:gap-3">
          <SearchField
            className="min-w-0"
            aria-label="Search products"
            value={q}
            onChange={(value) => setSearchParams({ q: value })}
          >
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Search by name..." />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>

          <TableFilterDrawer<ProductFilterDraft>
            title="Filter products"
            description="Availability and created date."
            activeCount={activeFilterCount}
            committed={committedFilters}
            getDefaultDraft={defaultProductFilters}
            onApply={(d) =>
              void setSearchParams({
                availability: d.availability,
                startDate: d.startDate,
                endDate: d.endDate
              })
            }
            triggerClassName="w-full justify-center sm:w-auto"
            rootClassName="w-full justify-center sm:w-auto"
          >
            {({ draft, setDraft }) => (
              <ProductFiltersForm draft={draft} setDraft={setDraft} />
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
    defaultProductFilters
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
          <h3 className="text-lg font-semibold">Failed to load products</h3>
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
      <Table aria-label="Products table">
        <Table.ScrollContainer
          className={cn(
            "relative min-w-0",
            isLoading && sortedItems.length === 0 && "min-h-[200px]"
          )}
        >
          <TableLoadingOverlay
            show={isLoading}
            label="Loading products"
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
                      No products found
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
