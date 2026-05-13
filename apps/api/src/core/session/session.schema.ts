import { relations } from 'drizzle-orm';
import {
	boolean,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core';
import { users } from '../../modules/iam/iam.schema';

export const sessionRegistry = pgTable('session_registry', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id),
	workspaceId: uuid('workspace_id').notNull(),
	sessionId: varchar('session_id', { length: 255 }).notNull().unique(),
	tokenHash: varchar('token_hash', { length: 255 }).notNull(),
	issuedAt: timestamp('issued_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
	ipAddress: varchar('ip_address', { length: 45 }).notNull(),
	userAgent: text('user_agent'),
	isActive: boolean('is_active').default(true),
	revokedAt: timestamp('revoked_at', { withTimezone: true }),
});

export const sessionRegistryRelations = relations(
	sessionRegistry,
	({ one }) => ({
		user: one(users, {
			fields: [sessionRegistry.userId],
			references: [users.id],
		}),
	}),
);
