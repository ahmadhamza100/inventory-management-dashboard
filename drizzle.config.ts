import dotenv from "dotenv"
import { defineConfig } from "drizzle-kit"

dotenv.config({
  path: `.env.${process.env.NODE_ENV}`
})

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  verbose: true,
  strict: true,
  dbCredentials: {
    url: process.env.DATABASE_URL!
  }
})
