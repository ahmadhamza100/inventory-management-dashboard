"use client"

import { useForm, Controller, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Input, NumberInput } from "@heroui/react"
import { type ProductSchema, productSchema } from "@/validations/product"
import { useProductModalStore } from "@/stores/use-product-modal-store"
import { useIsUploadingImage } from "@/mutations/use-upload-image"
import { ProductImageInput } from "./product-image-input"

export function ProductsForm({
  initialValues
}: {
  initialValues?: ProductSchema
}) {
  const onClose = useProductModalStore((state) => state.onClose)
  const isUploading = useIsUploadingImage()

  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: initialValues ?? {
      name: "",
      price: undefined,
      stock: undefined,
      image: null
    }
  })

  const onSubmit = form.handleSubmit((data) => {
    console.log("Form data:", data)
    onClose()
  })

  const handleCancel = () => {
    form.reset()
    onClose()
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} className="flex flex-col gap-6">
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
                errorMessage={fieldState.error?.message}
                classNames={{ inputWrapper: "shadow-none" }}
                startContent={
                  <span className="text-small text-default-400">PKR</span>
                }
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
            onPress={handleCancel}
            isDisabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            color="primary"
            isLoading={form.formState.isSubmitting}
            isDisabled={isUploading}
          >
            Create Product
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
