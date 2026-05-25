/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Patch,
	Post,
	Req,
	UseGuards,
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiBody,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { RateLimit } from '../../../../common/decorators/rate-limit.decorator';
import { SkipGlobalAudit } from '../../../../common/decorators/skip-audit.decorator';
import {
	getClientIp,
	getRequestUser,
} from '../../../../common/utils/request.utils';
import { RateLimitGuard } from '../../../../core/security/rate-limit.guard';
import { SESSION_WARNING_SECONDS } from '../constants/auth.constants';
import {
	ChangePasswordDto,
	type JwtPayload,
	LoginDto,
	SelectRoleDto,
} from '../dtos/auth.dto';
import {
	type ChangeTokenPayload,
	CompleteRegistrationDto,
} from '../dtos/complete-registration.dto';
import { CompleteRegistrationGuard } from '../guards/complete-registration.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthService } from '../services/auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	// POST /auth/login (Public)
	@Post('login')
	@HttpCode(HttpStatus.OK)
	@RateLimit({
		name: 'auth-login',
		limit: 10,
		windowMs: 60_000,
		keyBy: 'ip',
	})
	@UseGuards(RateLimitGuard)
	@ApiOperation({
		summary: 'Login',
		description: `Authenticate with email/password → issue JWT (TTL 30 min).
      **Authentication flow:**
      1. Check workspace status = active
      2. Check lockout (lock 15 min after 5 failed attempts)
      3. Verify password (bcrypt)
      4. Register session in Redis (TTL 1800s)
      5. Issue JWT containing: sub, workspaceId, role, sessionId, jti

      **Session Timeout:**
      - Duration: 30 min inactivity
      - Warning: show popup at minute 28 (${SESSION_WARNING_SECONDS}s remaining)
      - Frontend calls POST /auth/refresh to extend`,
	})
	@ApiBody({ type: LoginDto })
	@ApiResponse({
		status: 200,
		description: `Login successful. Returns either:
			- **Normal flow**: \`{ accessToken, expiresIn, sessionWarningAt }\`.
			- **First-login flow** (when the account has \`mustChangePassword=true\`): \`{ requiresPasswordChange: true, changeToken, expiresIn }\`. Use the \`changeToken\` on \`POST /auth/complete-registration\` to set a new password.
			- **Multi-role flow**: \`{ requiresRoleSelection: true, roleSelectionToken, roles, expiresIn }\`. Use \`POST /auth/select-role\` with the selected role to receive the access token.`,
		schema: {
			oneOf: [
				{
					properties: {
						accessToken: { type: 'string', description: 'JWT access token' },
						expiresIn: {
							type: 'number',
							description: 'TTL (seconds)',
							example: 1800,
						},
						sessionWarningAt: {
							type: 'number',
							description: 'Show warning when this many seconds remaining',
							example: 1680,
						},
					},
				},
				{
					properties: {
						requiresPasswordChange: { type: 'boolean', example: true },
						changeToken: {
							type: 'string',
							description:
								'Short-lived JWT, only valid for complete-registration',
						},
						expiresIn: { type: 'number', example: 900 },
					},
				},
				{
					properties: {
						requiresRoleSelection: { type: 'boolean', example: true },
						roleSelectionToken: { type: 'string' },
						roles: {
							type: 'array',
							items: { type: 'string' },
							example: ['company_admin', 'supplier_manager'],
						},
						expiresIn: { type: 'number', example: 300 },
					},
				},
			],
		},
	})
	@ApiResponse({ status: 401, description: 'Email or password is incorrect' })
	@ApiResponse({
		status: 403,
		description: 'Workspace not active / Account is locked',
	})
	@SkipGlobalAudit()
	async login(@Body() dto: LoginDto, @Req() req: Request) {
		const ipAddress = getClientIp(req);
		const userAgent = req.get('user-agent');

		return this.authService.login(
			dto.email,
			dto.password,
			ipAddress,
			userAgent,
		);
	}

	// POST /auth/select-role (Public, roleSelectionToken)
	@Post('select-role')
	@HttpCode(HttpStatus.OK)
	@RateLimit({
		name: 'auth-select-role',
		limit: 20,
		windowMs: 60_000,
		keyBy: 'ip',
	})
	@UseGuards(RateLimitGuard)
	@ApiOperation({
		summary: 'Select active role',
		description:
			'Consumes the short-lived roleSelectionToken returned by login/complete-registration for multi-role users and issues an access token with the selected active role.',
	})
	@ApiBody({ type: SelectRoleDto })
	@ApiResponse({
		status: 200,
		description: 'Role selected, access token issued',
		schema: {
			properties: {
				accessToken: { type: 'string' },
				expiresIn: { type: 'number', example: 1800 },
				sessionWarningAt: { type: 'number', example: 1680 },
			},
		},
	})
	@ApiResponse({
		status: 401,
		description: 'Role selection token is invalid or expired',
	})
	@ApiResponse({ status: 403, description: 'Selected role is not assigned' })
	@SkipGlobalAudit()
	async selectRole(@Body() dto: SelectRoleDto, @Req() req: Request) {
		const ipAddress = getClientIp(req);
		const userAgent = req.get('user-agent');

		return this.authService.selectRole(
			dto.roleSelectionToken,
			dto.role,
			ipAddress,
			userAgent,
		);
	}

	// POST /auth/logout (Authenticated)
	@Post('logout')
	@HttpCode(HttpStatus.OK)
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth('access-token')
	@ApiOperation({
		summary: 'Logout',
		description: 'Revoke session in Redis, JWT becomes invalid immediately.',
	})
	@ApiResponse({ status: 200, description: 'Logout successful' })
	@ApiResponse({ status: 401, description: 'Token is invalid or expired' })
	@SkipGlobalAudit()
	async logout(@Req() req: Request) {
		const payload = getRequestUser<JwtPayload>(req);
		const ipAddress = getClientIp(req);
		const userAgent = req.get('user-agent');

		await this.authService.logout(payload, ipAddress, userAgent);

		return { message: 'Logout successful' };
	}

	// POST /auth/refresh (Authenticated)
	@Post('refresh')
	@HttpCode(HttpStatus.OK)
	@RateLimit({
		name: 'auth-refresh',
		limit: 30,
		windowMs: 60_000,
		keyBy: 'user',
	})
	@UseGuards(JwtAuthGuard, RateLimitGuard)
	@ApiBearerAuth('access-token')
	@ApiOperation({
		summary: 'Extend login session',
		description: `Revoke old session → create new session (TTL 30 min) → issue new JWT.
    
Frontend calls this endpoint when user clicks "Extend Session" in the final 2-minute warning popup.`,
	})
	@ApiResponse({
		status: 200,
		description: 'New token issued',
		schema: {
			properties: {
				accessToken: { type: 'string' },
				expiresIn: { type: 'number', example: 1800 },
				sessionWarningAt: { type: 'number', example: 1680 },
			},
		},
	})
	@ApiResponse({ status: 401, description: 'Current token is invalid' })
	async refresh(@Req() req: Request) {
		const payload = getRequestUser<JwtPayload>(req);
		const ipAddress = getClientIp(req);
		const userAgent = req.get('user-agent');

		return this.authService.refreshToken(payload, ipAddress, userAgent);
	}

	// PATCH /auth/change-password (Authenticated)
	@Patch('change-password')
	@RateLimit({
		name: 'auth-change-password',
		limit: 5,
		windowMs: 60_000,
		keyBy: 'user',
	})
	@UseGuards(JwtAuthGuard, RateLimitGuard)
	@ApiBearerAuth('access-token')
	@ApiOperation({
		summary: 'Change password',
		description: `Verify old password → hash new password → revoke all sessions → issue new JWT. 
      All other login sessions (on other devices) will be logged out immediately.`,
	})
	@ApiBody({ type: ChangePasswordDto })
	@ApiResponse({
		status: 200,
		description: 'Password changed successfully, return new JWT',
		schema: {
			properties: {
				accessToken: { type: 'string' },
				expiresIn: { type: 'number', example: 1800 },
				sessionWarningAt: { type: 'number', example: 1680 },
			},
		},
	})
	@ApiResponse({ status: 401, description: 'Current password is incorrect' })
	@SkipGlobalAudit()
	async changePassword(@Body() dto: ChangePasswordDto, @Req() req: Request) {
		const payload = getRequestUser<JwtPayload>(req);
		const ipAddress = getClientIp(req);
		const userAgent = req.get('user-agent');

		return this.authService.changePassword(
			payload,
			dto.currentPassword,
			dto.newPassword,
			ipAddress,
			userAgent,
		);
	}

	// POST /auth/complete-registration (changeToken)
	@Post('complete-registration')
	@HttpCode(HttpStatus.OK)
	@RateLimit({
		name: 'auth-complete-registration',
		limit: 5,
		windowMs: 60_000,
		keyBy: 'ip',
	})
	@UseGuards(CompleteRegistrationGuard, RateLimitGuard)
	@ApiOperation({
		summary: 'Complete first-login by setting a new password',
		description: `Consumes the short-lived \`changeToken\` returned by \`POST /auth/login\` when \`mustChangePassword=true\`. The token must be passed via the \`Authorization: Bearer <changeToken>\` header. On success returns a fresh access token; the change token is blacklisted in Redis so it cannot be reused.`,
	})
	@ApiBody({ type: CompleteRegistrationDto })
	@ApiResponse({
		status: 200,
		description: 'Password updated, returns access token + session',
		schema: {
			properties: {
				accessToken: { type: 'string' },
				expiresIn: { type: 'number', example: 1800 },
				sessionWarningAt: { type: 'number', example: 1680 },
			},
		},
	})
	@ApiResponse({
		status: 401,
		description: 'Change token is missing, invalid, expired, or already used',
	})
	@SkipGlobalAudit()
	async completeRegistration(
		@Body() dto: CompleteRegistrationDto,
		@Req() req: Request,
	) {
		const payload = getRequestUser<ChangeTokenPayload>(req);
		const ipAddress = getClientIp(req);
		const userAgent = req.get('user-agent');

		return this.authService.completeRegistration(
			payload,
			dto.newPassword,
			ipAddress,
			userAgent,
		);
	}

	// GET /auth/me (Authenticated)
	@Get('me')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth('access-token')
	@ApiOperation({
		summary: 'Current user information',
		description: 'Get current logged-in user information from JWT payload.',
	})
	@ApiResponse({
		status: 200,
		description: 'User information',
		schema: {
			properties: {
				id: { type: 'string', format: 'uuid' },
				email: { type: 'string', format: 'email' },
				firstName: { type: 'string', nullable: true },
				lastName: { type: 'string', nullable: true },
				role: { type: 'string' },
				roles: { type: 'array', items: { type: 'string' } },
				workspaceId: { type: 'string', format: 'uuid' },
				lastLoginAt: { type: 'string', nullable: true },
			},
		},
	})
	@ApiResponse({ status: 401, description: 'Token is invalid' })
	async getMe(@Req() req: Request) {
		const payload = getRequestUser<JwtPayload>(req);
		return this.authService.getMe(payload.sub, payload.role);
	}
}
