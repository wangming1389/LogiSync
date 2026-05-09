/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from "@nestjs/common";
// eslint-disable-next-line @typescript-eslint/no-require-imports
import bcrypt = require("bcryptjs");
import { getDatabase, schema } from "../../database";
import { eq, and } from "drizzle-orm";

const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const MAX_FAILED_ATTEMPTS = 5;

@Injectable()
export class SecurityService {
  async hashPassword(password: string): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    const hash = await bcrypt.hash(password, 10);
    return hash;
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
  }

  async recordFailedLogin(email: string): Promise<void> {
    const db = getDatabase();

    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email));

    if (!user) return;

    const newAttempts = (user.failedLoginAttempts ?? 0) + 1;

    const updates: { failedLoginAttempts: number; lockoutUntil?: Date } = {
      failedLoginAttempts: newAttempts,
    };

    // Lockout account if max attempts reached
    if (newAttempts >= MAX_FAILED_ATTEMPTS) {
      updates.lockoutUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
    }

    await db.update(schema.users).set(updates).where(eq(schema.users.id, user.id));
  }

  async recordSuccessfulLogin(userId: string): Promise<void> {
    const db = getDatabase();

    await db
      .update(schema.users)
      .set({
        failedLoginAttempts: 0,
        lockoutUntil: null,
        lastLoginAt: new Date(),
      })
      .where(eq(schema.users.id, userId));
  }

  async isAccountLocked(email: string): Promise<boolean> {
    const db = getDatabase();

    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email));

    if (!user) return false;

    // Check if lockout has expired
    if (user.lockoutUntil && user.lockoutUntil < new Date()) {
      // Unlock the account
      await db
        .update(schema.users)
        .set({
          lockoutUntil: null,
          failedLoginAttempts: 0,
        })
        .where(eq(schema.users.id, user.id));
      return false;
    }

    return !!(user.lockoutUntil && user.lockoutUntil > new Date());
  }

  async invalidateAllSessions(userId: string): Promise<void> {
    const db = getDatabase();

    // Find all active sessions
    const activeSessions = await db
      .select()
      .from(schema.sessionRegistry)
      .where(
        and(
          eq(schema.sessionRegistry.userId, userId),
          eq(schema.sessionRegistry.isActive, true),
        ),
      );

    // Revoke all sessions
    for (const session of activeSessions) {
      await db
        .update(schema.sessionRegistry)
        .set({
          isActive: false,
          revokedAt: new Date(),
        })
        .where(eq(schema.sessionRegistry.id, session.id));
    }
  }

  async hasPermission(
    userId: string,
    workspaceId: string,
    action: string,
  ): Promise<boolean> {
    const db = getDatabase();

    const [user] = await db
      .select()
      .from(schema.users)
      .where(and(eq(schema.users.id, userId), eq(schema.users.workspaceId, workspaceId)));

    if (!user || !user.isActive) {
      return false;
    }

    // Simple RBAC
    const rolePermissions: Record<string, string[]> = {
      admin: ["*"], // All permissions
      manager: ["read", "write", "manage_users"],
      user: ["read", "write"],
    };

    const permissions = rolePermissions[user.role] || [];
    return permissions.includes("*") || permissions.includes(action);
  }
}
