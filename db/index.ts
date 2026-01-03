import { env } from "@/env.config"
import { drizzle } from "drizzle-orm/node-postgres"

export const db = drizzle(env.DATABASE_URL)
