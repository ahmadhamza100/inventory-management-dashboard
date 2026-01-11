"use client"

import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input, Button, Card, CardHeader, CardBody } from "@heroui/react"
import { addToast } from "@heroui/react"
import { FormError } from "@/components/form-error"
import { updateNameSchema, type UpdateNameSchema } from "@/validations/auth"
import { createClient } from "@/utils/supabase/client"
import { useQueryClient } from "@tanstack/react-query"

interface UpdateNameFormProps {
  initialName: string
}

export function UpdateNameForm({ initialName }: UpdateNameFormProps) {
  const supabase = createClient()
  const queryClient = useQueryClient()

  const form = useForm<UpdateNameSchema>({
    resolver: zodResolver(updateNameSchema),
    defaultValues: {
      name: initialName
    }
  })

  useEffect(() => {
    form.reset({ name: initialName })
  }, [initialName, form])

  const onSubmit = form.handleSubmit(async (data) => {
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: data.name
      }
    })

    if (error) {
      form.setError("root", { message: error.message })
    } else {
      queryClient.invalidateQueries({ queryKey: ["current-user"] })
      addToast({
        title: "Name updated successfully",
        color: "success"
      })
      form.reset({ name: data.name }, { keepDirty: false })
    }
  })

  const isSubmitting = form.formState.isSubmitting
  const isDirty = form.formState.isDirty

  return (
    <Card>
      <CardHeader className="flex flex-col items-start gap-1">
        <h3 className="text-lg font-semibold">Update Name</h3>
        <p className="text-sm text-default-500">
          Change your display name shown across the application
        </p>
      </CardHeader>
      <CardBody>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <FormError form={form} />

          <Controller
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <Input
                {...field}
                label="Name"
                placeholder="Enter your name"
                labelPlacement="outside"
                isDisabled={isSubmitting}
                isInvalid={fieldState.invalid}
                errorMessage={fieldState.error?.message}
              />
            )}
          />

          <div className="flex justify-end">
            <Button
              type="submit"
              color="primary"
              isLoading={isSubmitting}
              isDisabled={!isDirty || isSubmitting}
            >
              Update Name
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  )
}
