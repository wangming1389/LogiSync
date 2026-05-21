import { INestApplication } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import request from 'supertest';

import { schema } from '../src/infrastructure/database';
import { UserRole } from '../src/modules/iam/auth/enums/user-role.enum';
import {
	bearer,
	createE2eApp,
	createIdentity,
	createProductFixture,
	db,
	login,
} from './e2e-helpers';

describe('Cross-tenant isolation', () => {
	let app: INestApplication;

	beforeAll(async () => {
		app = await createE2eApp();
	});

	afterAll(async () => {
		await app.close();
	});

	describe('Authentication', () => {
		it('TC-IAM-13 rejects requests without a token', async () => {
			const response = await request(app.getHttpServer())
				.get('/catalog/products')
				.expect(401);

			expect(response.body).toEqual(
				expect.objectContaining({
					success: false,
					data: null,
					error: expect.objectContaining({ statusCode: 401 }),
					meta: expect.objectContaining({ path: '/catalog/products' }),
				}),
			);
		});

		it('TC-IAM-14 rejects requests with a malformed token', async () => {
			await request(app.getHttpServer())
				.get('/catalog/products')
				.set('Authorization', 'Bearer invalid.token.here')
				.expect(401);
		});

		it('TC-IAM-15 rejects requests with an expired or invalid token', async () => {
			const expiredToken =
				'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0IiwiaWF0IjoxLCJleHAiOjJ9.invalid';

			await request(app.getHttpServer())
				.get('/catalog/products')
				.set('Authorization', `Bearer ${expiredToken}`)
				.expect(401);
		});
	});

	describe('Catalog product isolation', () => {
		it('TC-SEC-09 keeps product reads and writes scoped to the caller workspace', async () => {
			const workspaceA = await createIdentity(UserRole.SUPPLIER_STAFF, {
				type: 'supplier',
			});
			const workspaceB = await createIdentity(UserRole.SUPPLIER_STAFF, {
				type: 'supplier',
			});
			const productA = await createProductFixture({
				workspaceId: workspaceA.workspace.id,
				createdBy: workspaceA.user.id,
				status: 'active',
			});
			const productB = await createProductFixture({
				workspaceId: workspaceB.workspace.id,
				createdBy: workspaceB.user.id,
				status: 'active',
			});
			const tokenA = await login(app, workspaceA.user.email);
			const tokenB = await login(app, workspaceB.user.email);

			const listA = await request(app.getHttpServer())
				.get('/catalog/products')
				.set(bearer(tokenA))
				.expect(200);
			expect(listA.body.success).toBe(true);
			expect(listA.body.error).toBeNull();
			const idsA = listA.body.data.map((item: { id: string }) => item.id);

			expect(idsA).toContain(productA.product.id);
			expect(idsA).not.toContain(productB.product.id);
			expect(
				listA.body.data.every(
					(item: { workspaceId: string }) =>
						item.workspaceId === workspaceA.workspace.id,
				),
			).toBe(true);

			await request(app.getHttpServer())
				.patch(`/catalog/products/${productA.product.id}`)
				.set(bearer(tokenB))
				.send({ name: 'Cross-tenant overwrite attempt' })
				.expect(404);

			await request(app.getHttpServer())
				.delete(`/catalog/products/${productA.product.id}`)
				.set(bearer(tokenB))
				.expect(404);

			const listB = await request(app.getHttpServer())
				.get('/catalog/products')
				.set(bearer(tokenB))
				.expect(200);
			const idsB = listB.body.data.map((item: { id: string }) => item.id);

			expect(idsB).not.toContain(productA.product.id);
			expect(idsB).toContain(productB.product.id);
		});
	});

	describe('RFQ isolation', () => {
		it('TC-SEC-10 keeps buyer RFQs hidden from another buyer workspace', async () => {
			const buyerA = await createIdentity(UserRole.BUYER_STAFF, {
				type: 'buyer',
			});
			const buyerB = await createIdentity(UserRole.BUYER_STAFF, {
				type: 'buyer',
			});
			const [rfqA] = await db()
				.insert(schema.rfqs)
				.values({
					buyerWorkspaceId: buyerA.workspace.id,
					createdBy: buyerA.user.id,
					status: 'draft',
					isLocked: false,
				})
				.returning();
			const tokenB = await login(app, buyerB.user.email);

			const response = await request(app.getHttpServer())
				.get('/rfqs')
				.set(bearer(tokenB))
				.expect(200);

			expect(
				response.body.data.some((item: { id: string }) => item.id === rfqA.id),
			).toBe(false);

			await request(app.getHttpServer())
				.post(`/rfqs/${rfqA.id}/submit`)
				.set(bearer(tokenB))
				.expect(404);
		});
	});

	describe('Session isolation', () => {
		it('TC-IAM-16 rejects a token after the workspace is suspended in the database', async () => {
			const identity = await createIdentity(UserRole.SUPPLIER_STAFF, {
				type: 'supplier',
			});
			const token = await login(app, identity.user.email);

			await db()
				.update(schema.workspaces)
				.set({ status: 'suspended', isActive: false })
				.where(eq(schema.workspaces.id, identity.workspace.id));

			await request(app.getHttpServer())
				.get('/catalog/products')
				.set(bearer(token))
				.expect(401);

			await db()
				.update(schema.workspaces)
				.set({ status: 'active', isActive: true })
				.where(eq(schema.workspaces.id, identity.workspace.id));
		});
	});

	describe('RBAC isolation', () => {
		it('TC-SEC-11 blocks buyer users from supplier product writes and supplier users from buyer RFQ writes', async () => {
			const buyer = await createIdentity(UserRole.BUYER_STAFF, {
				type: 'buyer',
			});
			const supplier = await createIdentity(UserRole.SUPPLIER_STAFF, {
				type: 'supplier',
			});
			const buyerToken = await login(app, buyer.user.email);
			const supplierToken = await login(app, supplier.user.email);

			await request(app.getHttpServer())
				.post('/catalog/products')
				.set(bearer(buyerToken))
				.send({ name: 'Unauthorized Product', sku: 'UNAUTH-001' })
				.expect(403);

			await request(app.getHttpServer())
				.post('/rfqs')
				.set(bearer(supplierToken))
				.send({ note: 'Unauthorized RFQ' })
				.expect(403);
		});
	});
});
