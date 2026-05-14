import { relations } from 'drizzle-orm';
import {
	boolean,
	index,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	unique,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core';
import { users, workspaces } from '../iam/iam.schema';
import {
	catalogCategories,
	unitsOfMeasure,
} from '../master-data/master-data.schema';
import { rfqItems } from '../sourcing/sourcing.schema';

export const supplierCategories = pgTable(
	'supplier_categories',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		workspaceId: uuid('workspace_id')
			.notNull()
			.references(() => workspaces.id),
		catalogCategoryId: uuid('catalog_category_id')
			.notNull()
			.references(() => catalogCategories.id),
		name: varchar('name', { length: 255 }).notNull(),
		description: text('description'),
		isActive: boolean('is_active').default(true),
		createdBy: uuid('created_by')
			.notNull()
			.references(() => users.id),
		createdAt: timestamp('created_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => ({
		uniqueWorkspaceName: unique('uq_supplier_categories_workspace_name').on(
			table.workspaceId,
			table.name,
		),
	}),
);

export const products = pgTable(
	'products',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		workspaceId: uuid('workspace_id')
			.notNull()
			.references(() => workspaces.id),
		supplierCategoryId: uuid('supplier_category_id')
			.notNull()
			.references(() => supplierCategories.id),
		uomId: uuid('uom_id')
			.notNull()
			.references(() => unitsOfMeasure.id),
		sku: varchar('sku', { length: 100 }).notNull(),
		name: varchar('name', { length: 255 }).notNull(),
		description: text('description'),
		unitPrice: integer('unit_price').notNull(),
		minOrderQty: integer('min_order_qty').notNull().default(1),
		status: varchar('status', { length: 20 }).notNull().default('draft'),
		imageUrls: jsonb('image_urls'),
		attributes: jsonb('attributes'),
		createdBy: uuid('created_by')
			.notNull()
			.references(() => users.id),
		createdAt: timestamp('created_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => ({
		uniqueWorkspaceSku: unique('uq_products_workspace_sku').on(
			table.workspaceId,
			table.sku,
		),
		// Composite indexes backing the cross-tenant product search query (QAR-05)
		idxWorkspaceStatusName: index('idx_products_workspace_status_name').on(
			table.workspaceId,
			table.status,
			table.name,
		),
		idxWorkspaceStatusSku: index('idx_products_workspace_status_sku').on(
			table.workspaceId,
			table.status,
			table.sku,
		),
	}),
);

export const productPriceHistory = pgTable('product_price_history', {
	id: uuid('id').primaryKey().defaultRandom(),
	productId: uuid('product_id')
		.notNull()
		.references(() => products.id),
	unitPrice: integer('unit_price').notNull(),
	changedBy: uuid('changed_by')
		.notNull()
		.references(() => users.id),
	effectiveFrom: timestamp('effective_from', { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const supplierCategoriesRelations = relations(
	supplierCategories,
	({ one, many }) => ({
		workspace: one(workspaces, {
			fields: [supplierCategories.workspaceId],
			references: [workspaces.id],
		}),
		catalogCategory: one(catalogCategories, {
			fields: [supplierCategories.catalogCategoryId],
			references: [catalogCategories.id],
		}),
		createdByUser: one(users, {
			fields: [supplierCategories.createdBy],
			references: [users.id],
		}),
		products: many(products),
	}),
);

export const productsRelations = relations(products, ({ one, many }) => ({
	workspace: one(workspaces, {
		fields: [products.workspaceId],
		references: [workspaces.id],
	}),
	supplierCategory: one(supplierCategories, {
		fields: [products.supplierCategoryId],
		references: [supplierCategories.id],
	}),
	uom: one(unitsOfMeasure, {
		fields: [products.uomId],
		references: [unitsOfMeasure.id],
	}),
	createdByUser: one(users, {
		fields: [products.createdBy],
		references: [users.id],
	}),
	priceHistory: many(productPriceHistory),
	rfqItems: many(rfqItems),
}));

export const productPriceHistoryRelations = relations(
	productPriceHistory,
	({ one }) => ({
		product: one(products, {
			fields: [productPriceHistory.productId],
			references: [products.id],
		}),
		changedByUser: one(users, {
			fields: [productPriceHistory.changedBy],
			references: [users.id],
		}),
	}),
);
