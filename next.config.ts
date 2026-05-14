import type { NextConfig } from "next"

function supabaseStorageRemotePattern():
  | {
      protocol: "https"
      hostname: string
      pathname: string
    }
  | undefined {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!raw) return undefined
  try {
    const { hostname } = new URL(raw)
    if (!hostname) return undefined
    return {
      protocol: "https",
      hostname,
      pathname: "/storage/v1/object/**"
    }
  } catch {
    return undefined
  }
}

const supabaseStorage = supabaseStorageRemotePattern()

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos"
      },
      ...(supabaseStorage ? [supabaseStorage] : [])
    ]
  }
}

export default nextConfig
