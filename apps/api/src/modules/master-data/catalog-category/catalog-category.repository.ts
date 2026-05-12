/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/require-await */
import { Injectable } from '@nestjs/common';
import { and, eq, ne, or } from 'drizzle-orm';
import { ClsService } from 'nestjs-cls';
import { BaseRepository } from '../../../core/database/base.repository';
import { schema } from '../../../infrastructure/database';

@Injectable()
export class CatalogCategoryRepository extends BaseRepository {
	constructor(cls: ClsService) {
		super(cls);
	}

	async findAll(tx?: any) {
		const runner = tx || this.db;
		return runner
			.select()
			.from(schema.catalogCategories)
			.orderBy(schema.catalogCategories.createdAt);
	}

	async findAllActive(tx?: any) {
		const runner = tx || this.db;
		return runner
			.select()
			.from(schema.catalogCategories)
			.where(eq(schema.catalogCategories.isActive, true))
			.orderBy(schema.catalogCategories.createdAt);
	}

	async findById(id: string, tx?: any) {
		const runner = tx || this.db;
		const [category] = await runner
			.select()
			.from(schema.catalogCategories)
			.where(eq(schema.catalogCategories.id, id));
		return category;
	}

	async findByNameOrCode(
		name: string,
		code: string,
		excludeId?: string,
		tx?: any,
	) {
		const runner = tx || this.db;
		const conditions = [
			or(
				eq(schema.catalogCategories.name, name),
				eq(schema.catalogCategories.code, code),
			),
		];
		if (excludeId) {
			conditions.push(ne(schema.catalogCategories.id, excludeId));
		}
		const [existing] = await runner
			.select()
			.from(schema.catalogCategories)
			.where(and(...conditions));
		return existing;
	}

	async create(data: typeof schema.catalogCategories.$inferInsert, tx?: any) {
		const runner = tx || this.db;
		const [category] = await runner
			.insert(schema.catalogCategories)
			.values(data)
			.returning();
		return category;
	}

	async update(
		id: string,
		data: Partial<typeof schema.catalogCategories.$inferInsert>,
		tx?: any,
	) {
		const runner = tx || this.db;
		const [updated] = await runner
			.update(schema.catalogCategories)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(schema.catalogCategories.id, id))
			.returning();
		return updated;
	}

	async disable(id: string, tx?: any) {
		const runner = tx || this.db;
		const [updated] = await runner
			.update(schema.catalogCategories)
			.set({
				isActive: false,
				disabledAt: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(schema.catalogCategories.id, id))
			.returning();
		return updated;
	}

	async enable(id: string, tx?: any) {
		const runner = tx || this.db;
		const [updated] = await runner
			.update(schema.catalogCategories)
			.set({
				isActive: true,
				disabledAt: null,
				updatedAt: new Date(),
			})
			.where(eq(schema.catalogCategories.id, id))
			.returning();
		return updated;
	}
}
