import { getDatabase, schema, initializeDatabase } from "./index";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import { eq } from "drizzle-orm";

async function seed() {
  // Initialize database first
  initializeDatabase();

  const db = getDatabase();

  console.log("🌱 Seeding database...");

  // Check if default workspace already exists
  const existingWorkspace = await db
    .select()
    .from(schema.workspaces)
    .where(eq(schema.workspaces.slug, "default-workspace"));

  let workspaceId: string;

  if (existingWorkspace.length > 0) {
    console.log("ℹ️ Default workspace already exists, skipping...");
    workspaceId = existingWorkspace[0].id;
  } else {
    // Create default workspace
    workspaceId = uuid();
    await db.insert(schema.workspaces).values({
      id: workspaceId,
      name: "Default Workspace",
      slug: "default-workspace",
      type: "buyer",
      isActive: true,
    });
    console.log("✅ Default workspace created");
  }

  // Check if admin user already exists
  const existingAdmin = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, "admin@logisync.local"));

  if (existingAdmin.length > 0) {
    console.log("ℹ️ Admin user already exists, skipping...");
  } else {
    // Create default admin user
    const hashedPassword = await bcrypt.hash("admin@123456", 10);
    await db.insert(schema.users).values({
      id: uuid(),
      workspaceId,
      email: "admin@logisync.local",
      passwordHash: hashedPassword,
      firstName: "Admin",
      lastName: "User",
      role: "admin",
      isActive: true,
    });
    console.log("✅ Default admin user created (email: admin@logisync.local)");
  }

  console.log("✅ Database seeding completed");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
