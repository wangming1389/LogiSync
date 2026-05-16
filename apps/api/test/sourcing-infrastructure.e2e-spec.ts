import { INestApplication } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import request from 'supertest';

import { schema } from '../src/infrastructure/database';
import { UserRole } from '../src/modules/iam/auth/enums/user-role.enum';
import { QuotationService } from '../src/modules/sourcing/quotation/quotation.service';
import {
	bearer,
	createE2eApp,
	createIdentity,
	createProductFixture,
	createRfqQuotationFixture,
	db,
	login,
	unique,
} from './e2e-helpers';

describe('Sourcing infrastructure test cases from docs/api/sourcing', () => {
	let app: INestApplication;

	beforeAll(async () => {
		app = await createE2eApp();
	});

	afterAll(async () => {
		await app.close();
	});

	it('TC-SRC-06 Search Performance', async () => {
		const buyer = await createIdentity(UserRole.BUYER_STAFF, { type: 'buyer' });
		const supplier = await createIdentity(UserRole.SUPPLIER_STAFF, {
			type: 'supplier',
		});
		const searchableName = `Searchable Bearing ${unique('src')}`;
		await createProductFixture({
			workspaceId: supplier.workspace.id,
			createdBy: supplier.user.id,
			name: searchableName,
			status: 'active',
		});

		const token = await login(app, buyer.user.email);
		const startedAt = performance.now();
		const response = await request(app.getHttpServer())
			.get('/products/search')
			.query({ keyword: 'Searchable Bearing', limit: 25 })
			.set(bearer(token))
			.expect(200);

		expect(performance.now() - startedAt).toBeLessThan(3000);
		expect(
			response.body.items.some(
				(item: { name: string }) => item.name === searchableName,
			),
		).toBe(true);
	});

	it('TC-SRC-08 Atomic Selection', async () => {
		const fixture = await createRfqQuotationFixture();

		const result = await app
			.get(QuotationService)
			.selectQuotation(
				fixture.quotation.id,
				fixture.buyer.user.id,
				UserRole.BUYER_STAFF,
				fixture.buyer.workspace.id,
				'127.0.0.1',
			);

		expect(result.quotation.status).toBe('selected');
		expect(result.quotation.isLocked).toBe(true);
		expect(result.purchaseOrder.quotationId).toBe(fixture.quotation.id);

		const [parentRfq] = await db()
			.select()
			.from(schema.rfqs)
			.where(eq(schema.rfqs.id, fixture.parentRfq.id));
		const [persistedPo] = await db()
			.select()
			.from(schema.purchaseOrders)
			.where(eq(schema.purchaseOrders.quotationId, fixture.quotation.id));

		expect(parentRfq.status).toBe('closed');
		expect(persistedPo).toEqual(
			expect.objectContaining({
				quotationId: fixture.quotation.id,
				buyerWorkspaceId: fixture.buyer.workspace.id,
				supplierWorkspaceId: fixture.supplier.workspace.id,
			}),
		);
	});
});
