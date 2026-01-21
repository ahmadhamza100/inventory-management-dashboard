"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTransition } from "react"
import { api } from "@/utils/api"
import { useQueryClient } from "@tanstack/react-query"
import { useUserModalStore } from "@/stores/use-user-modal-store"
import {
  addToast,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button
} from "@heroui/react"
import { FormError } from "@/components/form-error"
import { PasswordInput } from "@/components/password-input"
import { newPasswordSchema, type NewPasswordSchema } from "@/validations/auth"
import { gerErrorMessage } from "@/utils/error-handler"

export function ChangePasswordModal() {
  const onClose = useUserModalStore((state) => state.onClose)
  const user = useUserModalStore((state) => state.user)
  const isOpen = useUserModalStore(
    (state) => state.isOpen && state.type === "change-password"
  )
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()

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
        addToast({
          title: "Password updated successfully",
          color: "success"
        })
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
    <Modal isOpen={isOpen} onClose={onClose} size="md" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">Change Password</h2>
          <p className="text-sm font-normal text-default-500">
            Update password for{" "}
            <span className="font-medium text-foreground">
              {user?.name || user?.email || "this user"}
            </span>
          </p>
        </ModalHeader>
        <ModalBody className="pb-6">
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <FormError form={form} />

            <Controller
              control={form.control}
              name="newPassword"
              render={({ field, fieldState }) => (
                <PasswordInput
                  {...field}
                  label="New Password"
                  placeholder="Enter new password"
                  labelPlacement="outside"
                  isDisabled={isPending}
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              control={form.control}
              name="confirmPassword"
              render={({ field, fieldState }) => (
                <PasswordInput
                  {...field}
                  label="Confirm New Password"
                  placeholder="Confirm new password"
                  labelPlacement="outside"
                  isDisabled={isPending}
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="flat"
                onPress={onClose}
                isDisabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" color="primary" isLoading={isPending}>
                Update Password
              </Button>
            </div>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
