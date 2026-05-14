"use client"

import { useEffect, useMemo, useCallback } from "react"
import { api } from "@/utils/api"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import {
  Button,
  TextField,
  Input,
  NumberField,
  FieldError,
  Spinner,
  toast,
  cn
} from "@heroui/react"
import { useProductModalStore } from "@/stores/use-product-modal-store"
import { useIsUploadingImage } from "@/mutations/use-upload-image"
import { gerErrorMessage } from "@/utils/error-handler"
import { FormError } from "@/components/form-error"
import { ProductImageInput } from "./product-image-input"
import { FORMAT_CURRENCY_OPTS } from "@/utils/helpers"
import { type ProductSchema, productSchema } from "@/validations/product"
import {
  useForm,
  Controller,
  FormProvider,
  type DefaultValues
} from "react-hook-form"

export function ProductsForm() {
  const onClose = useProductModalStore((state) => state.onClose)
  const product = useProductModalStore((state) => state.product)
  const isUploading = useIsUploadingImage()
  const queryClient = useQueryClient()

  const isEditing = !!product

  const defaultValues: DefaultValues<ProductSchema> = useMemo(() => {
    return {
      name: product?.name ?? "",
      price:
        product?.price != null && !Number.isNaN(Number(product.price))
          ? Number(product.price)
          : undefined,
      stock: product?.stock ?? undefined,
      images: product?.images ?? undefined
    }
  }, [product])

  const form = useForm<ProductSchema>({
    resolver: zodResolver(productSchema),
    defaultValues
  })

  const onSubmit = useCallback(
    async (values: ProductSchema) => {
      try {
        if (isEditing) {
          await api.products[":id"].$patch({
            json: values,
            param: { id: product?.id }
          })
          toast.success("Product updated successfully")
        } else {
          await api.products.$post({ json: values })
          toast.success("Product created successfully")
        }

        queryClient.invalidateQueries({ queryKey: ["products"] })
        onClose()
      } catch (error) {
        form.setError("root", {
          message: gerErrorMessage(
            error,
            isEditing ? "Failed to update product" : "Failed to create product"
          )
        })
      }
    },
    [form, isEditing, onClose, product, queryClient]
  )

  const isPending = form.formState.isSubmitting

  /** Mobile Safari often skips committing the focused field before synthetic press paths; blur first. */
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
    <FormProvider {...form}>
      <form
        className="flex min-w-0 max-w-full flex-col gap-6 overflow-x-hidden"
        onSubmit={(e) => {
          e.preventDefault()
          requestSubmitWithBlur()
        }}
        noValidate
      >
        <FormError form={form} />

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
              <Input placeholder="Enter product name" aria-label="Product name" />
              <FieldError>{fieldState.error?.message}</FieldError>
            </TextField>
          )}
        />

        <div className="grid min-w-0 grid-cols-1 items-start gap-4 md:grid-cols-2">
          <Controller
            control={form.control}
            name="price"
            render={({ field, fieldState }) => (
              <NumberField
                fullWidth
                isInvalid={fieldState.invalid}
                isDisabled={isPending}
                minValue={0}
                step={0.01}
                formatOptions={FORMAT_CURRENCY_OPTS}
                name={field.name}
                onBlur={field.onBlur}
                value={field.value}
                onChange={(v) => field.onChange(v)}
                aria-label="Price"
              >
                <NumberField.Group>
                  <NumberField.DecrementButton />
                  <NumberField.Input placeholder="0.00" />
                  <NumberField.IncrementButton />
                </NumberField.Group>
                <FieldError>{fieldState.error?.message}</FieldError>
              </NumberField>
            )}
          />

          <Controller
            control={form.control}
            name="stock"
            render={({ field, fieldState }) => (
              <NumberField
                fullWidth
                isInvalid={fieldState.invalid}
                isDisabled={isPending}
                minValue={0}
                step={1}
                name={field.name}
                onBlur={field.onBlur}
                value={field.value}
                onChange={(v) => field.onChange(v)}
                aria-label="Stock"
              >
                <NumberField.Group>
                  <NumberField.DecrementButton />
                  <NumberField.Input placeholder="100" />
                  <NumberField.IncrementButton />
                </NumberField.Group>
                <FieldError>{fieldState.error?.message}</FieldError>
              </NumberField>
            )}
          />
        </div>

        <ProductImageInput />

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
            isDisabled={isUploading || isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isDisabled={isUploading || isPending}
          >
            {isPending ? (
              <Spinner size="sm" color="current" />
            ) : isEditing ? (
              "Update Product"
            ) : (
              "Create Product"
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
