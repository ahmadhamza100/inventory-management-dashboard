"use client"

import Image from "next/image"
import { useState, useCallback, useEffect } from "react"
import { useFormContext, Controller } from "react-hook-form"
import { useDropzone } from "react-dropzone"
import { Button, cn, Spinner } from "@heroui/react"
import {
  IconX,
  IconPhoto,
  IconUpload,
  IconGripVertical
} from "@tabler/icons-react"
import { useUploadImage } from "@/mutations/use-upload-image"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { ProductSchema } from "@/validations/product"

interface ImageItem {
  id: string
  url: string
  isUploading: boolean
  localPreview?: string
}

function SortableImageCard({
  item,
  onRemove,
  disabled
}: {
  item: ImageItem
  onRemove: (id: string) => void
  disabled: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id, disabled: item.isUploading || disabled })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative aspect-square overflow-hidden rounded-xl border border-default-200 bg-default-50",
        "transition-shadow",
        isDragging && "z-50 shadow-xl ring-2 ring-primary/40",
        item.isUploading && "animate-pulse"
      )}
    >
      <Image
        src={item.localPreview ?? item.url}
        alt="Product image"
        fill
        className="object-cover"
        unoptimized
      />

      {item.isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
          <Spinner size="md" color="white" />
        </div>
      )}

      {!item.isUploading && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      )}

      {!item.isUploading && !disabled && (
        <>
          <button
            type="button"
            className={cn(
              "absolute top-1.5 left-1.5 flex h-7 w-7 items-center justify-center rounded-lg",
              "bg-black/50 text-white/80 opacity-0 backdrop-blur-sm",
              "cursor-grab transition-all hover:bg-black/70 hover:text-white",
              "group-hover:opacity-100 active:cursor-grabbing"
            )}
            {...attributes}
            {...listeners}
          >
            <IconGripVertical size={14} />
          </button>

          <Button
            type="button"
            isIconOnly
            size="sm"
            variant="solid"
            onPress={() => onRemove(item.id)}
            aria-label="Remove image"
            className={cn(
              "absolute top-1.5 right-1.5 h-7 w-7 min-w-0",
              "bg-black/50 text-white/80 opacity-0 backdrop-blur-sm",
              "transition-all hover:bg-danger hover:text-white",
              "group-hover:opacity-100"
            )}
          >
            <IconX size={14} />
          </Button>
        </>
      )}
    </div>
  )
}

export function ProductImageInput() {
  const form = useFormContext<ProductSchema>()
  const { uploadImage } = useUploadImage()
  const [items, setItems] = useState<ImageItem[]>([])

  const imagesValue = form.watch("images")
  const imagesError = form.formState.errors.images?.message

  // Sync form value → local state on mount / reset
  useEffect(() => {
    if (!imagesValue) return
    setItems((prev) => {
      // Keep uploading items, sync completed ones from form value
      const uploadingItems = prev.filter((item) => item.isUploading)
      const completedUrls = new Set(
        prev.filter((p) => !p.isUploading).map((p) => p.url)
      )
      const formUrls = new Set(imagesValue)

      // If they're the same, no update needed
      const prevCompletedUrls = [...completedUrls]
      const formUrlsArr = [...formUrls]
      if (
        prevCompletedUrls.length === formUrlsArr.length &&
        prevCompletedUrls.every((u, i) => u === formUrlsArr[i]) &&
        uploadingItems.length === 0
      ) {
        // Only rebuild if different
        if (prev.length === imagesValue.length && prev.every((p) => !p.isUploading)) {
          return prev
        }
      }

      const formItems: ImageItem[] = imagesValue.map((url) => ({
        id: url,
        url,
        isUploading: false
      }))

      return [...formItems, ...uploadingItems]
    })
  }, [imagesValue])

  const syncToForm = useCallback(
    (newItems: ImageItem[]) => {
      const urls = newItems
        .filter((item) => !item.isUploading)
        .map((item) => item.url)
      form.setValue("images", urls, { shouldValidate: true })
    },
    [form]
  )

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newItems: ImageItem[] = acceptedFiles.map((file) => {
        const localPreview = URL.createObjectURL(file)
        const tempId = `uploading-${Date.now()}-${Math.random()}`
        return {
          id: tempId,
          url: "",
          isUploading: true,
          localPreview
        }
      })

      setItems((prev) => [...prev, ...newItems])

      // Upload all files concurrently
      try {
        const uploadPromises = acceptedFiles.map((file) => uploadImage(file))
        const uploadedUrls = await Promise.all(uploadPromises)

        setItems((prev) => {
          // Replace all temp items with completed urls
          const updatedItems = prev.map((item) => {
            const index = newItems.findIndex((t) => t.id === item.id)
            if (index !== -1 && uploadedUrls[index]) {
              return {
                ...item,
                id: uploadedUrls[index],
                url: uploadedUrls[index],
                isUploading: false
              }
            }
            return item
          })

          // Sync completed URLs to form OUTSIDE the setState updater using the finalized array
          const urls = updatedItems
            .filter((item) => !item.isUploading)
            .map((item) => item.url)

          // setTimeout ensures react-hook-form receives the absolute latest set all at once
          setTimeout(() => {
            form.setValue("images", urls, { shouldValidate: true })
          }, 0)

          return updatedItems
        })
      } catch (error) {
        console.error("Upload failed in batch:", error)
        // If batch fails, we remove all new items
        setItems((prev) => {
          const updated = prev.filter(
            (item) => !newItems.some((t) => t.id === item.id)
          )
          // Also clear previews
          newItems.forEach((tempItem) => {
            if (tempItem.localPreview) {
              URL.revokeObjectURL(tempItem.localPreview)
            }
          })
          return updated
        })
      }
    },
    [uploadImage, form]
  )

  const isPending = form.formState.isSubmitting
  const hasUploadingItems = items.some((item) => item.isUploading)

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
    multiple: true,
    maxSize: 10 * 1024 * 1024,
    disabled: hasUploadingItems || isPending
  })

  const isDragActive = _isDragActive && !isDragReject

  const removeImage = useCallback(
    (id: string) => {
      setItems((prev) => {
        const item = prev.find((i) => i.id === id)
        if (item?.localPreview) {
          URL.revokeObjectURL(item.localPreview)
        }
        const updated = prev.filter((i) => i.id !== id)
        syncToForm(updated)
        return updated
      })
    },
    [syncToForm]
  )

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      setItems((prev) => {
        const oldIndex = prev.findIndex((item) => item.id === active.id)
        const newIndex = prev.findIndex((item) => item.id === over.id)
        const reordered = arrayMove(prev, oldIndex, newIndex)
        syncToForm(reordered)
        return reordered
      })
    },
    [syncToForm]
  )

  // Cleanup local previews on unmount
  useEffect(() => {
    return () => {
      items.forEach((item) => {
        if (item.localPreview) {
          URL.revokeObjectURL(item.localPreview)
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items])

  return (
    <Controller
      control={form.control}
      name="images"
      render={() => (
        <div
          className={cn("flex flex-col gap-3", {
            "pointer-events-none opacity-50": isPending
          })}
        >
          <label
            htmlFor="product-images"
            className="text-sm font-medium text-foreground"
          >
            Product Images{" "}
            <span className="text-default-400">(Optional)</span>
          </label>

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={cn(
              "group relative flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-divider py-6 transition-all",
              "hover:border-primary/50 hover:bg-primary/5",
              items.length > 0 ? "py-4" : "py-8",
              { "border-primary bg-primary/10": isDragActive },
              { "border-danger bg-danger/10": isDragReject || imagesError },
              {
                "cursor-not-allowed opacity-50":
                  hasUploadingItems || isPending
              }
            )}
          >
            <input {...getInputProps()} id="product-images" />

            <div
              className={cn(
                "flex items-center justify-center rounded-full transition-colors",
                items.length > 0 ? "h-10 w-10" : "h-14 w-14",
                "bg-default-100 text-default-400",
                "group-hover:bg-primary/15 group-hover:text-primary",
                { "bg-primary/15 text-primary": isDragActive },
                { "bg-danger/15 text-danger": isDragReject || imagesError }
              )}
            >
              {isDragActive && !isDragReject ? (
                <IconUpload
                  size={items.length > 0 ? 18 : 24}
                  className="animate-bounce"
                />
              ) : (
                <IconPhoto size={items.length > 0 ? 18 : 24} />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">
                {isDragActive
                  ? "Drop images here"
                  : isDragReject
                    ? "File type not supported"
                    : items.length > 0
                      ? "Add more images"
                      : "Click to upload or drag and drop"}
              </p>
              <p className="mt-1 text-xs text-default-500">
                PNG, JPG or WEBP (max. 10MB each)
              </p>
            </div>
          </div>

          {/* Image Grid with Drag & Drop Reorder */}
          {items.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items.map((i) => i.id)}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                  {items.map((item, index) => (
                    <div key={item.id} className="relative">
                      <SortableImageCard
                        item={item}
                        onRemove={removeImage}
                        disabled={isPending}
                      />
                      {index === 0 && !item.isUploading && (
                        <span className="absolute bottom-1.5 left-1.5 rounded-md bg-primary/90 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                          Cover
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {imagesError && (
            <p className="text-sm text-danger">{imagesError}</p>
          )}
        </div>
      )}
    />
  )
}
