import { createAdminClient } from "./admin"
import { env } from "@/env.config"

/**
 * Parses public image URLs to extract their storage paths.
 * URLs look like: https://[project-id].supabase.co/storage/v1/object/public/[bucket]/[path]
 */
function extractStoragePaths(urls: string[]): string[] {
  const bucketUrl = `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${env.NEXT_PUBLIC_SUPABASE_BUCKET}/`

  return urls
    .map((url) => {
      if (url.startsWith(bucketUrl)) {
        return url.replace(bucketUrl, "")
      }
      return null
    })
    .filter((path): path is string => path !== null)
}

/**
 * Deletes a list of images from the Supabase bucket using the admin client.
 * Does not throw errors, fails silently and logs to console instead.
 */
export async function deleteImagesFromStorage(urls: string[]) {
  if (!urls || urls.length === 0) return

  const paths = extractStoragePaths(urls)

  if (paths.length === 0) return

  try {
    const supabaseAdmin = createAdminClient()
    const { error } = await supabaseAdmin.storage
      .from(env.NEXT_PUBLIC_SUPABASE_BUCKET)
      .remove(paths)

    if (error) {
      console.error(
        "[Storage Cleanup] Failed to delete images from storage:",
        error
      )
    } else {
      console.log(`[Storage Cleanup] Deleted ${paths.length} images from storage`)
    }
  } catch (error) {
    console.error("[Storage Cleanup] Unexpected error deleting images:", error)
  }
}
