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

import { users, workspaces } from '../iam/iam.schema';
import { quotations } from '../sourcing/sourcing.schema';

export const purchaseOrders = pgTable('purchase_orders', {
	id: uuid('id').primaryKey().defaultRandom(),
	quotationId: uuid('quotation_id')
		.notNull()
		.unique()
		.references(() => quotations.id),
	buyerWorkspaceId: uuid('buyer_workspace_id')
		.notNull()
		.references(() => workspaces.id),
	supplierWorkspaceId: uuid('supplier_workspace_id')
		.notNull()
		.references(() => workspaces.id),
	status: varchar('status', { length: 30 })
		.notNull()
		.default('pending_approval'),
	assignedTo: uuid('assigned_to').references(() => users.id),
	totalPrice: integer('total_price').notNull(),
	// Snapshot columns (QAR-25, BR-212). Frozen at the moment of quotation selection so the PO
	finalUnitPrice: integer('final_unit_price'),
	finalPaymentTerms: text('final_payment_terms'),
	finalDeliveryDate: timestamp('final_delivery_date', { withTimezone: true }),
	isLocked: boolean('is_locked').notNull().default(true),
	rejectionReason: text('rejection_reason'),
	autoConfirmAt: timestamp('auto_confirm_at', { withTimezone: true }),
	approvedAt: timestamp('approved_at', { withTimezone: true }),
	createdAt: timestamp('created_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const goodsReceipts = pgTable('goods_receipts', {
	id: uuid('id').primaryKey().defaultRandom(),
	purchaseOrderId: uuid('purchase_order_id')
		.notNull()
		.unique()
		.references(() => purchaseOrders.id),
	confirmedBy: uuid('confirmed_by').references(() => users.id),
	confirmationType: varchar('confirmation_type', { length: 10 }).notNull(),
	isLocked: boolean('is_locked').notNull().default(false),
	note: text('note'),
	confirmedAt: timestamp('confirmed_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const orderStatusHistory = pgTable('order_status_history', {
	id: uuid('id').primaryKey().defaultRandom(),
	orderId: uuid('order_id')
		.notNull()
		.references(() => purchaseOrders.id),
	statusValue: varchar('status_value', { length: 30 }).notNull(),
	changedBy: uuid('changed_by').references(() => users.id),
	changedAt: timestamp('changed_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const orderAssignmentHistory = pgTable('order_assignment_history', {
	id: uuid('id').primaryKey().defaultRandom(),
	orderId: uuid('order_id')
		.notNull()
		.references(() => purchaseOrders.id),
	assignedTo: uuid('assigned_to')
		.notNull()
		.references(() => users.id),
	assignedBy: uuid('assigned_by')
		.notNull()
		.references(() => users.id),
	assignedAt: timestamp('assigned_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
	unassignedAt: timestamp('unassigned_at', { withTimezone: true }),
});

export const purchaseOrdersRelations = relations(
	purchaseOrders,
	({ one, many }) => ({
		quotation: one(quotations, {
			fields: [purchaseOrders.quotationId],
			references: [quotations.id],
		}),
		buyerWorkspace: one(workspaces, {
			fields: [purchaseOrders.buyerWorkspaceId],
			references: [workspaces.id],
		}),
		supplierWorkspace: one(workspaces, {
			fields: [purchaseOrders.supplierWorkspaceId],
			references: [workspaces.id],
		}),
		goodsReceipt: one(goodsReceipts, {
			fields: [purchaseOrders.id],
			references: [goodsReceipts.purchaseOrderId],
		}),
		assignee: one(users, {
			fields: [purchaseOrders.assignedTo],
			references: [users.id],
		}),
		statusHistory: many(orderStatusHistory),
		assignmentHistory: many(orderAssignmentHistory),
	}),
);

export const goodsReceiptsRelations = relations(goodsReceipts, ({ one }) => ({
	purchaseOrder: one(purchaseOrders, {
		fields: [goodsReceipts.purchaseOrderId],
		references: [purchaseOrders.id],
	}),
	confirmedByUser: one(users, {
		fields: [goodsReceipts.confirmedBy],
		references: [users.id],
	}),
}));

export const orderStatusHistoryRelations = relations(
	orderStatusHistory,
	({ one }) => ({
		purchaseOrder: one(purchaseOrders, {
			fields: [orderStatusHistory.orderId],
			references: [purchaseOrders.id],
		}),
		changedByUser: one(users, {
			fields: [orderStatusHistory.changedBy],
			references: [users.id],
		}),
	}),
);

export const orderAssignmentHistoryRelations = relations(
	orderAssignmentHistory,
	({ one }) => ({
		purchaseOrder: one(purchaseOrders, {
			fields: [orderAssignmentHistory.orderId],
			references: [purchaseOrders.id],
		}),
		assignedToUser: one(users, {
			fields: [orderAssignmentHistory.assignedTo],
			references: [users.id],
		}),
		assignedByUser: one(users, {
			fields: [orderAssignmentHistory.assignedBy],
			references: [users.id],
		}),
	}),
);
