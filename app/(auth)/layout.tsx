import { cn } from "@heroui/react"

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main
      className={cn(
        "flex min-h-svh items-center justify-center bg-background p-4",
        "text-foreground"
      )}
    >
      {children}
    </main>
  )
}
