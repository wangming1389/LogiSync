import { Injectable, Logger } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { v4 as uuid } from 'uuid';
import { getDatabase, schema } from '../../database';
import * as schemaTypes from '../../database/schema';

// Type cho Drizzle transaction
export type DrizzleTransaction = NodePgDatabase<typeof schemaTypes>;

export interface AuditLogPayload {
	actorId: string;
	workspaceId: string;
	action: string;
	resourceType: string;
	resourceId?: string;
	changes?: Record<string, unknown>;
	ipAddress: string;
	userAgent?: string;
	status: 'success' | 'failure';
	errorMessage?: string;
}

@Injectable()
export class AuditLoggerService {
	private readonly logger = new Logger(AuditLoggerService.name);

	// Dùng NGOÀI transaction — không throw nếu fail (fire-and-forget)
	async log(payload: AuditLogPayload): Promise<void> {
		try {
			const db = getDatabase();
			await db.insert(schema.auditLogs).values({
				id: uuid(),
				...payload,
			});
		} catch (error) {
			this.logger.error(
				'Audit log failed',
				error instanceof Error ? error.stack : String(error),
			);
		}
	}

	// Dùng TRONG transaction — throw nếu fail → rollback toàn bộ business transaction
	async logInTx(
		tx: DrizzleTransaction,
		payload: AuditLogPayload,
	): Promise<void> {
		await tx.insert(schema.auditLogs).values({
			id: uuid(),
			...payload,
		});
		// Không có try/catch — lỗi sẽ bubble up → transaction rollback
	}

	async getWorkspaceLogs(workspaceId: string, limit = 100, offset = 0) {
		const db = getDatabase();
		return db
			.select()
			.from(schema.auditLogs)
			.where(eq(schema.auditLogs.workspaceId, workspaceId))
			.orderBy(schema.auditLogs.timestamp)
			.limit(limit)
			.offset(offset);
	}

	async getUserLogs(
		actorId: string,
		workspaceId: string,
		limit = 100,
		offset = 0,
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
			.orderBy(schema.auditLogs.timestamp)
			.limit(limit)
			.offset(offset);
	}
}
