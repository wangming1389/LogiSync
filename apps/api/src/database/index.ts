import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

let db: ReturnType<typeof drizzle>;
let pool: Pool | undefined;

export function initializeDatabase(): ReturnType<typeof drizzle> {
  if (!db) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    db = drizzle(pool, { schema });
  }

  return db;
}

export function getDatabase() {
  if (!db) {
    throw new Error("Database not initialized");
  }
  return db;
}

export function getPool() {
  return pool;
}

export { schema };
