import { Hono } from "hono"
import { productsRouter } from "@api/routers/products.router"
import { customersRouter } from "@api/routers/customers.router"
import { invoicesRouter } from "@api/routers/invoices.router"
import { analyticsRouter } from "@api/routers/analytics.router"
import { transactionsRouter } from "@api/routers/transactions.router"
import { usersRouter } from "@api/routers/users.router"
import { superJsonMiddleware } from "@api/middlewares/super-json"
import { authMiddleware } from "@api/middlewares/auth"
import { HTTPException } from "hono/http-exception"

const app = new Hono()
  .basePath("/api")
  .use(superJsonMiddleware)
  .use(authMiddleware)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const routes = app
  .route("/products", productsRouter)
  .route("/customers", customersRouter)
  .route("/invoices", invoicesRouter)
  .route("/analytics", analyticsRouter)
  .route("/transactions", transactionsRouter)
  .route("/users", usersRouter)

app.onError((err, c) => {
  console.error("[API Error]", c.req.method, c.req.path, err)

  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status)
  }

  return c.json({ error: "Internal server error" }, 500)
})

type ApiType = typeof routes

export { app, type ApiType }
