"use client"

import { useEffect, useMemo, useCallback } from "react"
import { api } from "@/utils/api"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import {
  Button,
  TextField,
  NumberField,
  Label,
  Input,
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
import { productsQueryKey, type ProductListItem } from "@/queries/use-products-query"
import { type ProductSchema, productSchema } from "@/validations/product"
import { upsertProductInList } from "@/utils/query-updaters"
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
          const response = await api.products[":id"].$patch({
            json: values,
            param: { id: product?.id }
          })
          const updatedProduct = (await response.json()) as unknown as ProductListItem
          queryClient.setQueryData(productsQueryKey, (current?: ProductListItem[]) =>
            upsertProductInList(current, updatedProduct)
          )
          toast.success("Product updated successfully")
        } else {
          const response = await api.products.$post({ json: values })
          const createdProduct = (await response.json()) as unknown as ProductListItem
          queryClient.setQueryData(productsQueryKey, (current?: ProductListItem[]) =>
            upsertProductInList(current, createdProduct)
          )
          toast.success("Product created successfully")
        }

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
              <Label>Product name</Label>
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
                minValue={0.01}
                step={0.01}
                formatOptions={FORMAT_CURRENCY_OPTS}
                name={field.name}
                onBlur={field.onBlur}
                value={field.value}
                onChange={(value) =>
                  field.onChange(value != null ? Number(value) : undefined)
                }
                aria-label="Price"
              >
                <Label>Price</Label>
                <NumberField.Group>
                  <NumberField.DecrementButton />
                  <NumberField.Input
                    placeholder={new Intl.NumberFormat(
                      "en-US",
                      FORMAT_CURRENCY_OPTS
                    ).format(0.01)}
                  />
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
                onChange={(value) =>
                  field.onChange(value != null ? Number(value) : undefined)
                }
                aria-label="Stock"
              >
                <Label>Stock</Label>
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
            "mt-6 flex min-w-0 flex-col-reverse gap-3 border-t border-divider sm:flex-row sm:flex-wrap sm:justify-end",
            "bg-overlay px-4 py-4 sm:px-5"
          )}
        >
          <Button
            type="button"
            variant="secondary"
            onPress={onClose}
            isDisabled={isUploading || isPending}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isDisabled={isUploading || isPending}
            className="w-full sm:w-auto"
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
