import { relations } from 'drizzle-orm';
import {
	boolean,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core';

// ==================== USERS ====================
export const users = pgTable('users', {
	id: uuid('id').primaryKey().defaultRandom(),
	workspaceId: uuid('workspace_id').notNull(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	passwordHash: varchar('password_hash', { length: 255 }).notNull(),
	firstName: varchar('first_name', { length: 100 }),
	lastName: varchar('last_name', { length: 100 }),
	role: varchar('role', { length: 50 }).notNull(), // 'admin', 'manager', 'user'
	isActive: boolean('is_active').default(true),
	lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
	lockoutUntil: timestamp('lockout_until', { withTimezone: true }),
	failedLoginAttempts: integer('failed_login_attempts').default(0),
	createdAt: timestamp('created_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
});

// ==================== WORKSPACES ====================
export const workspaces = pgTable('workspaces', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: varchar('name', { length: 255 }).notNull(),
	slug: varchar('slug', { length: 255 }).notNull().unique(),
	type: varchar('type', { length: 50 }).notNull(), // 'supplier', 'buyer', 'carrier'
	isActive: boolean('is_active').default(true),
	createdAt: timestamp('created_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
});

// ==================== AUDIT LOG (APPEND-ONLY) ====================
export const auditLogs = pgTable('audit_logs', {
	id: uuid('id').primaryKey().defaultRandom(),
	actorId: uuid('actor_id').notNull(), // User ID
	workspaceId: uuid('workspace_id').notNull(),
	action: varchar('action', { length: 255 }).notNull(), // e.g., 'USER_LOGIN', 'ORDER_CREATED'
	resourceType: varchar('resource_type', { length: 100 }).notNull(), // e.g., 'order', 'user'
	resourceId: uuid('resource_id'), // ID of affected resource
	changes: jsonb('changes'), // { before: {...}, after: {...} }
	ipAddress: varchar('ip_address', { length: 45 }).notNull(), // IPv4 or IPv6
	userAgent: text('user_agent'),
	status: varchar('status', { length: 50 }).notNull(), // 'success', 'failure'
	errorMessage: text('error_message'),
	timestamp: timestamp('timestamp', { withTimezone: true, precision: 6 })
		.notNull()
		.defaultNow(), // Microsecond precision
});

// ==================== SESSION REGISTRY (For Redis backup) ====================
export const sessionRegistry = pgTable('session_registry', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id').notNull(),
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

// ==================== RLS POLICIES ====================
export const rlsPolicies = pgTable('rls_policies', {
	id: uuid('id').primaryKey().defaultRandom(),
	workspaceId: uuid('workspace_id').notNull(),
	userId: uuid('user_id').notNull(),
	resourceType: varchar('resource_type', { length: 100 }).notNull(),
	allowedFields: jsonb('allowed_fields'), // Array of field names
	conditions: jsonb('conditions'), // WHERE clause conditions
	createdAt: timestamp('created_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
});

// ==================== RELATIONS ====================
export const usersRelations = relations(users, ({ many }) => ({
	auditLogs: many(auditLogs),
	sessions: many(sessionRegistry),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
	actor: one(users, {
		fields: [auditLogs.actorId],
		references: [users.id],
	}),
}));

export const sessionRegistryRelations = relations(
	sessionRegistry,
	({ one }) => ({
		user: one(users, {
			fields: [sessionRegistry.userId],
			references: [users.id],
		}),
	}),
);
