"use client"

import { useEffect, useMemo } from "react"
import { api } from "@/utils/api"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { Button, Input, addToast } from "@heroui/react"
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

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (isEditing) {
        await api.users[":id"].$patch({
          json: values as UpdateUserSchema,
          param: { id: user?.id }
        })
        addToast({
          title: "User updated successfully",
          color: "success"
        })
      } else {
        await api.users.$post({ json: values as CreateUserSchema })
        addToast({
          title: "User created successfully",
          color: "success"
        })
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
  })

  const isPending = form.formState.isSubmitting

  useEffect(() => {
    return () => {
      form.reset(defaultValues)
    }
  }, [form, defaultValues])

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <FormError form={form} />

      <Controller
        control={form.control}
        name="email"
        render={({ field, fieldState }) => (
          <Input
            {...field}
            type="email"
            value={field.value}
            onValueChange={field.onChange}
            label="Email"
            labelPlacement="outside"
            placeholder="Enter email address"
            isInvalid={fieldState.invalid}
            errorMessage={fieldState.error?.message}
            isDisabled={isPending}
          />
        )}
      />

      <Controller
        control={form.control}
        name="name"
        render={({ field, fieldState }) => (
          <Input
            {...field}
            type="text"
            value={field.value}
            onValueChange={field.onChange}
            label="Name"
            labelPlacement="outside"
            placeholder="Enter full name"
            isInvalid={fieldState.invalid}
            errorMessage={fieldState.error?.message}
            isDisabled={isPending}
          />
        )}
      />

      {!isEditing && (
        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <Input
              {...field}
              type="password"
              value={field.value || ""}
              onValueChange={field.onChange}
              label="Password"
              labelPlacement="outside"
              placeholder="Enter password"
              isInvalid={fieldState.invalid}
              errorMessage={fieldState.error?.message}
              isDisabled={isPending}
            />
          )}
        />
      )}

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
          {isEditing ? "Update User" : "Create User"}
        </Button>
      </div>
    </form>
  )
}
