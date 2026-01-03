import Link from "next/link"
import { IconInnerShadowTop } from "@tabler/icons-react"
import { cn } from "@heroui/react"

type LogoProps = {
  href?: React.ComponentProps<typeof Link>["href"]
  className?: string
  showText?: boolean
}

export function Logo({ href = "/", className, showText = false }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn("flex w-fit items-center gap-2", className)}
    >
      <IconInnerShadowTop className="text-primary" size={24} />
      {showText && (
        <span className="text-lg font-semibold tracking-tight">Dashboard</span>
      )}
    </Link>
  )
}
