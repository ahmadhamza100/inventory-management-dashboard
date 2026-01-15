import { defineConfig } from "drizzle-kit"
import { env } from "@/env.config"

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
