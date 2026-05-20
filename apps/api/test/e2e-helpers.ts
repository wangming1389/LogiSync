import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import { ZodValidationPipe } from 'nestjs-zod';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { getDatabase, getPool, schema } from '../src/infrastructure/database';
import { UserRole } from '../src/modules/iam/auth/enums/user-role.enum';

const PASSWORD = 'Password1!';

let seq = 0;

export function unique(prefix: string) {
	seq += 1;
	const randomStr = randomUUID().substring(0, 6); // Bốc thêm 6 ký tự ngẫu nhiên mã hóa cứng
	return `${prefix}-${Date.now()}-${seq}-${randomStr}`;
}

export async function createE2eApp() {
	const moduleFixture = await Test.createTestingModule({
		imports: [AppModule],
	}).compile();

	const app = moduleFixture.createNestApplication();
	app.useGlobalPipes(new ZodValidationPipe());
	await app.init();
	return app;
}

export function db() {
	return getDatabase();
}

export function pool() {
	const currentPool = getPool();
	if (!currentPool) throw new Error('Database pool is not initialized');
	return currentPool;
}

export async function createWorkspace(overrides: Record<string, unknown> = {}) {
	const suffix = unique('ws');
	const numericTaxId = `${Date.now()}${seq.toString().padStart(3, '0')}`.slice(
		0,
		13,
	);
	const [workspace] = await db()
		.insert(schema.workspaces)
		.values({
			name: `E2E Workspace ${suffix}`,
			slug: suffix,
			type: 'supplier',
			taxId: numericTaxId,
			status: 'active',
			registeredIpAddress: '127.0.0.1',
			acceptedTermsVersion: 'e2e',
			isActive: true,
			...overrides,
		})
		.returning();
	return workspace;
}

export async function createUser(
	workspaceId: string,
	role: UserRole | string,
	overrides: Record<string, unknown> = {},
) {
	const suffix = unique('user');
	const [user] = await db()
		.insert(schema.users)
		.values({
			workspaceId,
			email: `${suffix}@example.test`,
			passwordHash: await bcrypt.hash(PASSWORD, 12),
			firstName: 'E2E',
			lastName: 'User',
			role,
			isActive: true,
			...overrides,
		})
		.returning();
	return user;
}

export async function createIdentity(
	role: UserRole | string,
	workspaceOverrides: Record<string, unknown> = {},
	userOverrides: Record<string, unknown> = {},
) {
	const workspace = await createWorkspace(workspaceOverrides);
	const user = await createUser(workspace.id, role, userOverrides);
	return { workspace, user, password: PASSWORD };
}

export async function createPlatformAdmin() {
	const existing = await db()
		.select()
		.from(schema.workspaces)
		.where(eq(schema.workspaces.slug, 'platform-admin'))
		.limit(1);
	const workspace =
		existing[0] ??
		(
			await db()
				.insert(schema.workspaces)
				.values({
					name: 'LogiSync Platform Admin',
					slug: 'platform-admin',
					type: 'platform',
					taxId: `${Date.now()}`.slice(0, 13),
					status: 'active',
					registeredIpAddress: '127.0.0.1',
					acceptedTermsVersion: 'e2e',
					isActive: true,
				})
				.returning()
		)[0];
	const user = await createUser(workspace.id, UserRole.PLATFORM_ADMIN);
	return { workspace, user, password: PASSWORD };
}

export async function login(
	app: INestApplication,
	email: string,
	password = PASSWORD,
) {
	const response = await request(app.getHttpServer())
		.post('/auth/login')
		.send({ email, password })
		.expect(200);

	return (response.body.data?.accessToken ??
		response.body.accessToken) as string;
}

export function bearer(token: string) {
	return { Authorization: `Bearer ${token}` };
}

export async function createCatalogFixture(
	createdBy: string,
	workspaceId: string,
) {
	const suffix = unique('catalog');
	const [category] = await db()
		.insert(schema.catalogCategories)
		.values({
			name: `E2E Category ${suffix}`,
			code: `CAT-${suffix}`.slice(0, 100),
			description: 'E2E category',
			createdBy,
		})
		.returning();

	const [uom] = await db()
		.insert(schema.unitsOfMeasure)
		.values({
			name: `E2E UOM ${suffix}`,
			code: `U${Date.now().toString(36)}${seq.toString(36)}`.slice(0, 20),
			createdBy,
		})
		.returning();

	const [supplierCategory] = await db()
		.insert(schema.supplierCategories)
		.values({
			workspaceId,
			catalogCategoryId: category.id,
			name: `E2E Supplier Category ${suffix}`,
			description: 'E2E supplier category',
			createdBy,
		})
		.returning();

	return { category, uom, supplierCategory };
}

export async function createProductFixture(params: {
	workspaceId: string;
	createdBy: string;
	name?: string;
	status?: string;
	unitPrice?: number;
}) {
	const catalog = await createCatalogFixture(
		params.createdBy,
		params.workspaceId,
	);
	const suffix = unique('product');
	const [product] = await db()
		.insert(schema.products)
		.values({
			workspaceId: params.workspaceId,
			supplierCategoryId: catalog.supplierCategory.id,
			uomId: catalog.uom.id,
			sku: `SKU-${suffix}`.slice(0, 100),
			name: params.name ?? `E2E Product ${suffix}`,
			description: 'E2E product',
			unitPrice: params.unitPrice ?? 1000,
			minOrderQty: 1,
			status: params.status ?? 'published',
			imageUrls: [],
			attributes: {},
			createdBy: params.createdBy,
		})
		.returning();

	return { ...catalog, product };
}

export async function createRfqQuotationFixture() {
	const buyer = await createIdentity(UserRole.BUYER_STAFF, { type: 'buyer' });
	const supplier = await createIdentity(UserRole.SUPPLIER_STAFF, {
		type: 'supplier',
	});
	const productFixture = await createProductFixture({
		workspaceId: supplier.workspace.id,
		createdBy: supplier.user.id,
		unitPrice: 1200,
	});

	const [parentRfq] = await db()
		.insert(schema.rfqs)
		.values({
			buyerWorkspaceId: buyer.workspace.id,
			createdBy: buyer.user.id,
			status: 'sent',
			note: 'E2E parent RFQ',
			isLocked: true,
			submittedAt: new Date(),
		})
		.returning();

	const [childRfq] = await db()
		.insert(schema.rfqs)
		.values({
			buyerWorkspaceId: buyer.workspace.id,
			parentRfqId: parentRfq.id,
			supplierWorkspaceId: supplier.workspace.id,
			createdBy: buyer.user.id,
			status: 'responded',
			note: 'E2E child RFQ',
			isLocked: true,
			submittedAt: new Date(),
		})
		.returning();

	const [rfqItem] = await db()
		.insert(schema.rfqItems)
		.values({
			rfqId: childRfq.id,
			productId: productFixture.product.id,
			supplierWorkspaceId: supplier.workspace.id,
			quantity: 2,
			targetPrice: 1100,
			deliveryDate: new Date(Date.now() + 86_400_000),
			deliveryLocation: 'E2E warehouse',
		})
		.returning();

	const [quotation] = await db()
		.insert(schema.quotations)
		.values({
			rfqId: childRfq.id,
			supplierWorkspaceId: supplier.workspace.id,
			respondedBy: supplier.user.id,
			status: 'submitted',
			totalPrice: 2400,
			unitPrice: 1200,
			estimatedDeliveryDate: 2 as never,
			deliveryTerms: 'E2E delivery terms',
			note: 'E2E quotation',
			isLocked: false,
			submittedAt: new Date(),
		})
		.returning();

	await db().insert(schema.quotationItems).values({
		quotationId: quotation.id,
		rfqItemId: rfqItem.id,
		unitPrice: 1200,
		quantity: 2,
	});

	return {
		buyer,
		supplier,
		product: productFixture.product,
		parentRfq,
		childRfq,
		rfqItem,
		quotation,
	};
}

export async function createOrderFixture() {
	const fixture = await createRfqQuotationFixture();
	const [order] = await db()
		.insert(schema.purchaseOrders)
		.values({
			quotationId: fixture.quotation.id,
			buyerWorkspaceId: fixture.buyer.workspace.id,
			supplierWorkspaceId: fixture.supplier.workspace.id,
			status: 'pending_approval',
			totalPrice: 2400,
			finalUnitPrice: 1200,
			finalPaymentTerms: 'E2E delivery terms',
			finalDeliveryDate: new Date(Date.now() + 172_800_000),
			isLocked: true,
		})
		.returning();

	return { ...fixture, order };
}

export async function findAuditByResource(resourceId: string) {
	return db()
		.select()
		.from(schema.auditLogs)
		.where(eq(schema.auditLogs.resourceId, resourceId));
}
