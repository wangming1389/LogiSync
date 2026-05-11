import { relations } from 'drizzle-orm';
import {
	boolean,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core';
import { supplierCategories } from '../catalog/catalog.schema';
import { users } from '../iam/iam.schema';

export const catalogCategories = pgTable('catalog_categories', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: varchar('name', { length: 255 }).notNull().unique(),
	code: varchar('code', { length: 100 }).notNull().unique(),
	description: text('description'),
	isActive: boolean('is_active').default(true),
	disabledAt: timestamp('disabled_at', { withTimezone: true }),
	createdBy: uuid('created_by')
		.notNull()
		.references(() => users.id),
	createdAt: timestamp('created_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const unitsOfMeasure = pgTable('units_of_measure', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: varchar('name', { length: 100 }).notNull().unique(),
	code: varchar('code', { length: 20 }).notNull().unique(),
	isActive: boolean('is_active').default(true),
	createdAt: timestamp('created_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const catalogCategoriesRelations = relations(
	catalogCategories,
	({ one, many }) => ({
		createdByUser: one(users, {
			fields: [catalogCategories.createdBy],
			references: [users.id],
		}),
		supplierCategories: many(supplierCategories),
	}),
);
