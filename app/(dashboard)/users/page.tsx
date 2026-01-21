"use client"

import { Button } from "@heroui/react"
import { IconPlus } from "@tabler/icons-react"
import { UsersTable } from "./_components/users-table"
import { useUserModalStore } from "@/stores/use-user-modal-store"
import { CreateUserModal } from "./_components/create-user-modal"
import { UpdateUserModal } from "./_components/update-user-modal"
import { BanUserModal } from "./_components/ban-user-modal"
import { UnbanUserModal } from "./_components/unban-user-modal"
import { DeleteUserModal } from "./_components/delete-user-modal"
import { ChangePasswordModal } from "./_components/change-password-modal"

export default function UsersPage() {
  const onOpen = useUserModalStore((state) => state.onOpen)

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Users</h1>

          <Button
            color="primary"
            startContent={<IconPlus size={18} />}
            onPress={() => onOpen("create")}
          >
            Create user
          </Button>
        </div>

        <UsersTable />
      </div>
      <CreateUserModal />
      <UpdateUserModal />
      <BanUserModal />
      <UnbanUserModal />
      <DeleteUserModal />
      <ChangePasswordModal />
    </>
  )
}
