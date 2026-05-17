import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClsService } from 'nestjs-cls';

/**
 * JwtAuthGuard — Guard for JWT authentication on protected endpoints.
 *
 * Usage:
 *   @UseGuards(JwtAuthGuard)
 *   @Get('/protected')
 *   handler(@Req() req) { req.user → JwtPayload }
 *
 * Authentication flow:
 * 1. Extract Bearer token from Authorization header
 * 2. JwtStrategy.validate() → verify signature + check Redis session
 * 3. If valid → attach payload to request.user and ClsStore
 * 4. If invalid → throw 401 Unauthorized
 */
interface JwtPayload {
	sub: string;
	email: string;
	workspaceId: string;
	iat?: number;
	exp?: number;
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
	constructor(private readonly cls: ClsService) {
		super();
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	handleRequest(err: any, user: JwtPayload | null, ...rest: any[]): any {
		if (err || !user) {
			throw err || new UnauthorizedException();
		}

		// Inject workspaceId into ClsStore for RLS support
		if (user.workspaceId) {
			this.cls.set('workspaceId', user.workspaceId);
		}

		return user;
	}
}
