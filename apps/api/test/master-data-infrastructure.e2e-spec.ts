import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { MessageQueueService } from '../src/infrastructure/message-queue/message-queue.service';
import { UserRole } from '../src/modules/iam/auth/enums/user-role.enum';
import {
	bearer,
	createE2eApp,
	createIdentity,
	createPlatformAdmin,
	login,
	unique,
} from './e2e-helpers';

describe('Master Data infrastructure test cases from docs/api/master-data', () => {
	let app: INestApplication;

	beforeAll(async () => {
		app = await createE2eApp();
	});

	afterAll(async () => {
		await app.close();
	});

	it('TC-MD-05 Write Performance', async () => {
		const admin = await createPlatformAdmin();
		const token = await login(app, admin.user.email);
		const suffix = unique('uom');
		const startedAt = performance.now();

		await request(app.getHttpServer())
			.post('/admin/uom')
			.set(bearer(token))
			.send({
				name: `E2E UOM ${suffix}`,
				code: `E2E${Date.now().toString(36)}`.slice(0, 20),
			})
			.expect(201);

		expect(performance.now() - startedAt).toBeLessThan(500);
	});

	it('TC-MD-06 Cache Update SLA', async () => {
		const messageQueue = app.get(MessageQueueService);
		const isReadySpy = jest
			.spyOn(messageQueue, 'isReady')
			.mockReturnValue(true);
		const publishSpy = jest
			.spyOn(messageQueue, 'publishMessage')
			.mockResolvedValue(undefined);
		const admin = await createPlatformAdmin();
		const token = await login(app, admin.user.email);
		const suffix = unique('uom-cache');
		const startedAt = performance.now();

		await request(app.getHttpServer())
			.post('/admin/uom')
			.set(bearer(token))
			.send({
				name: `E2E Cache UOM ${suffix}`,
				code: `EC${Date.now().toString(36)}`.slice(0, 20),
			})
			.expect(201);

		expect(publishSpy).toHaveBeenCalledWith(
			'master-data:units-of-measure',
			expect.objectContaining({
				event: 'cache_invalidate',
				key: 'master-data:units-of-measure',
			}),
		);
		expect(performance.now() - startedAt).toBeLessThan(1000);

		isReadySpy.mockRestore();
		publishSpy.mockRestore();
	});

	it('TC-MD-07 Admin RBAC Guard', async () => {
		const nonAdmin = await createIdentity(UserRole.COMPANY_ADMIN);
		const token = await login(app, nonAdmin.user.email);

		await request(app.getHttpServer())
			.get('/admin/uom')
			.set(bearer(token))
			.expect(403);
	});
});
