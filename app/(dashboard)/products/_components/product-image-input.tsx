"use client"

import Image from "next/image"
import { useState, useCallback, useMemo, useEffect } from "react"
import { useFormContext, Controller } from "react-hook-form"
import { useDropzone } from "react-dropzone"
import { Button, cn, Spinner } from "@heroui/react"
import { IconX, IconPhoto, IconUpload } from "@tabler/icons-react"
import { useUploadImage } from "@/mutations/use-upload-image"
import type { ProductSchema } from "@/validations/product"

export function ProductImageInput() {
  const form = useFormContext<ProductSchema>()
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const { uploadImage, isUploading } = useUploadImage()

  const imageValue = form.watch("image")
  const imageError = form.formState.errors.image?.message

  const preview = useMemo(() => {
    if (localPreview) return localPreview
    if (imageValue && typeof imageValue === "string") return imageValue
    return null
  }, [localPreview, imageValue])

  useEffect(() => {
    return () => {
      if (localPreview) {
        URL.revokeObjectURL(localPreview)
      }
    }
  }, [localPreview])

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      const previewUrl = URL.createObjectURL(file)
      setLocalPreview(previewUrl)

      try {
        const imageUrl = await uploadImage(file)
        form.setValue("image", imageUrl, { shouldValidate: true })
      } catch (error) {
        console.error("Upload failed:", error)
        form.setError("image", { message: "Failed to upload image" })
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl)
        }
        setLocalPreview(null)
      }
    },
    [uploadImage, form]
  )

  const isPending = form.formState.isSubmitting

  const {
    getRootProps,
    getInputProps,
    isDragActive: _isDragActive,
    isDragReject
  } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"]
    },
    maxFiles: 1,
    multiple: false,
    maxSize: 10 * 1024 * 1024,
    disabled: isUploading || isPending
  })

  const isDragActive = _isDragActive && !isDragReject

  const removeImage = useCallback(() => {
    if (localPreview) {
      URL.revokeObjectURL(localPreview)
      setLocalPreview(null)
    }
    form.setValue("image", null, { shouldValidate: true })
  }, [localPreview, form])

  return (
    <Controller
      control={form.control}
      name="image"
      render={() => (
        <div className="flex flex-col gap-2">
          <label
            htmlFor="product-image"
            className="text-sm font-medium text-foreground"
          >
            Product Image <span className="text-default-400">(Optional)</span>
          </label>

          {preview ? (
            <div className="group relative">
              <div className="relative h-56 w-full overflow-hidden rounded-lg border border-default-200 bg-default-50">
                <Image
                  src={preview}
                  alt="Product preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-3">
                      <Spinner size="lg" color="primary" />
                      <span className="text-sm font-medium text-white">
                        Uploading image...
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <Button
                type="button"
                isIconOnly
                size="sm"
                variant="solid"
                color="danger"
                onPress={removeImage}
                isDisabled={isUploading || isPending}
                aria-label="Remove image"
                className="absolute top-3 right-3 opacity-0 shadow-lg transition-all group-hover:opacity-100"
              >
                <IconX size={18} />
              </Button>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={cn(
                "group relative flex h-56 w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-divider transition-all",
                "hover:border-primary/50 hover:bg-primary/5",
                { "border-primary bg-primary/10": isDragActive },
                { "border-danger bg-danger/10": isDragReject || imageError },
                { "cursor-not-allowed opacity-50": isUploading || isPending }
              )}
            >
              <input {...getInputProps()} id="product-image" />

              {isUploading || isPending ? (
                <div className="flex flex-col items-center gap-3">
                  <Spinner size="lg" color="primary" />
                  <span className="text-sm font-medium text-default-600">
                    Uploading...
                  </span>
                </div>
              ) : (
                <>
                  <div
                    className={cn(
                      "flex h-16 w-16 items-center justify-center rounded-full transition-colors",
                      "bg-default-100 text-default-400",
                      "group-hover:bg-primary/20 group-hover:text-primary",
                      { "bg-primary/20 text-primary": isDragActive },
                      { "bg-danger/20 text-danger": isDragReject || imageError }
                    )}
                  >
                    {isDragActive && !isDragReject ? (
                      <IconUpload size={28} className="animate-bounce" />
                    ) : (
                      <IconPhoto size={28} />
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">
                      {isDragActive
                        ? "Drop the image here"
                        : isDragReject
                          ? "File type not supported"
                          : "Click to upload or drag and drop"}
                    </p>
                    <p className="mt-1.5 text-xs text-default-500">
                      PNG, JPG or WEBP (max. 10MB)
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {imageError && <p className="text-sm text-danger">{imageError}</p>}
        </div>
      )}
    />
  )
}
