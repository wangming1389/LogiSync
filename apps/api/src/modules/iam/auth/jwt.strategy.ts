import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { SessionRegistryService } from '../../../core/session/session-registry.service';
import { type JwtPayload } from './auth.dto';
import { CLOCK_SKEW_TOLERANCE_SECONDS } from './constants/auth.constants';

/**
 * JwtStrategy — Passport JWT Strategy for LogiSync
 *
 * Authentication flow per request:
 * 1. Extract JWT from Authorization: Bearer <token>
 * 2. Verify JWT signature with JWT_SECRET
 * 3. Check exp (passport-jwt handles with clockTolerance = 30s)
 * 4. **Critical**: Get sessionId from payload → check session in Redis
 *    - If session not found (revoked or expired) → 401
 *    - If session exists → attach payload to request.user
 *
 * This ensures:
 * - Revoked token (logout, password change, suspend workspace) → immediately invalid
 * - Session expires 30 min (Redis TTL) → automatically invalid
 * - Close browser without logout → Redis session auto-expires after 30 min
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private readonly configService: ConfigService,
		private readonly sessionRegistryService: SessionRegistryService,
	) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.get<string>(
				'JWT_SECRET',
				'your_super_secret_jwt_key_change_in_production',
			),
			// Clock skew tolerance between servers: max 30 seconds
			clockTolerance: CLOCK_SKEW_TOLERANCE_SECONDS,
		} as any);
	}

	/**
	 * Called after JWT signature + expiration have been verified successfully.
	 * Check session in Redis to ensure token hasn't been revoked.
	 */
	async validate(payload: JwtPayload): Promise<JwtPayload> {
		if (!payload.sessionId) {
			throw new UnauthorizedException('Token is invalid: missing sessionId');
		}

		// Check session still exists in Redis
		const session = await this.sessionRegistryService.getSession(
			payload.sessionId,
		);

		if (!session) {
			throw new UnauthorizedException(
				'Login session has expired or been revoked',
			);
		}

		// Check session hasn't expired (double-check with Redis TTL)
		if (session.expiresAt < Date.now()) {
			await this.sessionRegistryService.revokeSession(payload.sessionId);
			throw new UnauthorizedException('Login session has expired');
		}

		// Valid payload → attach to request.user
		return payload;
	}
}
