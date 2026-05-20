import { ExecutionContext, HttpException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimitOptions } from '../../common/decorators/rate-limit.decorator';
import { RateLimitGuard } from './rate-limit.guard';

describe('RateLimitGuard', () => {
	const createContext = (
		body: unknown = {},
		user?: { sub?: string; id?: string },
	): ExecutionContext =>
		({
			getHandler: jest.fn(),
			getClass: jest.fn(),
			switchToHttp: () => ({
				getRequest: () => ({
					body,
					headers: { 'x-forwarded-for': '127.0.0.1' },
					socket: {},
					user,
				}),
				getResponse: () => ({
					setHeader: jest.fn(),
				}),
			}),
		}) as unknown as ExecutionContext;

	it('TC-SEC-05 Bypass Unprotected Routes', () => {
		const reflector = {
			getAllAndOverride: jest.fn().mockReturnValue(undefined),
		} as unknown as Reflector;
		const guard = new RateLimitGuard(reflector);

		expect(guard.canActivate(createContext())).toBe(true);
		guard.onModuleDestroy();
	});

	it('TC-SEC-06 IP Rate Limit Enforcement', () => {
		const policy: RateLimitOptions = {
			name: 'auth-login',
			limit: 2,
			windowMs: 60_000,
			keyBy: 'ip',
		};
		const reflector = {
			getAllAndOverride: jest.fn().mockReturnValue(policy),
		} as unknown as Reflector;
		const guard = new RateLimitGuard(reflector);
		const context = createContext({ email: 'buyer@logisync.test' });

		expect(guard.canActivate(context)).toBe(true);
		expect(guard.canActivate(context)).toBe(true);
		expect(() => guard.canActivate(context)).toThrow(HttpException);
		guard.onModuleDestroy();
	});

	it('TC-SEC-07 User Rate Limit Isolation', () => {
		const policy: RateLimitOptions = {
			name: 'auth-change-password',
			limit: 1,
			windowMs: 60_000,
			keyBy: 'user',
		};
		const reflector = {
			getAllAndOverride: jest.fn().mockReturnValue(policy),
		} as unknown as Reflector;
		const guard = new RateLimitGuard(reflector);

		expect(guard.canActivate(createContext({}, { sub: 'user-1' }))).toBe(true);
		expect(guard.canActivate(createContext({}, { sub: 'user-2' }))).toBe(true);
		expect(() =>
			guard.canActivate(createContext({}, { sub: 'user-1' })),
		).toThrow(HttpException);
		guard.onModuleDestroy();
	});

	it('TC-SEC-08 Missing Context Rejection', () => {
		const policy: RateLimitOptions = {
			name: 'auth-refresh',
			limit: 1,
			windowMs: 60_000,
			keyBy: 'user',
		};
		const reflector = {
			getAllAndOverride: jest.fn().mockReturnValue(policy),
		} as unknown as Reflector;
		const guard = new RateLimitGuard(reflector);

		expect(() => guard.canActivate(createContext())).toThrow(HttpException);
		guard.onModuleDestroy();
	});
});
