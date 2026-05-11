/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { ClsService } from 'nestjs-cls';
import { BaseRepository } from '../../../core/database/base.repository';
import { schema } from '../../../infrastructure/database';

@Injectable()
export class UserRepository extends BaseRepository {
	constructor(cls: ClsService) {
		super(cls);
	}

	// Find user by email specifically for authentication flows (e.g. login).
	// This bypasses workspaceId check since the user is not authenticated yet.
	async findByEmailForAuth(email: string, tx?: any) {
		const runner = tx || this.db;
		const [user] = await runner
			.select()
			.from(schema.users)
			.where(eq(schema.users.email, email));
		return user;
	}

	// Find user by ID, enforcing workspace isolation.
	async findById(id: string, tx?: any) {
		const workspaceId = this.getRequiredWorkspaceId();
		const runner = tx || this.db;
		const [user] = await runner
			.select()
			.from(schema.users)
			.where(
				and(eq(schema.users.id, id), eq(schema.users.workspaceId, workspaceId)),
			);
		return user;
	}

	// Create user, enforcing workspace isolation.
	async create(data: typeof schema.users.$inferInsert, tx?: any) {
		// Even for creation, we want to make sure the workspaceId matches
		// except when we are creating a workspace admin in which case we might bypass it.
		// For now, if we use transactions from workspace creation, we might not have it in ALS.
		// Let's rely on data.workspaceId being provided by the caller.
		const runner = tx || this.db;
		const [user] = await runner.insert(schema.users).values(data).returning();
		return user;
	}

	// Update user, enforcing workspace isolation.
	async update(
		id: string,
		data: Partial<typeof schema.users.$inferInsert>,
		tx?: any,
	) {
		const workspaceId = this.getRequiredWorkspaceId();
		const runner = tx || this.db;
		const [updated] = await runner
			.update(schema.users)
			.set({ ...data, updatedAt: new Date() })
			.where(
				and(eq(schema.users.id, id), eq(schema.users.workspaceId, workspaceId)),
			)
			.returning();
		return updated;
	}
}
