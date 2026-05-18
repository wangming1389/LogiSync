/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import {
	ForbiddenException,
	Injectable,
	Logger,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { AuditAction, AuditStatus } from '../../../core/audit/audit.enums';
import { AuditLoggerService } from '../../../core/audit/audit-logger.service';
import { SecurityService } from '../../../core/security/security.service';
import { SessionRegistryService } from '../../../core/session/session-registry.service';
import {
	JWT_EXPIRATION_SECONDS,
	SESSION_TTL_SECONDS,
	SESSION_WARNING_SECONDS,
} from '../auth/constants/auth.constants';
import { WorkspaceRepository } from '../workspace/workspace.repository';
import { type JwtPayload } from './auth.dto';
import { UserRepository } from './user.repository';

/**
 * AuthService — Handles complete IAM authentication flow
 *
 * Security procedures:
 * 1. Pre-checks: workspace active + lockout + bcrypt compare
 * 2. Register session in Redis (TTL 30 min)
 * 3. Issue JWT with claims: sub, workspaceId, role, sessionId, jti, exp
 * 4. Audit log all login/logout/password change events
 */
@Injectable()
export class AuthService {
	private readonly logger = new Logger(AuthService.name);

	constructor(
		private readonly jwtService: JwtService,
		private readonly sessionRegistryService: SessionRegistryService,
		private readonly securityService: SecurityService,
		private readonly auditLoggerService: AuditLoggerService,
		private readonly userRepository: UserRepository,
		private readonly workspaceRepository: WorkspaceRepository,
	) {}

	async login(
		email: string,
		password: string,
		ipAddress: string,
		userAgent?: string,
	) {
		// 1. Find user by email
		const user = await this.userRepository.findByEmailForAuth(email);

		if (!user || !user.isActive) {
			throw new UnauthorizedException('Email or password is incorrect');
		}

		// 2. Check workspace must be active
		const workspace = await this.workspaceRepository.findById(user.workspaceId);

		if (!workspace || workspace.status !== 'active') {
			throw new ForbiddenException(
				'Workspace is not activated or has been suspended',
			);
		}

		// 3. Check lockout (5 failed attempts → lock 15 min)
		const isLocked = await this.securityService.isAccountLocked(email);

		if (isLocked) {
			await this.auditLoggerService.log({
				actorId: user.id,
				workspaceId: user.workspaceId,
				action: AuditAction.AUTH_LOGIN_LOCKED_FAILED,
				resourceType: 'auth',
				ipAddress,
				userAgent,
				status: AuditStatus.FAILURE,
				errorMessage: 'Account is locked due to too many failed login attempts',
			});

			throw new ForbiddenException(
				'Account is locked. Please try again after 15 minutes.',
			);
		}

		// 4. Verify password with bcrypt

		const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

		if (!isPasswordValid) {
			await this.securityService.recordFailedLogin(email);

			await this.auditLoggerService.log({
				actorId: user.id,
				workspaceId: user.workspaceId,
				action: AuditAction.AUTH_LOGIN_FAILED,
				resourceType: 'auth',
				ipAddress,
				userAgent,
				status: AuditStatus.FAILURE,
				errorMessage: 'Password is incorrect',
			});

			throw new UnauthorizedException('Email or password is incorrect');
		}

		// 5. Record successful login (reset failed attempts + lockout)
		await this.securityService.recordSuccessfulLogin(user.id);

		// 6. Create session in Redis (TTL = 30 min = 1800 seconds)
		const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;

		const sessionId = await this.sessionRegistryService.createSession({
			userId: user.id,
			workspaceId: user.workspaceId,
			expiresAt,
			ipAddress,
			userAgent,
		});

		// 7. Issue JWT
		const jti = uuid();
		const token = this.signToken({
			sub: user.id,
			workspaceId: user.workspaceId,
			workspaceSlug: workspace.slug,
			workspaceType: workspace.type,
			role: user.role,
			sessionId,
			jti,
		});

		// 8. Audit log
		await this.auditLoggerService.log({
			actorId: user.id,
			workspaceId: user.workspaceId,
			action: AuditAction.AUTH_LOGIN_SUCCESS,
			resourceType: 'auth',
			ipAddress,
			userAgent,
			status: AuditStatus.SUCCESS,
		});

		this.logger.log(
			`User ${user.email} logged in (session: ${sessionId.slice(0, 8)}...)`,
		);

		return {
			accessToken: token,
			expiresIn: JWT_EXPIRATION_SECONDS,
			sessionWarningAt: JWT_EXPIRATION_SECONDS - SESSION_WARNING_SECONDS,
		};
	}

	async logout(
		payload: JwtPayload,
		ipAddress: string,
		userAgent?: string,
	): Promise<void> {
		// Revoke session trong Redis + DB
		await this.sessionRegistryService.revokeSession(payload.sessionId);

		// Audit log
		await this.auditLoggerService.log({
			actorId: payload.sub,
			workspaceId: payload.workspaceId,
			action: AuditAction.AUTH_LOGOUT_SUCCESS,
			resourceType: 'auth',
			ipAddress,
			userAgent,
			status: AuditStatus.SUCCESS,
		});

		this.logger.log(
			`User ${payload.sub} logged out (session: ${payload.sessionId.slice(0, 8)}...)`,
		);
	}

	/**
	 * Extend login session.
	 *
	 * Flow: revoke old session → create new session → sign new JWT
	 * Frontend calls this endpoint when user clicks "Extend Session"
	 * before the final 2-minute warning expires.
	 */
	async refreshToken(
		currentPayload: JwtPayload,
		ipAddress: string,
		userAgent?: string,
	) {
		// Revoke old session
		await this.sessionRegistryService.revokeSession(currentPayload.sessionId);

		// Create new session (new TTL = 30 min)
		const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;

		const newSessionId = await this.sessionRegistryService.createSession({
			userId: currentPayload.sub,
			workspaceId: currentPayload.workspaceId,
			expiresAt,
			ipAddress,
			userAgent,
		});

		// Sign new JWT
		const jti = uuid();
		const token = this.signToken({
			sub: currentPayload.sub,
			workspaceId: currentPayload.workspaceId,
			workspaceSlug: currentPayload.workspaceSlug,
			workspaceType: currentPayload.workspaceType,
			role: currentPayload.role,
			sessionId: newSessionId,
			jti,
		});

		this.logger.debug(
			`Token refreshed for user ${currentPayload.sub} (new session: ${newSessionId.slice(0, 8)}...)`,
		);

		return {
			accessToken: token,
			expiresIn: JWT_EXPIRATION_SECONDS,
			sessionWarningAt: JWT_EXPIRATION_SECONDS - SESSION_WARNING_SECONDS,
		};
	}

	async changePassword(
		payload: JwtPayload,
		currentPassword: string,
		newPassword: string,
		ipAddress: string,
		userAgent?: string,
	) {
		// 1. Get user from DB
		const user = await this.userRepository.findById(payload.sub);

		if (!user) {
			throw new UnauthorizedException('User does not exist');
		}

		// 2. Verify current password
		const isCurrentValid = await bcrypt.compare(
			currentPassword,
			user.passwordHash,
		);

		if (!isCurrentValid) {
			await this.auditLoggerService.log({
				actorId: payload.sub,
				workspaceId: payload.workspaceId,
				action: AuditAction.AUTH_CHANGE_PASSWORD_FAILED,
				resourceType: 'auth',
				ipAddress,
				userAgent,
				status: AuditStatus.FAILURE,
				errorMessage: 'Current password is incorrect',
			});

			throw new UnauthorizedException('Current password is incorrect');
		}

		// 3. Hash new password
		const newHash = await bcrypt.hash(newPassword, 12);

		// 4. Update DB
		await this.userRepository.update(payload.sub, {
			passwordHash: newHash,
		});

		// 5. Invalidate all sessions (Redis + DB)
		await this.securityService.invalidateAllSessions(
			payload.sub,
			payload.workspaceId,
		);

		// 6. Create new session + new JWT (so user isn't kicked out)
		const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;

		const newSessionId = await this.sessionRegistryService.createSession({
			userId: payload.sub,
			workspaceId: payload.workspaceId,
			expiresAt,
			ipAddress,
			userAgent,
		});

		const jti = uuid();
		const token = this.signToken({
			sub: payload.sub,
			workspaceId: payload.workspaceId,
			workspaceSlug: payload.workspaceSlug,
			workspaceType: payload.workspaceType,
			role: payload.role,
			sessionId: newSessionId,
			jti,
		});

		// 7. Audit log
		await this.auditLoggerService.log({
			actorId: payload.sub,
			workspaceId: payload.workspaceId,
			action: AuditAction.AUTH_CHANGE_PASSWORD_SUCCESS,
			resourceType: 'auth',
			ipAddress,
			userAgent,
			status: AuditStatus.SUCCESS,
		});

		this.logger.log(`Password changed for user ${payload.sub}`);

		return {
			accessToken: token,
			expiresIn: JWT_EXPIRATION_SECONDS,
			sessionWarningAt: JWT_EXPIRATION_SECONDS - SESSION_WARNING_SECONDS,
		};
	}

	async getMe(userId: string) {
		const user = await this.userRepository.findById(userId);

		if (!user) {
			throw new UnauthorizedException('User does not exist');
		}

		const workspace = await this.workspaceRepository.findById(user.workspaceId);

		if (!workspace) {
			throw new UnauthorizedException('Workspace does not exist');
		}

		return {
			...user,
			workspaceSlug: workspace.slug,
			workspaceName: workspace.name,
			workspaceType: workspace.type,
			lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
		};
	}

	async hashPassword(password: string): Promise<string> {
		return await bcrypt.hash(password, 12);
	}

	// use JwtService to sign token with claims + expiration
	// use to generate JWT after successful login or password change
	private signToken(claims: Omit<JwtPayload, 'iat' | 'exp'>): string {
		return this.jwtService.sign(
			{
				sub: claims.sub,
				workspaceId: claims.workspaceId,
				workspaceSlug: claims.workspaceSlug,
				workspaceType: claims.workspaceType,
				role: claims.role,
				sessionId: claims.sessionId,
				jti: claims.jti,
			},
			{
				expiresIn: JWT_EXPIRATION_SECONDS,
			},
		);
	}
}
