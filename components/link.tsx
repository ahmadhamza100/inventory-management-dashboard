import NextLink from "next/link"
import { cn, linkVariants } from "@heroui/react"

export function Link({
  href,
  className,
  ...props
}: React.ComponentProps<typeof NextLink>) {
  return (
    <NextLink
      href={href}
      className={cn(linkVariants(), className)}
      {...props}
    />
  )
}
