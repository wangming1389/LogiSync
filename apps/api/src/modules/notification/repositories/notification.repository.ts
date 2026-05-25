/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import { and, desc, eq, sql } from 'drizzle-orm';
import { ClsService } from 'nestjs-cls';
import { getActiveTransaction } from '../../../core/database/transaction-context';
import { getDatabase, schema } from '../../../infrastructure/database';

export interface NotificationListRow {
	id: string;
	title: string;
	content: string;
	type: string;
	referenceId: string | null;
	isRead: boolean;
	deliveredAt: Date;
	readAt: Date | null;
}

/**
 * NotificationRepository — cross-tenant data access for the
 * notification fan-out flow.
 *
 * Deliberately does NOT extend `BaseRepository` because:
 *   - Platform-admin notifications span workspaces.
 *   - Consumers run outside an HTTP request and may not have a
 *     `workspaceId` in CLS.
 * Queries always scope to the explicit `userId` argument and never
 * leak rows across users.
 */
@Injectable()
export class NotificationRepository {
	constructor(private readonly cls: ClsService) {}

	private get db() {
		return getActiveTransaction(this.cls) ?? getDatabase();
	}

	async createNotification(
		data: typeof schema.notifications.$inferInsert,
		tx?: any,
	): Promise<typeof schema.notifications.$inferSelect> {
		const runner = tx || this.db;
		const [row] = (await runner
			.insert(schema.notifications)
			.values(data)
			.returning()) as Array<typeof schema.notifications.$inferSelect>;
		return row;
	}

	async createUserNotifications(
		entries: Array<typeof schema.userNotifications.$inferInsert>,
		tx?: any,
	): Promise<Array<typeof schema.userNotifications.$inferSelect>> {
		if (entries.length === 0) {
			return [];
		}
		const runner = tx || this.db;
		return (await runner
			.insert(schema.userNotifications)
			.values(entries)
			.returning()) as Array<typeof schema.userNotifications.$inferSelect>;
	}

	async findAllPlatformAdmins(): Promise<
		Array<{
			id: string;
			email: string;
			firstName: string | null;
			lastName: string | null;
		}>
	> {
		const db = getDatabase();
		return db
			.select({
				id: schema.users.id,
				email: schema.users.email,
				firstName: schema.users.firstName,
				lastName: schema.users.lastName,
			})
			.from(schema.users)
			.innerJoin(schema.userRoles, eq(schema.userRoles.userId, schema.users.id))
			.where(
				and(
					eq(schema.userRoles.role, 'platform_admin'),
					eq(schema.users.isActive, true),
				),
			);
	}

	async findUserNotifications(
		userId: string,
		options: { page: number; limit: number; onlyUnread: boolean },
	): Promise<{ items: NotificationListRow[]; total: number }> {
		const db = getDatabase();
		const offset = (options.page - 1) * options.limit;

		const baseFilter = options.onlyUnread
			? and(
					eq(schema.userNotifications.userId, userId),
					eq(schema.userNotifications.isRead, false),
				)
			: eq(schema.userNotifications.userId, userId);

		const rows = await db
			.select({
				id: schema.notifications.id,
				title: schema.notifications.title,
				content: schema.notifications.content,
				type: schema.notifications.type,
				referenceId: schema.notifications.referenceId,
				isRead: schema.userNotifications.isRead,
				deliveredAt: schema.userNotifications.deliveredAt,
				readAt: schema.userNotifications.readAt,
			})
			.from(schema.userNotifications)
			.innerJoin(
				schema.notifications,
				eq(schema.userNotifications.notificationId, schema.notifications.id),
			)
			.where(baseFilter)
			.orderBy(desc(schema.userNotifications.deliveredAt))
			.limit(options.limit)
			.offset(offset);

		const [{ count }] = await db
			.select({ count: sql<number>`count(*)::int` })
			.from(schema.userNotifications)
			.where(baseFilter);

		return { items: rows, total: Number(count) };
	}

	async countUnread(userId: string): Promise<number> {
		const db = getDatabase();
		const [{ count }] = await db
			.select({ count: sql<number>`count(*)::int` })
			.from(schema.userNotifications)
			.where(
				and(
					eq(schema.userNotifications.userId, userId),
					eq(schema.userNotifications.isRead, false),
				),
			);
		return Number(count);
	}

	async markAsRead(userId: string, notificationId: string): Promise<boolean> {
		const db = getDatabase();
		const result = await db
			.update(schema.userNotifications)
			.set({ isRead: true, readAt: new Date() })
			.where(
				and(
					eq(schema.userNotifications.userId, userId),
					eq(schema.userNotifications.notificationId, notificationId),
					eq(schema.userNotifications.isRead, false),
				),
			)
			.returning({ id: schema.userNotifications.id });
		return result.length > 0;
	}

	async markAllAsRead(userId: string): Promise<number> {
		const db = getDatabase();
		const result = await db
			.update(schema.userNotifications)
			.set({ isRead: true, readAt: new Date() })
			.where(
				and(
					eq(schema.userNotifications.userId, userId),
					eq(schema.userNotifications.isRead, false),
				),
			)
			.returning({ id: schema.userNotifications.id });
		return result.length;
	}
}
