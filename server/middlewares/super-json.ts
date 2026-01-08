import { SuperJSON } from "superjson"
import { createMiddleware } from "hono/factory"
import { type StatusCode } from "hono/utils/http-status"
import { TypedResponse } from "hono"

declare module "hono" {
  interface Context {
    $json: <T>(data: T, status?: number) => SuperJSONTypedResponse<T>
  }
}

type SuperJSONParsedType<T> = ReturnType<typeof SuperJSON.parse<T>>
export type SuperJSONTypedResponse<
  T,
  U extends StatusCode = StatusCode
> = TypedResponse<SuperJSONParsedType<T>, U, "json">

export const superJsonMiddleware = createMiddleware((c, next) => {
  type JSONRespond = typeof c.json

  c.$json = (<T>(data: T, status?: StatusCode): Response => {
    const serialized = SuperJSON.stringify(data)
    return new Response(serialized, {
      status: status || 200,
      headers: { "Content-Type": "application/superjson" }
    })
  }) as JSONRespond

  return next()
})
