import { useIsMutating, useMutation } from "@tanstack/react-query"

const UPLOAD_IMAGE_MUTATION_KEY = ["upload-image"]

export function useUploadImage() {
  const { mutateAsync, isPending, ...mutation } = useMutation({
    mutationKey: UPLOAD_IMAGE_MUTATION_KEY,
    mutationFn: async (file: File): Promise<string> => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return URL.createObjectURL(file)
    }
  })

  return { uploadImage: mutateAsync, isUploading: isPending, ...mutation }
}

export function useIsUploadingImage() {
  return useIsMutating({ mutationKey: UPLOAD_IMAGE_MUTATION_KEY }) > 0
}
