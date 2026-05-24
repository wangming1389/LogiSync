import { relations } from 'drizzle-orm';
import {
	boolean,
	index,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core';
import { users } from '../iam/iam.schema';

/**
 * notifications — Platform-wide notification template/payload.
 *
 * Cross-tenant by design: a platform admin may receive notifications
 * about any workspace, so this table intentionally has no
 * `workspaceId` column. Fan-out is done via `userNotifications`.
 */
export const notifications = pgTable('notifications', {
	id: uuid('id').primaryKey().defaultRandom(),
	title: varchar('title', { length: 255 }).notNull(),
	content: text('content').notNull(),
	type: varchar('type', { length: 50 }).notNull(),
	referenceId: uuid('reference_id'),
	createdAt: timestamp('created_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
});

/**
 * user_notifications — Per-recipient delivery row for a notification.
 *
 * One row per `(user, notification)` pair. `isRead` / `readAt` track
 * the user's read state in-app; `deliveredAt` marks when the row was
 * created by the consumer.
 */
export const userNotifications = pgTable(
	'user_notifications',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id),
		notificationId: uuid('notification_id')
			.notNull()
			.references(() => notifications.id),
		isRead: boolean('is_read').notNull().default(false),
		deliveredAt: timestamp('delivered_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
		readAt: timestamp('read_at', { withTimezone: true }),
	},
	(table) => ({
		userIdx: index('user_notifications_user_idx').on(table.userId),
		notificationIdx: index('user_notifications_notification_idx').on(
			table.notificationId,
		),
	}),
);

export const notificationsRelations = relations(notifications, ({ many }) => ({
	recipients: many(userNotifications),
}));

export const userNotificationsRelations = relations(
	userNotifications,
	({ one }) => ({
		user: one(users, {
			fields: [userNotifications.userId],
			references: [users.id],
		}),
		notification: one(notifications, {
			fields: [userNotifications.notificationId],
			references: [notifications.id],
		}),
	}),
);
