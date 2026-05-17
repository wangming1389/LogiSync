import { ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import {
	AuditAction,
	AuditStatus,
} from '../../../../core/audit/enums/audit.enums';
import { AuthService } from './auth.service';

jest.mock('bcryptjs', () => ({
	compare: jest.fn(),
	hash: jest.fn(),
}));

describe('AuthService core security contract', () => {
	const jwtService = { sign: jest.fn() };
	const sessionRegistryService = { createSession: jest.fn() };
	const securityService = {
		isAccountLocked: jest.fn(),
		recordFailedLogin: jest.fn(),
		recordSuccessfulLogin: jest.fn(),
		invalidateAllSessions: jest.fn(),
	};
	const auditLoggerService = { log: jest.fn() };
	const userRepository = {
		findByEmailForAuth: jest.fn(),
		findById: jest.fn(),
		update: jest.fn(),
	};
	const workspaceRepository = { findById: jest.fn() };

	let service: AuthService;

	beforeEach(() => {
		jest.clearAllMocks();
		service = new AuthService(
			jwtService as unknown as JwtService,
			sessionRegistryService as never,
			securityService as never,
			auditLoggerService as never,
			userRepository as never,
			workspaceRepository as never,
		);
		jwtService.sign.mockReturnValue('signed-token');
		sessionRegistryService.createSession.mockResolvedValue('session-1');
		securityService.isAccountLocked.mockResolvedValue(false);
		securityService.recordSuccessfulLogin.mockResolvedValue(undefined);
		auditLoggerService.log.mockResolvedValue(undefined);
		userRepository.findByEmailForAuth.mockResolvedValue({
			id: 'user-1',
			workspaceId: 'workspace-1',
			email: 'buyer@logisync.test',
			passwordHash: 'hashed-password',
			role: 'buyer',
			isActive: true,
		});
		workspaceRepository.findById.mockResolvedValue({ status: 'active' });
		(bcrypt.compare as jest.Mock).mockResolvedValue(true);
	});

	it('TC-AUD-03 Error Capture', async () => {
		(bcrypt.compare as jest.Mock).mockResolvedValue(false);
		securityService.recordFailedLogin.mockResolvedValue(undefined);

		await expect(
			service.login(
				'buyer@logisync.test',
				'WrongPassword123!',
				'127.0.0.1',
				'jest-agent',
			),
		).rejects.toThrow('Email or password is incorrect');

		expect(auditLoggerService.log).toHaveBeenCalledWith(
			expect.objectContaining({
				action: AuditAction.AUTH_LOGIN_FAILED,
				errorMessage: 'Password is incorrect',
				status: AuditStatus.FAILURE,
			}),
		);
	});

	it('TC-IAM-04 Account Lockout', async () => {
		securityService.isAccountLocked.mockResolvedValue(true);

		await expect(
			service.login(
				'buyer@logisync.test',
				'CorrectPassword123!',
				'127.0.0.1',
				'jest-agent',
			),
		).rejects.toThrow(ForbiddenException);
	});

	it('TC-IAM-11 Password Hashing', async () => {
		(bcrypt.hash as jest.Mock).mockResolvedValue('bcrypt-cost-12-hash');
		userRepository.findById.mockResolvedValue({
			id: 'user-1',
			workspaceId: 'workspace-1',
			passwordHash: 'old-hash',
		});
		userRepository.update.mockResolvedValue(undefined);
		securityService.invalidateAllSessions.mockResolvedValue(undefined);

		await service.changePassword(
			{
				sub: 'user-1',
				workspaceId: 'workspace-1',
				role: 'buyer',
				sessionId: 'session-1',
				jti: 'jwt-1',
				iat: 1,
				exp: 2,
			},
			'OldPass1!',
			'NewPass1!',
			'127.0.0.1',
			'jest-agent',
		);

		expect(bcrypt.hash).toHaveBeenCalledWith('NewPass1!', 12);
		expect(userRepository.update).toHaveBeenCalledWith('user-1', {
			passwordHash: 'bcrypt-cost-12-hash',
		});
		expect(auditLoggerService.log).toHaveBeenCalledWith(
			expect.not.objectContaining({
				changes: expect.objectContaining({ newPassword: 'NewPass1!' }),
			}),
		);
	});

	it('TC-SEC-04 JWT Claims Leakage', async () => {
		await service.login(
			'buyer@logisync.test',
			'CorrectPassword123!',
			'127.0.0.1',
			'jest-agent',
		);

		expect(jwtService.sign).toHaveBeenCalledWith(
			{
				sub: 'user-1',
				workspaceId: 'workspace-1',
				role: 'buyer',
				sessionId: 'session-1',
				jti: expect.any(String),
			},
			expect.any(Object),
		);
		expect(jwtService.sign.mock.calls[0][0]).not.toHaveProperty('email');
		expect(jwtService.sign.mock.calls[0][0]).not.toHaveProperty('passwordHash');
	});
});
