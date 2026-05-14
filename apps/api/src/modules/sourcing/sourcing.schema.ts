import { relations } from 'drizzle-orm';
import {
	boolean,
	integer,
	pgTable,
	text,
	timestamp,
	unique,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core';
import { products } from '../catalog/catalog.schema';
import { users, workspaces } from '../iam/iam.schema';
import { purchaseOrders } from '../order/order.schema';

export const rfqs = pgTable('rfqs', {
	id: uuid('id').primaryKey().defaultRandom(),
	buyerWorkspaceId: uuid('buyer_workspace_id')
		.notNull()
		.references(() => workspaces.id),
	parentRfqId: uuid('parent_rfq_id'),
	supplierWorkspaceId: uuid('supplier_workspace_id').references(
		() => workspaces.id,
	),
	createdBy: uuid('created_by')
		.notNull()
		.references(() => users.id),
	status: varchar('status', { length: 30 }).notNull().default('draft'),
	note: text('note'),
	isLocked: boolean('is_locked').notNull().default(false),
	submittedAt: timestamp('submitted_at', { withTimezone: true }),
	createdAt: timestamp('created_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const rfqItems = pgTable(
	'rfq_items',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		rfqId: uuid('rfq_id')
			.notNull()
			.references(() => rfqs.id),
		productId: uuid('product_id')
			.notNull()
			.references(() => products.id),
		supplierWorkspaceId: uuid('supplier_workspace_id')
			.notNull()
			.references(() => workspaces.id),
		quantity: integer('quantity').notNull(),
		targetPrice: integer('target_price'),
		deliveryDate: timestamp('delivery_date', { withTimezone: true }),
		deliveryLocation: text('delivery_location'),
		notes: text('notes'),
	},
	(table) => ({
		uniqueRfqProduct: unique('uq_rfq_items_rfq_product').on(
			table.rfqId,
			table.productId,
		),
	}),
);

export const quotations = pgTable('quotations', {
	id: uuid('id').primaryKey().defaultRandom(),
	rfqId: uuid('rfq_id')
		.notNull()
		.references(() => rfqs.id),
	supplierWorkspaceId: uuid('supplier_workspace_id')
		.notNull()
		.references(() => workspaces.id),
	respondedBy: uuid('responded_by')
		.notNull()
		.references(() => users.id),
	status: varchar('status', { length: 20 }).notNull().default('draft'),
	totalPrice: integer('total_price').notNull(),
	unitPrice: integer('unit_price'),
	estimatedDeliveryDate: timestamp('estimated_delivery_date', {
		withTimezone: true,
	}),
	deliveryTerms: text('delivery_terms'),
	note: text('note'),
	isLocked: boolean('is_locked').notNull().default(false),
	submittedAt: timestamp('submitted_at', { withTimezone: true }),
	createdAt: timestamp('created_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const quotationItems = pgTable('quotation_items', {
	id: uuid('id').primaryKey().defaultRandom(),
	quotationId: uuid('quotation_id')
		.notNull()
		.references(() => quotations.id),
	rfqItemId: uuid('rfq_item_id')
		.notNull()
		.references(() => rfqItems.id),
	unitPrice: integer('unit_price').notNull(),
	quantity: integer('quantity').notNull(),
});

// Append-only audit table for price negotiation rounds (UC30, BR-206).
// A database trigger blocks UPDATE/DELETE - service code must never issue them.
export const negotiationRounds = pgTable('negotiation_rounds', {
	id: uuid('id').primaryKey().defaultRandom(),
	quotationId: uuid('quotation_id')
		.notNull()
		.references(() => quotations.id),
	role: varchar('role', { length: 10 }).notNull(),
	proposedPrice: integer('proposed_price').notNull(),
	proposedDeliveryDays: integer('proposed_delivery_days').notNull(),
	note: text('note'),
	isAccepted: boolean('is_accepted').notNull().default(false),
	submittedBy: uuid('submitted_by')
		.notNull()
		.references(() => users.id),
	submittedAt: timestamp('submitted_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const rfqsRelations = relations(rfqs, ({ one, many }) => ({
	buyerWorkspace: one(workspaces, {
		fields: [rfqs.buyerWorkspaceId],
		references: [workspaces.id],
		relationName: 'rfqBuyerWorkspace',
	}),
	supplierWorkspace: one(workspaces, {
		fields: [rfqs.supplierWorkspaceId],
		references: [workspaces.id],
		relationName: 'rfqSupplierWorkspace',
	}),
	parentRfq: one(rfqs, {
		fields: [rfqs.parentRfqId],
		references: [rfqs.id],
		relationName: 'rfqParent',
	}),
	childRfqs: many(rfqs, { relationName: 'rfqParent' }),
	createdByUser: one(users, {
		fields: [rfqs.createdBy],
		references: [users.id],
	}),
	items: many(rfqItems),
	quotations: many(quotations),
}));

export const rfqItemsRelations = relations(rfqItems, ({ one }) => ({
	rfq: one(rfqs, {
		fields: [rfqItems.rfqId],
		references: [rfqs.id],
	}),
	product: one(products, {
		fields: [rfqItems.productId],
		references: [products.id],
	}),
	supplierWorkspace: one(workspaces, {
		fields: [rfqItems.supplierWorkspaceId],
		references: [workspaces.id],
	}),
}));

export const quotationsRelations = relations(quotations, ({ one, many }) => ({
	rfq: one(rfqs, {
		fields: [quotations.rfqId],
		references: [rfqs.id],
	}),
	supplierWorkspace: one(workspaces, {
		fields: [quotations.supplierWorkspaceId],
		references: [workspaces.id],
	}),
	respondedByUser: one(users, {
		fields: [quotations.respondedBy],
		references: [users.id],
	}),
	items: many(quotationItems),
	negotiationRounds: many(negotiationRounds),
	purchaseOrder: one(purchaseOrders, {
		fields: [quotations.id],
		references: [purchaseOrders.quotationId],
	}),
}));

export const quotationItemsRelations = relations(quotationItems, ({ one }) => ({
	quotation: one(quotations, {
		fields: [quotationItems.quotationId],
		references: [quotations.id],
	}),
	rfqItem: one(rfqItems, {
		fields: [quotationItems.rfqItemId],
		references: [rfqItems.id],
	}),
}));

export const negotiationRoundsRelations = relations(
	negotiationRounds,
	({ one }) => ({
		quotation: one(quotations, {
			fields: [negotiationRounds.quotationId],
			references: [quotations.id],
		}),
		submittedByUser: one(users, {
			fields: [negotiationRounds.submittedBy],
			references: [users.id],
		}),
	}),
);
