import { useIsMutating, useMutation } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"
import { env } from "@/env.config"

const UPLOAD_IMAGE_MUTATION_KEY = ["upload-image"]

export function useUploadImage() {
  const { mutateAsync, isPending, ...mutation } = useMutation({
    mutationKey: UPLOAD_IMAGE_MUTATION_KEY,
    mutationFn: async (file: File): Promise<string> => {
      const supabase = createClient()
      const ext = file.name.split(".").pop() ?? "jpg"
      const path = `${Date.now()}-${crypto.randomUUID()}.${ext}`

      const { error } = await supabase.storage
        .from(env.NEXT_PUBLIC_SUPABASE_BUCKET)
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false
        })

      if (error) throw error

      const {
        data: { publicUrl }
      } = supabase.storage
        .from(env.NEXT_PUBLIC_SUPABASE_BUCKET)
        .getPublicUrl(path)

      return publicUrl
    }
  })

  return { uploadImage: mutateAsync, isUploading: isPending, ...mutation }
}

export function useIsUploadingImage() {
  return useIsMutating({ mutationKey: UPLOAD_IMAGE_MUTATION_KEY }) > 0
}
