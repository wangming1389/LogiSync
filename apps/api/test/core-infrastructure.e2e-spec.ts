import { INestApplication } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as nodemailer from 'nodemailer';
import request from 'supertest';

jest.mock('nodemailer', () => ({
	createTransport: jest.fn(() => ({
		sendMail: jest.fn().mockResolvedValue({ accepted: ['ops@example.test'] }),
	})),
}));

import { AuditStatus } from '../src/core/audit/audit.enums';
import { AuditLoggerService } from '../src/core/audit/audit-logger.service';
import { HealthCheckService } from '../src/core/health/health-check.service';
import { SessionRegistryService } from '../src/core/session/session-registry.service';
import { schema } from '../src/infrastructure/database';
import { ObjectStorageService } from '../src/infrastructure/object-storage/object-storage.service';
import { UserRole } from '../src/modules/iam/auth/enums/user-role.enum';
import {
	bearer,
	createE2eApp,
	createIdentity,
	db,
	findAuditByResource,
	login,
	pool,
} from './e2e-helpers';

describe('Core infrastructure test cases from docs/api/core', () => {
	let app: INestApplication;

	beforeAll(async () => {
		app = await createE2eApp();
	});

	afterAll(async () => {
		await app.close();
	});

	it('TC-HLT-03 Alert Trigger', async () => {
		process.env.ALERT_EMAIL_TO = 'ops@example.test';
		process.env.SMTP_HOST = 'smtp.example.test';
		process.env.SMTP_PORT = '587';
		process.env.SMTP_USER = 'alerts@example.test';
		process.env.SMTP_PASS = 'secret';

		const createTransport = nodemailer.createTransport as jest.Mock;
		createTransport.mockClear();
		const objectStorage = app.get(ObjectStorageService);
		const pingSpy = jest
			.spyOn(objectStorage, 'ping')
			.mockRejectedValueOnce(new Error('object storage unavailable'));

		const status = await app.get(HealthCheckService).performHealthCheck();

		expect(status.degraded).toBe(true);
		expect(status.objectStorage).toBe(false);
		expect(createTransport).toHaveBeenCalled();
		const transporter = createTransport.mock.results[0].value as {
			sendMail: jest.Mock;
		};
		expect(transporter.sendMail).toHaveBeenCalledWith(
			expect.objectContaining({
				to: 'ops@example.test',
				text: expect.stringContaining('objectStorage'),
			}),
		);

		pingSpy.mockRestore();
	});

	it('TC-AUD-02 Transaction Rollback', async () => {
		const actor = await createIdentity(UserRole.COMPANY_ADMIN);
		const resourceId = randomUUID();

		await expect(
			db().transaction(async (tx) => {
				await app.get(AuditLoggerService).logInTx(tx as never, {
					actorId: actor.user.id,
					workspaceId: actor.workspace.id,
					action: 'E2E_ROLLBACK_PROBE',
					resourceType: 'e2e_probe',
					resourceId,
					ipAddress: '127.0.0.1',
					status: AuditStatus.SUCCESS,
				});
				throw new Error('force rollback');
			}),
		).rejects.toThrow('force rollback');

		await expect(findAuditByResource(resourceId)).resolves.toHaveLength(0);
	});

	it('TC-AUD-04 Immutability', async () => {
		const actor = await createIdentity(UserRole.COMPANY_ADMIN);
		const [auditLog] = await db()
			.insert(schema.auditLogs)
			.values({
				actorId: actor.user.id,
				workspaceId: actor.workspace.id,
				action: 'E2E_IMMUTABILITY_PROBE',
				resourceType: 'audit_log',
				resourceId: randomUUID(),
				ipAddress: '127.0.0.1',
				status: AuditStatus.SUCCESS,
			})
			.returning();

		await expect(
			pool().query('update audit_logs set status = $1 where id = $2', [
				'FAILURE',
				auditLog.id,
			]),
		).rejects.toThrow(/immutable|forbidden/i);
		await expect(
			pool().query('delete from audit_logs where id = $1', [auditLog.id]),
		).rejects.toThrow(/immutable|forbidden/i);
	});

	it('TC-AUD-05 Workspace Isolation', async () => {
		const workspaceA = await createIdentity(UserRole.COMPANY_ADMIN);
		const workspaceB = await createIdentity(UserRole.COMPANY_ADMIN);
		const auditLogger = app.get(AuditLoggerService);

		await auditLogger.log({
			actorId: workspaceA.user.id,
			workspaceId: workspaceA.workspace.id,
			action: 'E2E_WORKSPACE_A',
			resourceType: 'workspace',
			resourceId: workspaceA.workspace.id,
			ipAddress: '127.0.0.1',
			status: AuditStatus.SUCCESS,
		});
		await auditLogger.log({
			actorId: workspaceB.user.id,
			workspaceId: workspaceB.workspace.id,
			action: 'E2E_WORKSPACE_B',
			resourceType: 'workspace',
			resourceId: workspaceB.workspace.id,
			ipAddress: '127.0.0.1',
			status: AuditStatus.SUCCESS,
		});

		const logs = await auditLogger.getWorkspaceLogs(workspaceA.workspace.id);

		expect(
			logs.some((log) => log.workspaceId === workspaceA.workspace.id),
		).toBe(true);
		expect(
			logs.every((log) => log.workspaceId === workspaceA.workspace.id),
		).toBe(true);
	});

	it('TC-SEC-02 Session Revocation', async () => {
		const identity = await createIdentity(UserRole.COMPANY_ADMIN);
		const token = await login(app, identity.user.email);
		await request(app.getHttpServer())
			.get('/auth/me')
			.set(bearer(token))
			.expect(200);

		const payload = JSON.parse(
			Buffer.from(token.split('.')[1], 'base64url').toString('utf8'),
		) as { sessionId: string };
		await app.get(SessionRegistryService).revokeSession(payload.sessionId);

		await request(app.getHttpServer())
			.get('/auth/me')
			.set(bearer(token))
			.expect(401);
	});

	it('TC-SEC-03 Password Change', async () => {
		const identity = await createIdentity(UserRole.COMPANY_ADMIN);
		const firstToken = await login(app, identity.user.email);
		const secondToken = await login(app, identity.user.email);

		await request(app.getHttpServer())
			.patch('/auth/change-password')
			.set(bearer(firstToken))
			.send({ currentPassword: identity.password, newPassword: 'NewPass1!' })
			.expect(200);

		await request(app.getHttpServer())
			.get('/auth/me')
			.set(bearer(secondToken))
			.expect(401);
	});
});
