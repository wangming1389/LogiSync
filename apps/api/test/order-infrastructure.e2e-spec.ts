import { INestApplication } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import request from 'supertest';

import { schema } from '../src/infrastructure/database';
import { UserRole } from '../src/modules/iam/auth/enums/user-role.enum';
import {
	bearer,
	createE2eApp,
	createIdentity,
	createOrderFixture,
	createUser,
	db,
	login,
	pool,
} from './e2e-helpers';

describe('Order infrastructure test cases from docs/api/order', () => {
	let app: INestApplication;

	beforeAll(async () => {
		app = await createE2eApp();
	});

	afterAll(async () => {
		await app.close();
	});

	it('TC-ORD-03 Status History Immutability', async () => {
		const fixture = await createOrderFixture();
		const [history] = await db()
			.insert(schema.orderStatusHistory)
			.values({
				orderId: fixture.order.id,
				statusValue: 'pending_approval',
				changedBy: fixture.buyer.user.id,
				changedAt: new Date(),
			})
			.returning();

		await expect(
			pool().query(
				'update order_status_history set status_value = $1 where id = $2',
				['approved', history.id],
			),
		).rejects.toThrow(/append-only|forbidden|immutable/i);
		await expect(
			pool().query('delete from order_status_history where id = $1', [
				history.id,
			]),
		).rejects.toThrow(/append-only|forbidden|immutable/i);
	});

	it('TC-ORD-06 Atomic Transactions', async () => {
		const fixture = await createOrderFixture();

		await expect(
			db().transaction(async (tx) => {
				await tx
					.update(schema.purchaseOrders)
					.set({ status: 'approved' })
					.where(eq(schema.purchaseOrders.id, fixture.order.id));
				await tx.insert(schema.orderStatusHistory).values({
					orderId: fixture.order.id,
					statusValue: 'approved',
					changedBy: fixture.supplier.user.id,
					changedAt: new Date(),
				});
				throw new Error('force order rollback');
			}),
		).rejects.toThrow('force order rollback');

		const [order] = await db()
			.select()
			.from(schema.purchaseOrders)
			.where(eq(schema.purchaseOrders.id, fixture.order.id));
		const approvedHistory = await db()
			.select()
			.from(schema.orderStatusHistory)
			.where(eq(schema.orderStatusHistory.orderId, fixture.order.id));

		expect(order.status).toBe('pending_approval');
		expect(approvedHistory.some((row) => row.statusValue === 'approved')).toBe(
			false,
		);
	});

	it('TC-ORD-09 Tenant Isolation', async () => {
		const fixture = await createOrderFixture();
		const outsider = await createIdentity(UserRole.BUYER_STAFF, {
			type: 'buyer',
		});
		const outsiderToken = await login(app, outsider.user.email);

		await request(app.getHttpServer())
			.get(`/orders/${fixture.order.id}`)
			.set(bearer(outsiderToken))
			.expect(404);
	});

	it('TC-ORD-12 Supplier Export Authorization', async () => {
		const fixture = await createOrderFixture();
		const supplierAdmin = await createUser(
			fixture.supplier.workspace.id,
			UserRole.COMPANY_ADMIN,
		);
		const token = await login(app, supplierAdmin.email);

		await request(app.getHttpServer())
			.get('/orders/export')
			.query({
				start_date: new Date(Date.now() - 86_400_000)
					.toISOString()
					.slice(0, 10),
				end_date: new Date(Date.now() + 86_400_000).toISOString().slice(0, 10),
				format: 'xlsx',
			})
			.set(bearer(token))
			.expect(200)
			.expect('Content-Type', /spreadsheetml/);
	});
});
