import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

const connectionString = process.env.DATABASE_URL!

declare global {
  // eslint-disable-next-line no-var
  var __pgClient: postgres.Sql | undefined
}

// Singleton: reuse connection across HMR reloads in dev, and across imports in prod
const client =
  globalThis.__pgClient ??
  postgres(connectionString, {
    prepare: false,     // required for Supabase transaction pooler
    max: 3,             // Supabase free tier has a 10-connection limit; keep low
    idle_timeout: 30,   // hold open for 30s between requests
    connect_timeout: 10,
  })

if (process.env.NODE_ENV !== "production") {
  globalThis.__pgClient = client
}

export const db = drizzle(client, { schema })
