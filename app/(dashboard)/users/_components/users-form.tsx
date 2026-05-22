"use client"

import { useCallback, useEffect, useMemo } from "react"
import { api } from "@/utils/api"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import {
  Button,
  TextField,
  Label,
  Input,
  FieldError,
  Spinner,
  toast,
  cn
} from "@heroui/react"
import { useUserModalStore } from "@/stores/use-user-modal-store"
import { gerErrorMessage } from "@/utils/error-handler"
import { FormError } from "@/components/form-error"
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserSchema,
  type UpdateUserSchema
} from "@/validations/users"
import { useForm, Controller, type DefaultValues } from "react-hook-form"

export function UsersForm() {
  const onClose = useUserModalStore((state) => state.onClose)
  const user = useUserModalStore((state) => state.user)
  const queryClient = useQueryClient()

  const isEditing = !!user

  const schema = isEditing ? updateUserSchema : createUserSchema
  type FormSchema = CreateUserSchema | UpdateUserSchema

  const defaultValues: DefaultValues<FormSchema> = useMemo(() => {
    return {
      email: user?.email ?? "",
      name: user?.name ?? ""
    }
  }, [user])

  const form = useForm<FormSchema>({
    resolver: zodResolver(schema),
    defaultValues
  })

  const onSubmit = useCallback(
    async (values: FormSchema) => {
      try {
        if (isEditing) {
          await api.users[":id"].$patch({
            json: values as UpdateUserSchema,
            param: { id: user?.id }
          })
          toast.success("User updated successfully")
        } else {
          await api.users.$post({ json: values as CreateUserSchema })
          toast.success("User created successfully")
        }

        queryClient.invalidateQueries({ queryKey: ["users"] })
        onClose()
      } catch (error) {
        form.setError("root", {
          message: gerErrorMessage(
            error,
            isEditing ? "Failed to update user" : "Failed to create user"
          )
        })
      }
    },
    [form, isEditing, onClose, queryClient, user]
  )

  const isPending = form.formState.isSubmitting

  const requestSubmitWithBlur = useCallback(() => {
    const active = document.activeElement
    if (active instanceof HTMLElement) {
      active.blur()
    }
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        void form.handleSubmit(onSubmit)()
      })
    })
  }, [form, onSubmit])

  useEffect(() => {
    form.reset(defaultValues)
  }, [defaultValues, form])

  return (
    <form
      className="flex min-w-0 max-w-full flex-col gap-6 overflow-x-hidden p-2"
      onSubmit={(e) => {
        e.preventDefault()
        requestSubmitWithBlur()
      }}
      noValidate
    >
      <FormError form={form} />

      <Controller
        control={form.control}
        name="email"
        render={({ field, fieldState }) => (
          <TextField
            isInvalid={fieldState.invalid}
            isDisabled={isPending}
            name={field.name}
            onBlur={field.onBlur}
            onChange={field.onChange}
            value={field.value}
            ref={field.ref}
            type="email"
          >
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="Enter email address"
              aria-label="Email"
            />
            <FieldError>{fieldState.error?.message}</FieldError>
          </TextField>
        )}
      />

      <Controller
        control={form.control}
        name="name"
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
            <Label>Full name</Label>
            <Input placeholder="Enter full name" aria-label="Name" />
            <FieldError>{fieldState.error?.message}</FieldError>
          </TextField>
        )}
      />

      {!isEditing && (
        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <TextField
              isInvalid={fieldState.invalid}
              isDisabled={isPending}
              name={field.name}
              onBlur={field.onBlur}
              onChange={field.onChange}
              value={field.value ?? ""}
              ref={field.ref}
            >
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="Enter password"
                aria-label="Password"
              />
              <FieldError>{fieldState.error?.message}</FieldError>
            </TextField>
          )}
        />
      )}

      <div
        className={cn(
          "mt-6 flex min-w-0 flex-wrap justify-end gap-3 border-t border-divider",
          "bg-overlay px-4 py-4 sm:px-5"
        )}
      >
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
          ) : isEditing ? (
            "Update User"
          ) : (
            "Create User"
          )}
        </Button>
      </div>
    </form>
  )
}
