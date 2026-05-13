import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { getDatabase, schema } from '../../infrastructure/database';
import { SessionRegistryService } from '../session/session-registry.service';

const LOCKOUT_DURATION_MS = 15 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;

@Injectable()
export class SecurityService {
	constructor(
		@Inject(forwardRef(() => SessionRegistryService))
		private readonly sessionRegistryService: SessionRegistryService,
	) {}

	async recordFailedLogin(email: string): Promise<void> {
		const db = getDatabase();
		const [user] = await db
			.select()
			.from(schema.users)
			.where(eq(schema.users.email, email));

		if (!user) return;

		const newAttempts = (user.failedLoginAttempts ?? 0) + 1;
		const updates: { failedLoginAttempts: number; lockoutUntil?: Date | null } =
			{
				failedLoginAttempts: newAttempts,
			};

		if (newAttempts >= MAX_FAILED_ATTEMPTS) {
			updates.lockoutUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
		}

		await db
			.update(schema.users)
			.set(updates)
			.where(eq(schema.users.id, user.id));
	}

	async recordSuccessfulLogin(userId: string): Promise<void> {
		const db = getDatabase();
		await db
			.update(schema.users)
			.set({
				failedLoginAttempts: 0,
				lockoutUntil: null,
				lastLoginAt: new Date(),
			})
			.where(eq(schema.users.id, userId));
	}

	async isAccountLocked(email: string): Promise<boolean> {
		const db = getDatabase();
		const [user] = await db
			.select()
			.from(schema.users)
			.where(eq(schema.users.email, email));

		if (!user) return false;

		if (user.lockoutUntil && user.lockoutUntil < new Date()) {
			await db
				.update(schema.users)
				.set({ lockoutUntil: null, failedLoginAttempts: 0 })
				.where(eq(schema.users.id, user.id));
			return false;
		}

		return !!(user.lockoutUntil && user.lockoutUntil > new Date());
	}

	// Invalidate all sessions of a user in a workspace (e.g. after password change or role change)
	async invalidateAllSessions(
		userId: string,
		workspaceId: string,
	): Promise<void> {
		await this.sessionRegistryService.revokeUserSessions(userId, workspaceId);

		const db = getDatabase();
		await db
			.update(schema.sessionRegistry)
			.set({ isActive: false, revokedAt: new Date() })
			.where(
				and(
					eq(schema.sessionRegistry.userId, userId),
					eq(schema.sessionRegistry.isActive, true),
				),
			);
	}
}
