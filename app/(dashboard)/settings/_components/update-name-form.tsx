"use client"

import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Button,
  Card,
  CardHeader,
  TextField,
  Input,
  FieldError,
  Label,
  Spinner,
  toast
} from "@heroui/react"
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
      toast.success("Name updated successfully")
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
      <Card.Content>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <FormError form={form} />

          <Controller
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <TextField
                isInvalid={fieldState.invalid}
                isDisabled={isSubmitting}
                name={field.name}
                onBlur={field.onBlur}
                onChange={field.onChange}
                value={field.value}
                ref={field.ref}
              >
                <Label>Name</Label>
                <Input placeholder="Enter your name" aria-label="Name" />
                <FieldError>{fieldState.error?.message}</FieldError>
              </TextField>
            )}
          />

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              isDisabled={!isDirty || isSubmitting}
            >
              {isSubmitting ? (
                <Spinner size="sm" color="current" />
              ) : (
                "Update Name"
              )}
            </Button>
          </div>
        </form>
      </Card.Content>
    </Card>
  )
}
