import NextLink from "next/link"
import { Link as HeroLink } from "@heroui/react"

export function Link({
  href,
  ...props
}: Omit<React.ComponentProps<typeof HeroLink>, "as" | "href"> & {
  href: React.ComponentProps<typeof NextLink>["href"]
}) {
  return <HeroLink as={NextLink} href={href as string} {...props} />
}
