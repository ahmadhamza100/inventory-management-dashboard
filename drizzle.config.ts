import { env } from "@/env.config"
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  verbose: true,
  strict: true,
  dbCredentials: {
    url: env.DATABASE_URL
  }
})
