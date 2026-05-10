import { Injectable, Logger } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { v4 as uuid } from 'uuid';
import { getDatabase, schema } from '../../database';
import * as schemaTypes from '../../database/schema';

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

	// Logs an audit event to the database
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

	// Logs an audit event within an existing transaction
	async logInTx(
		tx: DrizzleTransaction,
		payload: AuditLogPayload,
	): Promise<void> {
		await tx.insert(schema.auditLogs).values({
			id: uuid(),
			...payload,
		});
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
