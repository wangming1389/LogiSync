import { INestApplication } from '@nestjs/common';
import { randomUUID } from 'crypto';
import request from 'supertest';

import { schema } from '../src/infrastructure/database';
import { UserRole } from '../src/modules/iam/auth/enums/user-role.enum';
import {
	bearer,
	createE2eApp,
	createIdentity,
	db,
	login,
	pool,
} from './e2e-helpers';

describe('IAM infrastructure test cases from docs/api/iam', () => {
	let app: INestApplication;

	beforeAll(async () => {
		app = await createE2eApp();
	});

	afterAll(async () => {
		await app.close();
	});

	it('TC-IAM-06 Revocation Guardrail', async () => {
		const platform = await createIdentity(UserRole.PLATFORM_ADMIN, {
			type: 'platform',
		});
		const target = await createIdentity(UserRole.COMPANY_ADMIN, {
			name: 'Exact Company Name Ltd',
			type: 'supplier',
		});
		const platformToken = await login(app, platform.user.email);

		await request(app.getHttpServer())
			.patch(`/workspaces/${target.workspace.id}/revoke`)
			.set(bearer(platformToken))
			.send({ companyNameConfirmation: 'Wrong Company Name' })
			.expect(409);

		const revokeResponse = await request(app.getHttpServer())
			.patch(`/workspaces/${target.workspace.id}/revoke`)
			.set(bearer(platformToken))
			.send({ companyNameConfirmation: 'Exact Company Name Ltd' })
			.expect(200);

		expect(revokeResponse.body).toEqual(
			expect.objectContaining({
				id: target.workspace.id,
				status: 'revoked',
				isActive: false,
			}),
		);
	});

	it('TC-IAM-07 Response Time (Login)', async () => {
		const identity = await createIdentity(UserRole.COMPANY_ADMIN);
		const startedAt = performance.now();

		await request(app.getHttpServer())
			.post('/auth/login')
			.send({ email: identity.user.email, password: identity.password })
			.expect(200);

		expect(performance.now() - startedAt).toBeLessThan(3000);
	});

	it('TC-IAM-08 Token Blacklisting', async () => {
		const identity = await createIdentity(UserRole.COMPANY_ADMIN);
		const firstToken = await login(app, identity.user.email);
		const secondToken = await login(app, identity.user.email);
		const startedAt = performance.now();

		await request(app.getHttpServer())
			.patch('/auth/change-password')
			.set(bearer(firstToken))
			.send({ currentPassword: identity.password, newPassword: 'BlackList1!' })
			.expect(200);

		await request(app.getHttpServer())
			.get('/auth/me')
			.set(bearer(secondToken))
			.expect(401);

		expect(performance.now() - startedAt).toBeLessThan(15_000);
	});

	it('TC-IAM-10 Audit Log Immutability', async () => {
		const actor = await createIdentity(UserRole.COMPANY_ADMIN);
		const [auditLog] = await db()
			.insert(schema.auditLogs)
			.values({
				actorId: actor.user.id,
				workspaceId: actor.workspace.id,
				action: 'E2E_IAM_IMMUTABILITY_PROBE',
				resourceType: 'audit_log',
				resourceId: randomUUID(),
				ipAddress: '127.0.0.1',
				status: 'SUCCESS',
			})
			.returning();

		await expect(
			pool().query('update audit_logs set action = $1 where id = $2', [
				'E2E_IAM_TAMPERED',
				auditLog.id,
			]),
		).rejects.toThrow(/immutable|forbidden/i);
		await expect(
			pool().query('delete from audit_logs where id = $1', [auditLog.id]),
		).rejects.toThrow(/immutable|forbidden/i);
	});
});
