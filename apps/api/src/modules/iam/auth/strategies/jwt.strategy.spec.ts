import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
	const configService = {
		get: jest.fn((_: string, fallback?: string) => fallback),
	};
	const now = Math.floor(Date.now() / 1000);
	const sessionRegistryService = {
		getSession: jest.fn(),
		revokeSession: jest.fn(),
	};
	const workspaceRepository = {
		findById: jest.fn(),
	};
	const userRepository = {
		findRolesByUserId: jest.fn(),
	};

	let strategy: JwtStrategy;

	beforeEach(() => {
		jest.clearAllMocks();
		strategy = new JwtStrategy(
			configService as unknown as ConfigService,
			sessionRegistryService as never,
			workspaceRepository as never,
			userRepository as never,
		);
	});

	it('TC-SEC-02 Session Revocation', async () => {
		sessionRegistryService.getSession.mockResolvedValue(null);

		await expect(
			strategy.validate({
				sub: 'user-1',
				workspaceId: 'workspace-1',
				workspaceTypes: ['buyer'],
				role: 'buyer',
				sessionId: 'revoked-session',
				jti: 'jwt-1',
				iat: now,
				exp: now + 60,
			}),
		).rejects.toThrow(UnauthorizedException);
	});

	it('TC-IAM-12 Suspended Workspace Rejection', async () => {
		sessionRegistryService.getSession.mockResolvedValue({
			expiresAt: Date.now() + 60_000,
		});
		workspaceRepository.findById.mockResolvedValue({
			id: 'workspace-1',
			status: 'suspended',
			isActive: false,
		});

		await expect(
			strategy.validate({
				sub: 'user-1',
				workspaceId: 'workspace-1',
				workspaceTypes: ['buyer'],
				role: 'buyer',
				sessionId: 'active-session',
				jti: 'jwt-1',
				iat: now,
				exp: now + 60,
			}),
		).rejects.toThrow(UnauthorizedException);
		expect(sessionRegistryService.revokeSession).toHaveBeenCalledWith(
			'active-session',
		);
	});

	it('rejects token when active role is no longer assigned', async () => {
		sessionRegistryService.getSession.mockResolvedValue({
			expiresAt: Date.now() + 60_000,
		});
		workspaceRepository.findById.mockResolvedValue({
			id: 'workspace-1',
			status: 'active',
			isActive: true,
		});
		userRepository.findRolesByUserId.mockResolvedValue(['buyer_staff']);

		await expect(
			strategy.validate({
				sub: 'user-1',
				workspaceId: 'workspace-1',
				workspaceTypes: ['buyer'],
				role: 'buyer_manager',
				sessionId: 'active-session',
				jti: 'jwt-1',
				iat: now,
				exp: now + 60,
			}),
		).rejects.toThrow(UnauthorizedException);
		expect(sessionRegistryService.revokeSession).toHaveBeenCalledWith(
			'active-session',
		);
	});
});
