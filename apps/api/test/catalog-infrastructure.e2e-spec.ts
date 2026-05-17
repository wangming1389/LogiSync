import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { UserRole } from '../src/modules/iam/auth/enums/user-role.enum';
import {
	bearer,
	createE2eApp,
	createIdentity,
	createProductFixture,
	login,
	unique,
} from './e2e-helpers';

describe('Catalog infrastructure test cases from docs/api/catalog', () => {
	let app: INestApplication;

	beforeAll(async () => {
		app = await createE2eApp();
	});

	afterAll(async () => {
		await app.close();
	});

	it('TC-CAT-07 Tenant Isolation', async () => {
		const supplierA = await createIdentity(UserRole.SUPPLIER_STAFF, {
			type: 'supplier',
		});
		const supplierB = await createIdentity(UserRole.SUPPLIER_STAFF, {
			type: 'supplier',
		});
		const productAName = `Visible Product ${unique('cat')}`;
		const productBName = `Hidden Product ${unique('cat')}`;

		const productA = await createProductFixture({
			workspaceId: supplierA.workspace.id,
			createdBy: supplierA.user.id,
			name: productAName,
			status: 'active',
		});
		const productB = await createProductFixture({
			workspaceId: supplierB.workspace.id,
			createdBy: supplierB.user.id,
			name: productBName,
			status: 'active',
		});
		const token = await login(app, supplierA.user.email);

		const response = await request(app.getHttpServer())
			.get('/catalog/products')
			.set(bearer(token))
			.expect(200);

		expect(response.body.success).toBe(true);
		expect(response.body.error).toBeNull();
		expect(response.body.meta).toEqual(
			expect.objectContaining({ total: expect.any(Number) }),
		);

		const ids = response.body.data.map((item: { id: string }) => item.id);
		expect(ids).toContain(productA.product.id);
		expect(ids).not.toContain(productB.product.id);
	});
});
