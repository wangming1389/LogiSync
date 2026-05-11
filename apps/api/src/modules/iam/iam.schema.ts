import { relations } from 'drizzle-orm';
import {
	boolean,
	integer,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core';

import { auditLogs } from '../../core/audit/audit.schema';
import { sessionRegistry } from '../../core/session/session.schema';
import { products, supplierCategories } from '../catalog/catalog.schema';
import { rfqs } from '../sourcing/sourcing.schema';

export const workspaces = pgTable('workspaces', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: varchar('name', { length: 255 }).notNull(),
	slug: varchar('slug', { length: 255 }).notNull().unique(),
	type: varchar('type', { length: 50 }).notNull(),
	taxId: varchar('tax_id', { length: 20 }).notNull(),
	status: varchar('status', { length: 20 }).notNull().default('pending'),
	registeredIpAddress: varchar('registered_ip_address', {
		length: 45,
	}).notNull(),
	acceptedTermsVersion: varchar('accepted_terms_version', {
		length: 50,
	}).notNull(),
	rejectionReason: text('rejection_reason'),
	suspendedAt: timestamp('suspended_at', { withTimezone: true }),
	revokedAt: timestamp('revoked_at', { withTimezone: true }),
	isActive: boolean('is_active').default(true),
	createdAt: timestamp('created_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const users = pgTable('users', {
	id: uuid('id').primaryKey().defaultRandom(),
	workspaceId: uuid('workspace_id')
		.notNull()
		.references(() => workspaces.id),
	email: varchar('email', { length: 255 }).notNull().unique(),
	passwordHash: varchar('password_hash', { length: 255 }).notNull(),
	firstName: varchar('first_name', { length: 100 }),
	lastName: varchar('last_name', { length: 100 }),
	role: varchar('role', { length: 50 }).notNull(),
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

export const workspaceEnabledRoles = pgTable('workspace_enabled_roles', {
	id: uuid('id').primaryKey().defaultRandom(),
	workspaceId: uuid('workspace_id')
		.notNull()
		.references(() => workspaces.id),
	role: varchar('role', { length: 50 }).notNull(),
	enabledBy: uuid('enabled_by')
		.notNull()
		.references(() => users.id),
	enabledAt: timestamp('enabled_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const workspacesRelations = relations(workspaces, ({ many }) => ({
	users: many(users),
	enabledRoles: many(workspaceEnabledRoles),
	supplierCategories: many(supplierCategories),
	products: many(products),
	rfqs: many(rfqs),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
	workspace: one(workspaces, {
		fields: [users.workspaceId],
		references: [workspaces.id],
	}),
	auditLogs: many(auditLogs),
	sessions: many(sessionRegistry),
}));

export const workspaceEnabledRolesRelations = relations(
	workspaceEnabledRoles,
	({ one }) => ({
		workspace: one(workspaces, {
			fields: [workspaceEnabledRoles.workspaceId],
			references: [workspaces.id],
		}),
		enabledByUser: one(users, {
			fields: [workspaceEnabledRoles.enabledBy],
			references: [users.id],
		}),
	}),
);
