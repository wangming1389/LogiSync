import { relations } from 'drizzle-orm';
import {
	jsonb,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core';
import { users } from '../../modules/iam/iam.schema';

export const auditLogs = pgTable('audit_logs', {
	id: uuid('id').primaryKey().defaultRandom(),
	actorId: uuid('actor_id').notNull(),
	workspaceId: uuid('workspace_id').notNull(),
	action: varchar('action', { length: 255 }).notNull(),
	resourceType: varchar('resource_type', { length: 100 }).notNull(),
	resourceId: uuid('resource_id'),
	changes: jsonb('changes'),
	ipAddress: varchar('ip_address', { length: 45 }).notNull(),
	userAgent: text('user_agent'),
	status: varchar('status', { length: 50 }).notNull(),
	errorMessage: text('error_message'),
	timestamp: timestamp('timestamp', { withTimezone: true, precision: 6 })
		.notNull()
		.defaultNow(),
});

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
	actor: one(users, {
		fields: [auditLogs.actorId],
		references: [users.id],
	}),
}));
