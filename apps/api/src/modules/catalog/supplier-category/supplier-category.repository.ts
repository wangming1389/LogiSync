/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/require-await */
import { Injectable } from '@nestjs/common';
import { and, eq, ne } from 'drizzle-orm';
import { ClsService } from 'nestjs-cls';
import { BaseRepository } from '../../../core/database/base.repository';
import { schema } from '../../../infrastructure/database';

@Injectable()
export class SupplierCategoryRepository extends BaseRepository {
	constructor(cls: ClsService) {
		super(cls);
	}

	async findAllActive(tx?: any) {
		const workspaceId = this.getRequiredWorkspaceId();
		const runner = tx || this.db;
		return runner
			.select()
			.from(schema.supplierCategories)
			.where(
				and(
					eq(schema.supplierCategories.workspaceId, workspaceId),
					eq(schema.supplierCategories.isActive, true),
				),
			)
			.orderBy(schema.supplierCategories.createdAt);
	}

	async findById(id: string, tx?: any) {
		const workspaceId = this.getRequiredWorkspaceId();
		const runner = tx || this.db;
		const [category] = await runner
			.select()
			.from(schema.supplierCategories)
			.where(
				and(
					eq(schema.supplierCategories.id, id),
					eq(schema.supplierCategories.workspaceId, workspaceId),
					eq(schema.supplierCategories.isActive, true),
				),
			);
		return category;
	}

	async findByIdIncludeInactive(id: string, tx?: any) {
		const workspaceId = this.getRequiredWorkspaceId();
		const runner = tx || this.db;
		const [category] = await runner
			.select()
			.from(schema.supplierCategories)
			.where(
				and(
					eq(schema.supplierCategories.id, id),
					eq(schema.supplierCategories.workspaceId, workspaceId),
				),
			);
		return category;
	}

	async findByName(name: string, excludeId?: string, tx?: any) {
		const workspaceId = this.getRequiredWorkspaceId();
		const runner = tx || this.db;
		const conditions = [
			eq(schema.supplierCategories.workspaceId, workspaceId),
			eq(schema.supplierCategories.name, name),
		];
		if (excludeId) {
			conditions.push(ne(schema.supplierCategories.id, excludeId));
		}
		const [existing] = await runner
			.select()
			.from(schema.supplierCategories)
			.where(and(...conditions));
		return existing;
	}

	async checkNameAvailability(name: string, tx?: any) {
		const existing = await this.findByName(name, undefined, tx);
		return !existing;
	}

	async create(data: typeof schema.supplierCategories.$inferInsert, tx?: any) {
		const runner = tx || this.db;
		const [category] = await runner
			.insert(schema.supplierCategories)
			.values(data)
			.returning();
		return category;
	}

	async update(
		id: string,
		data: Partial<typeof schema.supplierCategories.$inferInsert>,
		tx?: any,
	) {
		const workspaceId = this.getRequiredWorkspaceId();
		const runner = tx || this.db;
		const [updated] = await runner
			.update(schema.supplierCategories)
			.set({ ...data, updatedAt: new Date() })
			.where(
				and(
					eq(schema.supplierCategories.id, id),
					eq(schema.supplierCategories.workspaceId, workspaceId),
				),
			)
			.returning();
		return updated;
	}

	async softDelete(id: string, tx?: any) {
		const workspaceId = this.getRequiredWorkspaceId();
		const runner = tx || this.db;
		const [updated] = await runner
			.update(schema.supplierCategories)
			.set({ isActive: false, updatedAt: new Date() })
			.where(
				and(
					eq(schema.supplierCategories.id, id),
					eq(schema.supplierCategories.workspaceId, workspaceId),
				),
			)
			.returning();
		return updated;
	}

	async countProductsByCategory(categoryId: string, tx?: any) {
		const runner = tx || this.db;
		const rows = await runner
			.select()
			.from(schema.products)
			.where(eq(schema.products.supplierCategoryId, categoryId));
		return rows.length;
	}
}
