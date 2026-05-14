"use client"

import { useState } from "react"
import { IconPhoto } from "@tabler/icons-react"
import { cn } from "@heroui/react"

function isLikelyImageUrl(value: string) {
  try {
    const u = new URL(value)
    return u.protocol === "http:" || u.protocol === "https:"
  } catch {
    return false
  }
}

type ProductThumbnailProps = {
  src?: string | null
  alt: string
  /** Outer frame: size + radius, e.g. `size-16 rounded-md` */
  boxClassName: string
}

/**
 * Product image from DB (Supabase, picsum, etc.). Uses {@link HTMLImageElement}
 * so URLs are not blocked by `next/image` remote patterns; falls back on error.
 */
export function ProductThumbnail({ src, alt, boxClassName }: ProductThumbnailProps) {
  const trimmed = src?.trim() ?? ""
  const usable = trimmed.length > 0 && isLikelyImageUrl(trimmed)
  const [failed, setFailed] = useState(false)

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden bg-default-100",
        boxClassName
      )}
    >
      {usable && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element -- arbitrary signed/public storage URLs
        <img
          src={trimmed}
          alt={alt}
          className="absolute inset-0 size-full object-cover"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <IconPhoto className="size-[55%] max-h-6 max-w-6 text-muted" aria-hidden />
      )}
    </div>
  )
}
