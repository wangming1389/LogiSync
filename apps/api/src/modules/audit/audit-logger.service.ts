import { Injectable, Logger } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { getDatabase, schema } from "../../database";

export interface AuditLogPayload {
  actorId: string;
  workspaceId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  changes?: Record<string, any>;
  ipAddress: string;
  userAgent?: string;
  status: "success" | "failure";
  errorMessage?: string;
}

@Injectable()
export class AuditLoggerService {
  private readonly logger = new Logger(AuditLoggerService.name);

  async log(payload: AuditLogPayload): Promise<void> {
    try {
      const db = getDatabase();

      await db.insert(schema.auditLogs).values({
        id: uuid(),
        actorId: payload.actorId,
        workspaceId: payload.workspaceId,
        action: payload.action,
        resourceType: payload.resourceType,
        resourceId: payload.resourceId,
        changes: payload.changes,
        ipAddress: payload.ipAddress,
        userAgent: payload.userAgent,
        status: payload.status,
        errorMessage: payload.errorMessage,
      });
    } catch (error) {
      this.logger.error(
        "Audit log failed",
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  async getWorkspaceLogs(
    workspaceId: string,
    limit: number = 100,
    offset: number = 0,
  ) {
    const db = getDatabase();

    return db
      .select()
      .from(schema.auditLogs)
      .where(eq(schema.auditLogs.workspaceId, workspaceId))
      .orderBy((t) => t.timestamp)
      .limit(limit)
      .offset(offset);
  }

  async getUserLogs(
    actorId: string,
    workspaceId: string,
    limit: number = 100,
    offset: number = 0,
  ) {
    const db = getDatabase();

    return db
      .select()
      .from(schema.auditLogs)
      .where(
        and(
          eq(schema.auditLogs.actorId, actorId),
          eq(schema.auditLogs.workspaceId, workspaceId),
        ),
      )
      .orderBy((t) => t.timestamp)
      .limit(limit)
      .offset(offset);
  }
}
