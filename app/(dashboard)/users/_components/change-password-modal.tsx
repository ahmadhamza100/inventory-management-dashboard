"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTransition } from "react"
import { api } from "@/utils/api"
import { useQueryClient } from "@tanstack/react-query"
import { useUserModalStore } from "@/stores/use-user-modal-store"
import {
  Modal,
  useOverlayState,
  Button,
  Spinner,
  toast,
  TextField,
  Input,
  FieldError
} from "@heroui/react"
import { FormError } from "@/components/form-error"
import { newPasswordSchema, type NewPasswordSchema } from "@/validations/auth"
import { gerErrorMessage } from "@/utils/error-handler"

export function ChangePasswordModal() {
  const onClose = useUserModalStore((state) => state.onClose)
  const user = useUserModalStore((state) => state.user)
  const storeOpen = useUserModalStore(
    (state) => state.isOpen && state.type === "change-password"
  )
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()

  const overlay = useOverlayState({
    isOpen: storeOpen,
    onOpenChange: (open) => {
      if (!open) onClose()
    }
  })

  const form = useForm<NewPasswordSchema>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: ""
    }
  })

  const onSubmit = form.handleSubmit(async (data) => {
    if (!user) return

    startTransition(async () => {
      try {
        await api.users[":id"].password.$post({
          param: { id: user.id },
          json: { password: data.newPassword }
        })

        queryClient.invalidateQueries({ queryKey: ["users"] })
        toast.success("Password updated successfully")
        form.reset()
        onClose()
      } catch (error) {
        form.setError("root", {
          message: gerErrorMessage(error, "Failed to update password")
        })
      }
    })
  })

  return (
    <Modal state={overlay}>
      <Modal.Backdrop>
        <Modal.Container size="md" scroll="outside">
          <Modal.Dialog>
            <Modal.Header className="relative flex flex-col gap-1 pr-12">
              <Modal.CloseTrigger className="absolute end-3 top-3" />
              <Modal.Heading className="text-xl font-semibold">
                Change Password
              </Modal.Heading>
              <p className="text-sm font-normal text-default-500">
                Update password for{" "}
                <span className="font-medium text-foreground">
                  {user?.name || user?.email || "this user"}
                </span>
              </p>
            </Modal.Header>
            <Modal.Body className="p-1">
              <form onSubmit={onSubmit} className="flex flex-col gap-4">
                <FormError form={form} />

                <Controller
                  control={form.control}
                  name="newPassword"
                  render={({ field, fieldState }) => (
                    <TextField
                      isInvalid={fieldState.invalid}
                      isDisabled={isPending}
                      name={field.name}
                      onBlur={field.onBlur}
                      onChange={field.onChange}
                      value={field.value}
                      ref={field.ref}
                    >
                      <Input
                        type="password"
                        placeholder="Enter new password"
                        aria-label="New password"
                      />
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </TextField>
                  )}
                />

                <Controller
                  control={form.control}
                  name="confirmPassword"
                  render={({ field, fieldState }) => (
                    <TextField
                      isInvalid={fieldState.invalid}
                      isDisabled={isPending}
                      name={field.name}
                      onBlur={field.onBlur}
                      onChange={field.onChange}
                      value={field.value}
                      ref={field.ref}
                    >
                      <Input
                        type="password"
                        placeholder="Confirm new password"
                        aria-label="Confirm new password"
                      />
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </TextField>
                  )}
                />

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onPress={onClose}
                    isDisabled={isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" isDisabled={isPending}>
                    {isPending ? (
                      <Spinner size="sm" color="current" />
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </div>
              </form>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
