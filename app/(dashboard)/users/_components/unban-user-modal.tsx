"use client"

import { useTransition } from "react"
import { api } from "@/utils/api"
import { useQueryClient } from "@tanstack/react-query"
import { useUserModalStore } from "@/stores/use-user-modal-store"
import { addToast } from "@heroui/react"
import { IconCheck } from "@tabler/icons-react"
import { gerErrorMessage } from "@/utils/error-handler"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button
} from "@heroui/react"

export function UnbanUserModal() {
  const onClose = useUserModalStore((state) => state.onClose)
  const user = useUserModalStore((state) => state.user)
  const isOpen = useUserModalStore(
    (state) => state.isOpen && state.type === "unban"
  )
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()

  const handleUnban = () => {
    if (!user) return

    startTransition(async () => {
      try {
        await api.users[":id"].unban.$post({
          param: { id: user.id }
        })

        queryClient.invalidateQueries({ queryKey: ["users"] })
        addToast({
          title: "User unbanned successfully",
          color: "success"
        })
        onClose()
      } catch (error) {
        addToast({
          title: gerErrorMessage(error, "Failed to unban user"),
          color: "danger"
        })
      }
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" placement="center">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <IconCheck className="text-success" size={24} />
            <h2 className="text-xl font-semibold">Unban User</h2>
          </div>
        </ModalHeader>
        <ModalBody className="pb-6">
          <div className="flex flex-col gap-4">
            <p className="text-sm text-default-600">
              Are you sure you want to unban{" "}
              <span className="font-semibold text-foreground">
                {user?.name || user?.email || "this user"}
              </span>
              ? They will be able to access the application again.
            </p>

            <div className="flex justify-end gap-3">
              <Button variant="flat" onPress={onClose} isDisabled={isPending}>
                Cancel
              </Button>
              <Button
                color="success"
                onPress={handleUnban}
                isLoading={isPending}
              >
                Unban User
              </Button>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
