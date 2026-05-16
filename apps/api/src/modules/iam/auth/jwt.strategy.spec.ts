import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
	const configService = {
		get: jest.fn((_: string, fallback?: string) => fallback),
	};
	const sessionRegistryService = {
		getSession: jest.fn(),
		revokeSession: jest.fn(),
	};

	let strategy: JwtStrategy;

	beforeEach(() => {
		jest.clearAllMocks();
		strategy = new JwtStrategy(
			configService as unknown as ConfigService,
			sessionRegistryService as never,
		);
	});

	it('TC-SEC-02 Session Revocation', async () => {
		sessionRegistryService.getSession.mockResolvedValue(null);

		await expect(
			strategy.validate({
				sub: 'user-1',
				workspaceId: 'workspace-1',
				role: 'buyer',
				sessionId: 'revoked-session',
				jti: 'jwt-1',
			}),
		).rejects.toThrow(UnauthorizedException);
	});
});
