import { HTTPException } from "hono/http-exception"

export function gerErrorMessage(error: unknown, _defaultMessage?: string) {
  const defaultMessage = _defaultMessage || "Something went wrong"
  return error instanceof HTTPException && error.status !== 500
    ? error.message || defaultMessage
    : defaultMessage
}
