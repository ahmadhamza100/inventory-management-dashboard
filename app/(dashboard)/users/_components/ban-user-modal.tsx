"use client"

import { useTransition } from "react"
import { api } from "@/utils/api"
import { useQueryClient } from "@tanstack/react-query"
import { useUserModalStore } from "@/stores/use-user-modal-store"
import {
  Modal,
  useOverlayState,
  Button,
  Spinner,
  toast
} from "@heroui/react"
import { IconAlertTriangle } from "@tabler/icons-react"
import { gerErrorMessage } from "@/utils/error-handler"

export function BanUserModal() {
  const onClose = useUserModalStore((state) => state.onClose)
  const user = useUserModalStore((state) => state.user)
  const storeOpen = useUserModalStore(
    (state) => state.isOpen && state.type === "ban"
  )
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()

  const overlay = useOverlayState({
    isOpen: storeOpen,
    onOpenChange: (open) => {
      if (!open) onClose()
    }
  })

  const handleBan = () => {
    if (!user) return

    startTransition(async () => {
      try {
        await api.users[":id"].ban.$post({
          param: { id: user.id }
        })

        queryClient.invalidateQueries({ queryKey: ["users"] })
        toast.success("User banned permanently")
        onClose()
      } catch (error) {
        toast.danger(gerErrorMessage(error, "Failed to ban user"))
      }
    })
  }

  return (
    <Modal state={overlay}>
      <Modal.Backdrop>
        <Modal.Container size="md" scroll="outside">
          <Modal.Dialog>
            <Modal.Header className="relative flex flex-col gap-1 pr-12">
              <Modal.CloseTrigger className="absolute end-3 top-3" />
              <div className="flex items-center gap-2">
                <IconAlertTriangle className="text-danger" size={24} />
                <Modal.Heading className="text-xl font-semibold">Ban User</Modal.Heading>
              </div>
            </Modal.Header>
            <Modal.Body className="p-1">
              <div className="flex flex-col gap-4">
                <p className="text-sm text-default-600">
                  Are you sure you want to permanently ban{" "}
                  <span className="font-semibold text-foreground">
                    {user?.name || user?.email || "this user"}
                  </span>
                  ? This action cannot be undone.
                </p>

                <div className="flex justify-end gap-3">
                  <Button variant="secondary" onPress={onClose} isDisabled={isPending}>
                    Cancel
                  </Button>
                  <Button variant="danger" onPress={handleBan} isDisabled={isPending}>
                    {isPending ? (
                      <Spinner size="sm" color="current" />
                    ) : (
                      "Ban Permanently"
                    )}
                  </Button>
                </div>
              </div>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
