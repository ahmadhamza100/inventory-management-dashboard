"use client"

import orderBy from "lodash.orderby"
import filter from "lodash.filter"
import { useMemo, useCallback } from "react"
import { useUserModalStore } from "@/stores/use-user-modal-store"
import { useUsersQuery } from "@/queries/use-users-query"
import { formatDate } from "@/utils/helpers"
import { parseAsString, parseAsStringEnum, useQueryStates } from "nuqs"
import { isBanned } from "@/utils/auth"
import type { User } from "@/queries/use-users-query"
import { TableLoadingOverlay } from "@/components/table-loading-overlay"
import { TableFilterDrawer } from "@/components/table-filter-drawer"
import {
  UserFiltersForm,
  type UserFilterDraft
} from "@/app/(dashboard)/_components/user-filters-form"
import {
  IconAlertTriangle,
  IconRefresh,
  IconDotsVertical,
  IconPencil,
  IconBan,
  IconLockOpen,
  IconTrash,
  IconKey
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
  { name: "NAME", id: "name", sortable: true },
  { name: "EMAIL", id: "email", sortable: true },
  { name: "ROLE", id: "role", sortable: true },
  { name: "STATUS", id: "status", sortable: false },
  { name: "DATE", id: "created_at", sortable: true },
  { name: "", id: "actions", sortable: false }
] as const

export function UsersTable() {
  const {
    data: users,
    isLoading,
    isError,
    refetch,
    isFetching
  } = useUsersQuery()

  const openUserModal = useUserModalStore((state) => state.onOpen)
  const [{ q, role, status, sort }, setSearchParams] = useQueryStates({
    q: parseAsString.withDefault(""),
    role: parseAsStringEnum(["all", "admin", "staff", "user"]).withDefault(
      "all"
    ),
    status: parseAsStringEnum(["all", "active", "banned"]).withDefault(
      "all"
    ),
    sort: parseAsString.withDefault("created_at:desc")
  })

  const parsedSort = useMemo(() => {
    const [column, direction] = sort.split(":")
    return {
      column: column as "name" | "email" | "role" | "created_at",
      direction: direction as "asc" | "desc"
    }
  }, [sort])

  const filteredItems = useMemo(() => {
    if (!users) return []

    let filtered = [...users]

    const query = q.trim().toLowerCase()
    if (query) {
      filtered = filter<User>(
        filtered,
        (user) =>
          (user.name?.toLowerCase().includes(query) ?? false) ||
          (user.email?.toLowerCase().includes(query) ?? false)
      )
    }

    if (role !== "all") {
      filtered = filter<User>(filtered, (user) => user.role === role)
    }

    if (status === "banned") {
      filtered = filter<User>(filtered, (user) => isBanned(user))
    } else if (status === "active") {
      filtered = filter<User>(filtered, (user) => !isBanned(user))
    }

    return filtered
  }, [users, q, role, status])

  const sortedItems = useMemo(() => {
    const lodashDirection = parsedSort.direction === "asc" ? "asc" : "desc"
    return orderBy(filteredItems, [parsedSort.column], [lodashDirection])
  }, [filteredItems, parsedSort])

  const renderCell = useCallback(
    (user: User, columnKey: React.Key) => {
      switch (columnKey) {
        case "name":
          return (
            <span className="block min-w-0 truncate text-sm font-medium">
              {user.name}
            </span>
          )
        case "email":
          return (
            <span className="block min-w-0 truncate text-sm text-default-500">
              {user.email}
            </span>
          )
        case "role":
          return (
            <Chip
              size="sm"
              variant="soft"
              color={user.role === "admin" ? "accent" : "default"}
            >
              {user.role}
            </Chip>
          )
        case "status":
          return (
            <Chip
              size="sm"
              variant="soft"
              color={isBanned(user) ? "danger" : "success"}
            >
              {isBanned(user) ? "Banned" : "Active"}
            </Chip>
          )
        case "created_at":
          return (
            <span className="text-sm tabular-nums whitespace-nowrap text-default-500">
              {formatDate(user.created_at)}
            </span>
          )
        case "actions":
          return (
            <Dropdown>
              <Dropdown.Trigger aria-label="User actions">
                <IconDotsVertical size={18} />
              </Dropdown.Trigger>
              <Dropdown.Popover>
                <Dropdown.Menu
                  aria-label="User actions"
                  onAction={(key) => {
                    if (key === "change-password") {
                      openUserModal("change-password", user)
                    } else if (key === "edit") {
                      openUserModal("update", user)
                    } else if (key === "ban") {
                      openUserModal("ban", user)
                    } else if (key === "unban") {
                      openUserModal("unban", user)
                    } else if (key === "delete") {
                      openUserModal("delete", user)
                    }
                  }}
                >
                  <Dropdown.Item id="change-password" textValue="Change password">
                    <span className="flex items-center gap-2">
                      <IconKey size={16} />
                      Change Password
                    </span>
                  </Dropdown.Item>
                  <Dropdown.Item id="edit" textValue="Edit user">
                    <span className="flex items-center gap-2">
                      <IconPencil size={16} />
                      Edit user
                    </span>
                  </Dropdown.Item>
                  {!isBanned(user) ? (
                    <Dropdown.Item
                      id="ban"
                      textValue="Ban user"
                      variant="danger"
                    >
                      <span className="flex items-center gap-2">
                        <IconBan size={16} />
                        Ban user
                      </span>
                    </Dropdown.Item>
                  ) : (
                    <Dropdown.Item id="unban" textValue="Unban user">
                      <span className="flex items-center gap-2">
                        <IconLockOpen size={16} />
                        Unban user
                      </span>
                    </Dropdown.Item>
                  )}
                  <Dropdown.Item
                    id="delete"
                    textValue="Delete user"
                    variant="danger"
                  >
                    <span className="flex items-center gap-2">
                      <IconTrash size={16} />
                      Delete user
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
    [openUserModal]
  )

  const totalCount = users?.length ?? 0
  const filteredCount = filteredItems.length

  const activeFilterCount = useMemo(() => {
    let n = 0
    if (q.trim()) n += 1
    if (role !== "all") n += 1
    if (status !== "all") n += 1
    return n
  }, [q, role, status])

  const committedFilters = useMemo(
    (): UserFilterDraft => ({
      role,
      status
    }),
    [role, status]
  )

  const defaultUserFilters = useCallback(
    (): UserFilterDraft => ({
      role: "all",
      status: "all"
    }),
    []
  )

  const handleSortChange = useCallback(
    (column: string, direction: "ascending" | "descending") => {
      const dir = direction === "ascending" ? "asc" : "desc"
      setSearchParams({ sort: `${column}:${dir}` })
    },
    [setSearchParams]
  )

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-default-500">
            {filteredCount === totalCount
              ? `${totalCount} users`
              : `${filteredCount} of ${totalCount} users`}
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
              <SearchField.Input placeholder="Search by name or email..." />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>

          <TableFilterDrawer<UserFilterDraft>
            title="Filter users"
            description="Role and account status."
            activeCount={activeFilterCount}
            committed={committedFilters}
            getDefaultDraft={defaultUserFilters}
            onApply={(d) =>
              void setSearchParams({
                role: d.role,
                status: d.status
              })
            }
            triggerClassName="w-full justify-center sm:w-auto"
            rootClassName="w-full justify-center sm:w-auto"
          >
            {({ draft, setDraft }) => (
              <UserFiltersForm draft={draft} setDraft={setDraft} />
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
    defaultUserFilters
  ])

  const sortDescriptor: SortDescriptor = useMemo(
    () => ({
      column: parsedSort.column,
      direction:
        parsedSort.direction === "asc" ? "ascending" : "descending"
    }),
    [parsedSort.column, parsedSort.direction]
  )

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-divider bg-content1 px-8 py-16">
        <div className="flex size-16 items-center justify-center rounded-full bg-danger/10">
          <IconAlertTriangle size={32} className="text-danger" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold">Failed to load users</h3>
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
      <Table aria-label="Users table">
        <Table.ScrollContainer
          className={cn(
            "relative min-w-0",
            isLoading && sortedItems.length === 0 && "min-h-[200px]"
          )}
        >
          <TableLoadingOverlay show={isLoading} label="Loading users" />
          <Table.Content
            sortDescriptor={sortDescriptor}
            onSortChange={(descriptor) => {
              handleSortChange(
                String(descriptor.column),
                descriptor.direction ?? "descending"
              )
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
                      No users found
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
