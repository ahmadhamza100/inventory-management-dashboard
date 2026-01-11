"use client"

import { useRef, useState } from "react"
import { Input, type InputProps } from "@heroui/react"
import { IconEyeFilled, IconEyeClosed } from "@tabler/icons-react"

export function PasswordInput(props: Omit<InputProps, "type" | "endContent">) {
  const [isVisible, setIsVisible] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function toggleVisibility() {
    const input = inputRef.current
    if (!input) {
      setIsVisible(!isVisible)
      return
    }

    const cursorPosition = input.selectionStart
    setIsVisible(!isVisible)

    requestAnimationFrame(() => {
      input.focus()
      if (cursorPosition !== null) {
        input.setSelectionRange(cursorPosition, cursorPosition)
      }
    })
  }

  return (
    <Input
      {...props}
      ref={inputRef}
      type={isVisible ? "text" : "password"}
      endContent={
        <button
          type="button"
          aria-pressed={isVisible}
          onClick={toggleVisibility}
          aria-label={isVisible ? "Hide password" : "Show password"}
          className="text-default-400 hover:text-foreground focus-visible:outline-solid"
        >
          {isVisible ? (
            <IconEyeClosed className="size-4.5" aria-hidden="true" />
          ) : (
            <IconEyeFilled className="size-4.5" aria-hidden="true" />
          )}
        </button>
      }
    />
  )
}
