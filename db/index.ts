import { env } from "@/env.config"
import { drizzle } from "drizzle-orm/postgres-js"

export const db = drizzle(env.DATABASE_URL)
