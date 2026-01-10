"use client"

import { useState } from "react"
import { Button } from "@heroui/react"
import { IconCopy, IconCheck } from "@tabler/icons-react"

type CopyButtonProps = {
  text: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function CopyButton({ text, size = "sm", className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Button
      isIconOnly
      variant="light"
      size={size}
      className={className}
      onPress={handleCopy}
    >
      {copied ? (
        <IconCheck size={14} className="text-success" />
      ) : (
        <IconCopy size={14} />
      )}
    </Button>
  )
}
