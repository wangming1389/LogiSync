import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { and, count, desc, eq, gte, lt, lte, type SQL } from 'drizzle-orm';
import type { Response } from 'express';
import {
	buildPaginationMeta,
	normalizePagePagination,
} from '../../../common/utils/pagination.utils';
import {
	getReadReplicaDatabase,
	schema,
} from '../../../infrastructure/database';
import type { AuditLogQuery } from '../dtos/audit-log-query.dto';
import { AuditAction, AuditStatus } from '../enums/audit.enums';
import { AuditLoggerService } from './audit-logger.service';

const MASK = '********';
const EXPORT_CHUNK_SIZE = 500;
const SENSITIVE_KEY_PATTERN =
	/(password|passcode|token|secret|credential|authorization|cookie|session|jwt|apiKey|privateKey|refreshToken|accessToken)/i;
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

interface NormalizedAuditLogQuery
	extends Omit<AuditLogQuery, 'from' | 'to' | 'page' | 'limit'> {
	from?: Date;
	to?: Date;
	toIsExclusive: boolean;
	page: number;
	limit: number;
}

@Injectable()
export class AuditLogQueryService {
	constructor(private readonly auditLoggerService: AuditLoggerService) {}

	async findAll(
		query: AuditLogQuery,
		actor: { sub: string; workspaceId: string },
		ipAddress: string,
		userAgent?: string,
	) {
		const normalized = this.normalizeQuery(query);
		const db = getReadReplicaDatabase();
		const filters = this.buildFilters(normalized);
		const where = filters.length > 0 ? and(...filters) : undefined;
		const pagination = normalizePagePagination(normalized, {
			defaultLimit: normalized.limit,
			maxLimit: 25,
		});

		const [items, totalResult] = await this.withReplicaErrorMessage(() =>
			Promise.all([
				db
					.select()
					.from(schema.auditLogs)
					.where(where)
					.orderBy(desc(schema.auditLogs.timestamp))
					.limit(pagination.limit)
					.offset(pagination.offset),
				db.select({ total: count() }).from(schema.auditLogs).where(where),
			]),
		);

		await this.auditLoggerService.log({
			actorId: actor.sub,
			workspaceId: actor.workspaceId,
			action: AuditAction.AUDIT_LOG_QUERY,
			resourceType: 'audit_log',
			changes: {
				query: this.toAuditQueryChanges(normalized),
				resultCount: items.length,
			},
			ipAddress,
			userAgent,
			status: AuditStatus.SUCCESS,
		});

		const total = totalResult[0]?.total ?? 0;

		return {
			items: items.map((item) => ({
				...item,
				changes: this.maskChanges(item.changes),
			})),
			meta: buildPaginationMeta(pagination, total),
		};
	}

	async streamCsv(
		query: AuditLogQuery,
		actor: { sub: string; workspaceId: string },
		ipAddress: string,
		userAgent: string | undefined,
		response: Response,
	): Promise<void> {
		const normalized = this.normalizeQuery({ ...query, page: 1, limit: 25 });
		const db = getReadReplicaDatabase();
		const filters = this.buildFilters(normalized);
		const where = filters.length > 0 ? and(...filters) : undefined;

		response.setHeader('Content-Type', 'text/csv; charset=utf-8');
		response.setHeader(
			'Content-Disposition',
			`attachment; filename="audit-logs-${new Date()
				.toISOString()
				.replace(/[:.]/g, '-')}.csv"`,
		);
		response.write(
			[
				'id',
				'actorId',
				'workspaceId',
				'action',
				'resourceType',
				'resourceId',
				'changes',
				'ipAddress',
				'userAgent',
				'status',
				'errorMessage',
				'timestamp',
			].join(',') + '\n',
		);

		let offset = 0;
		let exportedCount = 0;
		while (true) {
			const rows = await this.withReplicaErrorMessage(() =>
				db
					.select()
					.from(schema.auditLogs)
					.where(where)
					.orderBy(desc(schema.auditLogs.timestamp))
					.limit(EXPORT_CHUNK_SIZE)
					.offset(offset),
			);

			if (rows.length === 0) break;

			for (const row of rows) {
				exportedCount += 1;
				response.write(this.toCsvRow(row));
			}

			offset += EXPORT_CHUNK_SIZE;
		}

		await this.auditLoggerService.log({
			actorId: actor.sub,
			workspaceId: actor.workspaceId,
			action: AuditAction.LOG_EXPORT,
			resourceType: 'audit_log',
			changes: {
				query: this.toAuditQueryChanges(normalized),
				exportedCount,
			},
			ipAddress,
			userAgent,
			status: AuditStatus.SUCCESS,
		});

		response.end();
	}

	private normalizeQuery(query: AuditLogQuery): NormalizedAuditLogQuery {
		const toBoundary = this.parseToBoundary(query.to);
		return {
			...query,
			from: query.from ? new Date(query.from) : undefined,
			to: toBoundary.date,
			toIsExclusive: toBoundary.isExclusive,
			page: Math.max(1, Number(query.page ?? 1)),
			limit: Math.min(25, Math.max(1, Number(query.limit ?? 25))),
		};
	}

	private buildFilters(query: NormalizedAuditLogQuery): SQL[] {
		const filters: SQL[] = [];
		if (query.actorId)
			filters.push(eq(schema.auditLogs.actorId, query.actorId));
		if (query.workspaceId) {
			filters.push(eq(schema.auditLogs.workspaceId, query.workspaceId));
		}
		if (query.action) filters.push(eq(schema.auditLogs.action, query.action));
		if (query.from) filters.push(gte(schema.auditLogs.timestamp, query.from));
		if (query.to) {
			filters.push(
				query.toIsExclusive
					? lt(schema.auditLogs.timestamp, query.to)
					: lte(schema.auditLogs.timestamp, query.to),
			);
		}
		return filters;
	}

	private parseToBoundary(value?: string): {
		date?: Date;
		isExclusive: boolean;
	} {
		if (!value) return { isExclusive: false };
		if (!DATE_ONLY_PATTERN.test(value)) {
			return { date: new Date(value), isExclusive: false };
		}

		const end = new Date(`${value}T00:00:00.000Z`);
		end.setUTCDate(end.getUTCDate() + 1);
		return { date: end, isExclusive: true };
	}

	private toAuditQueryChanges(query: NormalizedAuditLogQuery) {
		return {
			...query,
			from: query.from?.toISOString(),
			to: query.to?.toISOString(),
			toIsExclusive: query.toIsExclusive,
		};
	}

	private async withReplicaErrorMessage<T>(task: () => Promise<T>): Promise<T> {
		try {
			return await task();
		} catch (error) {
			const cause = (error as { cause?: { code?: string } }).cause;
			if (cause?.code === '42P01') {
				throw new ServiceUnavailableException(
					'Read replica is not ready or DATABASE_REPLICA_URL points to a database/schema without audit_logs.',
				);
			}
			throw error;
		}
	}

	private maskChanges(value: unknown): unknown {
		if (Array.isArray(value)) {
			return value.map((item) => this.maskChanges(item));
		}
		if (value && typeof value === 'object') {
			return Object.fromEntries(
				Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
					key,
					SENSITIVE_KEY_PATTERN.test(key) ? MASK : this.maskChanges(entry),
				]),
			);
		}
		return value;
	}

	private toCsvRow(row: typeof schema.auditLogs.$inferSelect): string {
		const maskedChanges = this.maskChanges(row.changes);
		return [
			row.id,
			row.actorId,
			row.workspaceId,
			row.action,
			row.resourceType,
			row.resourceId ?? '',
			JSON.stringify(maskedChanges ?? null),
			row.ipAddress,
			row.userAgent ?? '',
			row.status,
			row.errorMessage ?? '',
			row.timestamp.toISOString(),
		]
			.map((value) => this.csvCell(value))
			.join(',')
			.concat('\n');
	}

	private csvCell(value: unknown): string {
		if (value == null) {
			return '""';
		}
		const text = typeof value === 'string' ? value : JSON.stringify(value);
		return `"${text.replace(/"/g, '""')}"`;
	}
}
