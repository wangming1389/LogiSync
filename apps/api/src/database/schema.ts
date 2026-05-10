import { relations } from 'drizzle-orm';
import {
	boolean,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	unique,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core';

// ==================== WORKSPACES ====================
export const workspaces = pgTable('workspaces', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: varchar('name', { length: 255 }).notNull(),
	slug: varchar('slug', { length: 255 }).notNull().unique(),
	type: varchar('type', { length: 50 }).notNull(),
	// "supplier" | "buyer" | "carrier" | "platform"
	taxId: varchar('tax_id', { length: 20 }).notNull(),
	status: varchar('status', { length: 20 }).notNull().default('pending'),
	// "pending" | "active" | "suspended" | "revoked"
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

// ==================== USERS ====================
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
	// "platform_admin" | "company_admin" | "supplier_manager" | "supplier_staff"
	// "supplier_accountant" | "buyer_manager" | "buyer_staff"
	// "carrier_dispatcher" | "driver" | "hr_manager"
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

// ==================== WORKSPACE ENABLED ROLES ====================
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

// ==================== AUDIT LOG (APPEND-ONLY) ====================
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
	// "success" | "failure"
	errorMessage: text('error_message'),
	timestamp: timestamp('timestamp', { withTimezone: true, precision: 6 })
		.notNull()
		.defaultNow(),
});

// ==================== SESSION REGISTRY ====================
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

// ==================== MASTER DATA: CATALOG CATEGORIES ====================
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

// ==================== MASTER DATA: UNITS OF MEASURE ====================
export const unitsOfMeasure = pgTable('units_of_measure', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: varchar('name', { length: 100 }).notNull().unique(),
	code: varchar('code', { length: 20 }).notNull().unique(),
	isActive: boolean('is_active').default(true),
	createdAt: timestamp('created_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
});

// ==================== SUPPLIER CATEGORIES ====================
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

// ==================== PRODUCTS ====================
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
		// "draft" | "active" | "inactive"
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
	}),
);

// ==================== PRODUCT PRICE HISTORY ====================
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

// ==================== RFQ ====================
export const rfqs = pgTable('rfqs', {
	id: uuid('id').primaryKey().defaultRandom(),
	buyerWorkspaceId: uuid('buyer_workspace_id')
		.notNull()
		.references(() => workspaces.id),
	createdBy: uuid('created_by')
		.notNull()
		.references(() => users.id),
	status: varchar('status', { length: 30 }).notNull().default('draft'),
	// "draft" | "pending_response" | "responded" | "closed" | "cancelled"
	note: text('note'),
	submittedAt: timestamp('submitted_at', { withTimezone: true }),
	createdAt: timestamp('created_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
});

// ==================== RFQ ITEMS ====================
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

// ==================== QUOTATIONS ====================
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
	// "draft" | "submitted" | "selected" | "rejected"
	totalPrice: integer('total_price').notNull(),
	deliveryDays: integer('delivery_days').notNull(),
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

// ==================== QUOTATION ITEMS ====================
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

// ==================== PURCHASE ORDERS ====================
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
	// "pending_approval" | "approved" | "rejected" | "goods_received" | "completed"
	totalPrice: integer('total_price').notNull(),
	isLocked: boolean('is_locked').notNull().default(true),
	rejectionReason: text('rejection_reason'),
	autoConfirmAt: timestamp('auto_confirm_at', { withTimezone: true }),
	// Set = approvedAt + 48h khi supplier approve
	approvedAt: timestamp('approved_at', { withTimezone: true }),
	createdAt: timestamp('created_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
});

// ==================== GOODS RECEIPTS ====================
// Tách riêng để lưu vết: ai xác nhận, thủ công hay tự động
export const goodsReceipts = pgTable('goods_receipts', {
	id: uuid('id').primaryKey().defaultRandom(),
	purchaseOrderId: uuid('purchase_order_id')
		.notNull()
		.unique()
		// 1 PO chỉ có đúng 1 goods receipt
		.references(() => purchaseOrders.id),
	confirmedBy: uuid('confirmed_by').references(() => users.id),
	confirmationType: varchar('confirmation_type', { length: 10 }).notNull(),
	// "MANUAL" | "AUTO"
	isLocked: boolean('is_locked').notNull().default(false),
	note: text('note'),
	// Buyer có thể ghi chú khi confirm thủ công
	confirmedAt: timestamp('confirmed_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
});

// ==================== RELATIONS ====================

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

export const rfqsRelations = relations(rfqs, ({ one, many }) => ({
	buyerWorkspace: one(workspaces, {
		fields: [rfqs.buyerWorkspaceId],
		references: [workspaces.id],
	}),
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

export const purchaseOrdersRelations = relations(purchaseOrders, ({ one }) => ({
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
}));

export const goodsReceiptsRelations = relations(goodsReceipts, ({ one }) => ({
	purchaseOrder: one(purchaseOrders, {
		fields: [goodsReceipts.purchaseOrderId],
		references: [purchaseOrders.id],
	}),
	// Relation về user xác nhận (null nếu auto)
	confirmedByUser: one(users, {
		fields: [goodsReceipts.confirmedBy],
		references: [users.id],
	}),
}));
