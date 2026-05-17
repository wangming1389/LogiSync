/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
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
import { getClientIp } from '../../../../common/utils/request.utils';
import { SESSION_WARNING_SECONDS } from '../constants/auth.constants';
import { ChangePasswordDto, type JwtPayload, LoginDto } from '../dtos/auth.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthService } from '../services/auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	// POST /auth/login (Public)
	@Post('login')
	@HttpCode(HttpStatus.OK)
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
		description: 'Login successful, return JWT',
		schema: {
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
	})
	@ApiResponse({ status: 401, description: 'Email or password is incorrect' })
	@ApiResponse({
		status: 403,
		description: 'Workspace not active / Account is locked',
	})
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
	async logout(@Req() req: Request) {
		const payload = (req as any).user as JwtPayload;
		const ipAddress = getClientIp(req);
		const userAgent = req.get('user-agent');

		await this.authService.logout(payload, ipAddress, userAgent);

		return { message: 'Logout successful' };
	}

	// POST /auth/refresh (Authenticated)
	@Post('refresh')
	@HttpCode(HttpStatus.OK)
	@UseGuards(JwtAuthGuard)
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
		const payload = (req as any).user as JwtPayload;
		const ipAddress = getClientIp(req);
		const userAgent = req.get('user-agent');

		return this.authService.refreshToken(payload, ipAddress, userAgent);
	}

	// PATCH /auth/change-password (Authenticated)
	@Patch('change-password')
	@UseGuards(JwtAuthGuard)
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
	async changePassword(@Body() dto: ChangePasswordDto, @Req() req: Request) {
		const payload = (req as any).user as JwtPayload;
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
				workspaceId: { type: 'string', format: 'uuid' },
				lastLoginAt: { type: 'string', nullable: true },
			},
		},
	})
	@ApiResponse({ status: 401, description: 'Token is invalid' })
	async getMe(@Req() req: Request) {
		const payload = (req as any).user as JwtPayload;
		return this.authService.getMe(payload.sub);
	}
}
