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
import {
  IconSearch,
  IconAlertTriangle,
  IconRefresh,
  IconDotsVertical,
  IconPencil,
  IconBan,
  IconLockOpen,
  IconTrash,
  IconKey,
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
  { name: "NAME", uid: "name", sortable: true },
  { name: "EMAIL", uid: "email", sortable: true },
  { name: "ROLE", uid: "role", sortable: true },
  { name: "STATUS", uid: "status", sortable: false },
  { name: "DATE", uid: "created_at", sortable: true },
  { name: "", uid: "actions", sortable: false }
]

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
    role: parseAsStringEnum(["all", "admin", "user"]).withDefault("all"),
    status: parseAsStringEnum(["all", "active", "banned"]).withDefault("all"),
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
          return <span className="text-sm font-medium">{user.name}</span>
        case "email":
          return <span className="text-sm text-default-500">{user.email}</span>
        case "role":
          return (
            <Chip
              size="sm"
              variant="flat"
              color={user.role === "admin" ? "primary" : "default"}
            >
              {user.role}
            </Chip>
          )
        case "status":
          return (
            <Chip
              size="sm"
              variant="flat"
              color={isBanned(user) ? "danger" : "success"}
            >
              {isBanned(user) ? "Banned" : "Active"}
            </Chip>
          )
        case "created_at":
          return (
            <span className="text-sm whitespace-nowrap text-default-500">
              {formatDate(user.created_at)}
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
              <DropdownMenu aria-label="User actions">
                <DropdownItem
                  key="change-password"
                  startContent={<IconKey size={16} />}
                  onPress={() => openUserModal("change-password", user)}
                >
                  Change Password
                </DropdownItem>
                <DropdownItem
                  key="edit"
                  startContent={<IconPencil size={16} />}
                  onPress={() => openUserModal("update", user)}
                >
                  Edit user
                </DropdownItem>
                {!isBanned(user) ? (
                  <DropdownItem
                    key="ban"
                    color="danger"
                    className="text-danger"
                    startContent={<IconBan size={16} />}
                    onPress={() => openUserModal("ban", user)}
                  >
                    Ban user
                  </DropdownItem>
                ) : (
                  <DropdownItem
                    key="unban"
                    startContent={<IconLockOpen size={16} />}
                    onPress={() => openUserModal("unban", user)}
                  >
                    Unban user
                  </DropdownItem>
                )}
                <DropdownItem
                  key="delete"
                  color="danger"
                  className="text-danger"
                  startContent={<IconTrash size={16} />}
                  onPress={() => openUserModal("delete", user)}
                >
                  Delete user
                </DropdownItem>
              </DropdownMenu>
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

  type Role = NonNullable<typeof role>
  type Status = NonNullable<typeof status>

  const hasActiveFilters = q.trim() !== "" || role !== "all" || status !== "all"

  const handleClearFilters = useCallback(() => {
    setSearchParams({
      q: "",
      role: "all",
      status: "all",
      sort: "created_at:desc"
    })
  }, [setSearchParams])

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
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Input
            isClearable
            className="w-full sm:max-w-xs"
            placeholder="Search by name or email..."
            startContent={<IconSearch size={18} className="text-default-400" />}
            value={q}
            onClear={() => setSearchParams({ q: "" })}
            onValueChange={(value) => setSearchParams({ q: value })}
          />
          <Select
            className="w-full sm:w-40"
            selectedKeys={[role]}
            aria-label="Filter by role"
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0]
              setSearchParams({ role: selected as Role })
            }}
          >
            <SelectItem key="all">All Roles</SelectItem>
            <SelectItem key="admin">Admin</SelectItem>
            <SelectItem key="user">User</SelectItem>
          </Select>
          <Select
            className="w-full sm:w-40"
            selectedKeys={[status]}
            aria-label="Filter by status"
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0]
              setSearchParams({ status: selected as Status })
            }}
          >
            <SelectItem key="all">All Status</SelectItem>
            <SelectItem key="active">Active</SelectItem>
            <SelectItem key="banned">Banned</SelectItem>
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
    )
  }, [
    q,
    role,
    status,
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
          <h3 className="text-lg font-semibold">Failed to load users</h3>
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
      aria-label="Users table"
      topContent={topContent}
      topContentPlacement="outside"
      sortDescriptor={{
        column: parsedSort.column,
        direction: parsedSort.direction === "asc" ? "ascending" : "descending"
      }}
      onSortChange={(descriptor) => {
        if (descriptor.column) {
          handleSortChange(
            descriptor.column as string,
            descriptor.direction || "descending"
          )
        }
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
        emptyContent={<p className="text-default-500">No users found</p>}
        loadingContent={<Spinner className="pt-10" label="Loading users..." />}
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
