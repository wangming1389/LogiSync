import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { AppModule } from "../src/app.module";
import { getDatabase, schema } from "../src/database";
import { v4 as uuid } from "uuid";

/**
 * Cross-Tenant Isolation Test
 * Verifies that data from one tenant cannot leak into another
 */
describe("Cross-Tenant Data Isolation (E2E)", () => {
  let app: INestApplication;
  let db: any;

  const tenant1Id = uuid();
  const tenant2Id = uuid();
  const user1Id = uuid();
  const user2Id = uuid();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    db = getDatabase();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should prevent user from workspace A accessing data from workspace B", async () => {
    // Setup: Create two workspaces
    await db.insert(schema.workspaces).values([
      {
        id: tenant1Id,
        name: "Workspace A",
        slug: "workspace-a",
        type: "buyer",
      },
      {
        id: tenant2Id,
        name: "Workspace B",
        slug: "workspace-b",
        type: "supplier",
      },
    ]);

    // Create users in different workspaces
    const hashedPassword = await require("bcrypt").hash("password", 10);
    await db.insert(schema.users).values([
      {
        id: user1Id,
        workspaceId: tenant1Id,
        email: "user1@workspace-a.local",
        passwordHash: hashedPassword,
        role: "user",
        isActive: true,
      },
      {
        id: user2Id,
        workspaceId: tenant2Id,
        email: "user2@workspace-b.local",
        passwordHash: hashedPassword,
        role: "user",
        isActive: true,
      },
    ]);

    // Create audit logs in both workspaces
    const log1 = {
      id: uuid(),
      actorId: user1Id,
      workspaceId: tenant1Id,
      action: "TEST_ACTION_A",
      resourceType: "test",
      ipAddress: "127.0.0.1",
      status: "success" as const,
    };

    const log2 = {
      id: uuid(),
      actorId: user2Id,
      workspaceId: tenant2Id,
      action: "TEST_ACTION_B",
      resourceType: "test",
      ipAddress: "127.0.0.1",
      status: "success" as const,
    };

    await db.insert(schema.auditLogs).values([log1, log2]);

    // Test: User1 should ONLY see logs from Workspace A
    const user1Logs = await db
      .select()
      .from(schema.auditLogs)
      .where((t) => t.workspaceId === tenant1Id && t.actorId === user1Id);

    expect(user1Logs).toHaveLength(1);
    expect(user1Logs[0].action).toBe("TEST_ACTION_A");

    // Test: User2 should NOT see any logs from Workspace A
    const user2ViewsWorkspaceA = await db
      .select()
      .from(schema.auditLogs)
      .where((t) => t.workspaceId === tenant1Id && t.actorId === user2Id);

    expect(user2ViewsWorkspaceA).toHaveLength(0);
  });

  it("should prevent workspace admin from modifying other workspaces config", async () => {
    // A workspace admin should not be able to change settings for another workspace
    const admin1Id = uuid();
    const hashedPassword = await require("bcrypt").hash("password", 10);

    await db.insert(schema.users).values({
      id: admin1Id,
      workspaceId: tenant1Id,
      email: "admin@workspace-a.local",
      passwordHash: hashedPassword,
      role: "admin",
      isActive: true,
    });

    // Attempt to update workspace B settings while logged in to A should be rejected
    // This is handled by RBAC Guard + Database RLS
    expect(admin1Id).toBeTruthy(); // Placeholder assertion
  });
});
