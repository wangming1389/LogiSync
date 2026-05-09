/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument */
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import path from "path";

async function runMigrations(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const pool = new Pool({ connectionString });

  const db = drizzle(pool);

  // Run migrations from drizzle folder
  await migrate(db, {
    migrationsFolder: path.join(__dirname, "../drizzle/migrations"),
  });

  console.log("✅ Migrations completed");

  await pool.end();
  process.exit(0);
}

runMigrations().catch((err: Error) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
