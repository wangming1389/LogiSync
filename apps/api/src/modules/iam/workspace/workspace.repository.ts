/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import { and, eq, sql } from 'drizzle-orm';
import { ClsService } from 'nestjs-cls';
import { BaseRepository } from '../../../core/database/base.repository';
import { schema } from '../../../infrastructure/database';

type Workspace = typeof schema.workspaces.$inferSelect;

@Injectable()
export class WorkspaceRepository extends BaseRepository {
	constructor(cls: ClsService) {
		super(cls);
	}

	// Check if taxId exists.
	async findByTaxId(taxId: string, tx?: any) {
		const runner = tx || this.db;
		const [workspace] = await runner
			.select({ id: schema.workspaces.id })
			.from(schema.workspaces)
			.where(eq(schema.workspaces.taxId, taxId));
		return workspace;
	}

	// Check if slug exists.
	async findBySlug(slug: string, tx?: any) {
		const runner = tx || this.db;
		const [workspace] = await runner
			.select({ id: schema.workspaces.id })
			.from(schema.workspaces)
			.where(eq(schema.workspaces.slug, slug));
		return workspace;
	}

	// Create a new workspace.
	async create(data: typeof schema.workspaces.$inferInsert, tx?: any) {
		const runner = tx || this.db;
		const [workspace] = await runner
			.insert(schema.workspaces)
			.values(data)
			.returning();
		return workspace;
	}

	// Find a workspace by ID.
	// For workspace repository, we might not strictly enforce getRequiredWorkspaceId
	// because admin services or public APIs might access it.
	async findById(id: string, tx?: any): Promise<Workspace | undefined> {
		const runner = tx || this.db;
		const [workspace] = await runner
			.select()
			.from(schema.workspaces)
			.where(eq(schema.workspaces.id, id));
		return workspace;
	}

	// Find all workspaces with filters.
	async findAll(
		filter: { status?: string; page: number; limit: number },
		tx?: any,
	) {
		const runner = tx || this.db;
		const conditions: any[] = [];
		if (filter.status) {
			conditions.push(eq(schema.workspaces.status, filter.status));
		}
		const offset = (filter.page - 1) * filter.limit;

		const [items, countResult] = await Promise.all([
			runner
				.select()
				.from(schema.workspaces)
				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
				.where(conditions.length > 0 ? and(...conditions) : undefined)
				.limit(filter.limit)
				.offset(offset)
				.orderBy(schema.workspaces.createdAt),
			runner
				.select({ count: sql<number>`count(*)` })
				.from(schema.workspaces)
				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
				.where(conditions.length > 0 ? and(...conditions) : undefined),
		]);

		return {
			items,
			total: Number(countResult[0]?.count ?? 0),
			page: filter.page,
			limit: filter.limit,
		};
	}

	// Update a workspace.
	async update(
		id: string,
		data: Partial<typeof schema.workspaces.$inferInsert>,
		tx?: any,
	) {
		const runner = tx || this.db;
		const [updated] = await runner
			.update(schema.workspaces)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(schema.workspaces.id, id))
			.returning();
		return updated;
	}

	// Add role to a workspace.
	async enableRole(
		workspaceId: string,
		role: string,
		actorId: string,
		tx?: any,
	) {
		const runner = tx || this.db;

		const [existing] = await runner
			.select()
			.from(schema.workspaceEnabledRoles)
			.where(
				and(
					eq(schema.workspaceEnabledRoles.workspaceId, workspaceId),
					eq(schema.workspaceEnabledRoles.role, role),
				),
			);

		if (existing) {
			return { existing: true, role: existing };
		}

		const [enabledRole] = await runner
			.insert(schema.workspaceEnabledRoles)
			.values({
				workspaceId,
				role,
				enabledBy: actorId,
			})
			.returning();

		return { existing: false, role: enabledRole };
	}
}
