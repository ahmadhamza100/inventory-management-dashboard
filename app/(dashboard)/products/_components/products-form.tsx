"use client"

import { useEffect, useMemo } from "react"
import { api } from "@/utils/api"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { Button, Input, NumberInput, addToast } from "@heroui/react"
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
      price: Number(product?.price) ?? undefined,
      stock: product?.stock ?? undefined,
      image: product?.image ?? null
    }
  }, [product])

  const form = useForm<ProductSchema>({
    resolver: zodResolver(productSchema),
    defaultValues
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (isEditing) {
        await api.products[":id"].$patch({
          json: values,
          param: { id: product?.id }
        })
        addToast({
          title: "Product updated successfully",
          color: "success"
        })
      } else {
        await api.products.$post({ json: values })
        addToast({
          title: "Product created successfully",
          color: "success"
        })
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
  })

  const isPending = form.formState.isSubmitting

  useEffect(() => {
    return () => {
      form.reset(defaultValues)
    }
  }, [form, defaultValues])

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        <FormError form={form} />

        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <Input
              {...field}
              type="text"
              value={field.value}
              onValueChange={field.onChange}
              label="Product Name"
              labelPlacement="outside"
              placeholder="Enter product name"
              isInvalid={fieldState.invalid}
              errorMessage={fieldState.error?.message}
              isDisabled={isPending}
            />
          )}
        />

        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
          <Controller
            control={form.control}
            name="price"
            render={({ field, fieldState }) => (
              <NumberInput
                value={field.value}
                onValueChange={field.onChange}
                label="Price"
                labelPlacement="outside"
                placeholder="3,000"
                step={0.01}
                minValue={0}
                isInvalid={fieldState.invalid}
                isDisabled={isPending}
                errorMessage={fieldState.error?.message}
                classNames={{ inputWrapper: "shadow-none" }}
                formatOptions={FORMAT_CURRENCY_OPTS}
              />
            )}
          />

          <Controller
            control={form.control}
            name="stock"
            render={({ field, fieldState }) => (
              <NumberInput
                value={field.value}
                onValueChange={field.onChange}
                label="Stock"
                labelPlacement="outside"
                placeholder="100"
                step={1}
                minValue={0}
                isInvalid={fieldState.invalid}
                isDisabled={isPending}
                errorMessage={fieldState.error?.message}
                classNames={{ inputWrapper: "shadow-none" }}
              />
            )}
          />
        </div>

        <ProductImageInput />

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="flat"
            onPress={onClose}
            isDisabled={isUploading || isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            color="primary"
            isLoading={isPending}
            isDisabled={isUploading}
          >
            {isEditing ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
