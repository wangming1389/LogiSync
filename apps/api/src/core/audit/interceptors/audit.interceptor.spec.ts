import { ExecutionContext } from '@nestjs/common';
import { firstValueFrom, of } from 'rxjs';
import { AuditAction, AuditStatus } from '../enums/audit.enums';
import { AuditInterceptor } from './audit.interceptor';

describe('AuditInterceptor', () => {
	const auditLoggerService = { log: jest.fn() };
	const request = {
		method: 'PATCH',
		path: '/catalog/products/123e4567-e89b-12d3-a456-426614174000',
		headers: { 'x-forwarded-for': '203.0.113.10, 10.0.0.2' },
		socket: { remoteAddress: '127.0.0.1' },
		get: jest.fn().mockReturnValue('jest-agent'),
		user: { sub: 'user-1', workspaceId: 'workspace-1' },
	};
	const context = {
		switchToHttp: () => ({ getRequest: () => request }),
	} as unknown as ExecutionContext;

	let interceptor: AuditInterceptor;

	beforeEach(() => {
		jest.clearAllMocks();
		request.method = 'PATCH';
		request.path = '/catalog/products/123e4567-e89b-12d3-a456-426614174000';
		auditLoggerService.log.mockResolvedValue(undefined);
		interceptor = new AuditInterceptor(auditLoggerService as never);
	});

	it('TC-AUD-01 Mandatory Logging', async () => {
		await firstValueFrom(
			interceptor.intercept(context, { handle: () => of({}) }),
		);

		expect(auditLoggerService.log).toHaveBeenCalledWith(
			expect.objectContaining({
				actorId: 'user-1',
				workspaceId: 'workspace-1',
				action: AuditAction.PRODUCT_UPDATE_SUCCESS,
				resourceType: 'catalog',
				resourceId: '123e4567-e89b-12d3-a456-426614174000',
				ipAddress: '203.0.113.10',
				userAgent: 'jest-agent',
				status: AuditStatus.SUCCESS,
			}),
		);
	});
});
