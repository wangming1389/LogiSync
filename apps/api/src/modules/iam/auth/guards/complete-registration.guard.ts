import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { ClsService } from 'nestjs-cls';
import { SessionRegistryService } from '../../../../core/session/session-registry.service';
import {
	CHANGE_TOKEN_TYPE,
	type ChangeTokenPayload,
} from '../dtos/complete-registration.dto';

export const CHANGE_TOKEN_BLACKLIST_PREFIX = 'change-token:used:';

/**
 * CompleteRegistrationGuard — verifies the short-lived `changeToken`
 * issued when a user with `mustChangePassword=true` authenticates.
 *
 * Unlike `JwtAuthGuard`, this guard bypasses Passport so it can accept
 * tokens that intentionally have no `sessionId` (they must not be
 * usable for any other API). The guard:
 *   1. Verifies signature + expiry against `JWT_SECRET`.
 *   2. Checks `payload.type === 'complete-registration'`.
 *   3. Rejects already-consumed tokens via the Redis blacklist key
 *      `change-token:used:<jti>` (set by `AuthService.completeRegistration`).
 *   4. Populates `req.user` and `cls.workspaceId` so downstream code
 *      behaves as if the request were authenticated.
 */
@Injectable()
export class CompleteRegistrationGuard implements CanActivate {
	constructor(
		private readonly jwtService: JwtService,
		private readonly sessionRegistryService: SessionRegistryService,
		private readonly cls: ClsService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<Request>();
		const token = this.extractToken(request);

		let payload: ChangeTokenPayload;
		try {
			payload = this.jwtService.verify<ChangeTokenPayload>(token);
		} catch {
			throw new UnauthorizedException('Invalid or expired change token');
		}

		if (payload.type !== CHANGE_TOKEN_TYPE) {
			throw new UnauthorizedException('Token is not a change token');
		}
		if (!payload.sub || !payload.workspaceId || !payload.jti) {
			throw new UnauthorizedException('Change token payload is incomplete');
		}

		const used = await this.sessionRegistryService.get(
			`${CHANGE_TOKEN_BLACKLIST_PREFIX}${payload.jti}`,
		);
		if (used) {
			throw new UnauthorizedException('Change token has already been used');
		}

		(request as Request & { user: ChangeTokenPayload }).user = payload;
		this.cls.set('workspaceId', payload.workspaceId);

		return true;
	}

	private extractToken(request: Request): string {
		const header = request.headers.authorization ?? '';
		const [scheme, value] = header.split(' ');
		if (scheme?.toLowerCase() !== 'bearer' || !value) {
			throw new UnauthorizedException('Missing Bearer token');
		}
		return value;
	}
}
