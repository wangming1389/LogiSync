/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/require-await */
import { Injectable } from '@nestjs/common';
import { and, eq, ne, or } from 'drizzle-orm';
import { ClsService } from 'nestjs-cls';
import { BaseRepository } from '../../../core/database/base.repository';
import { schema } from '../../../infrastructure/database';

@Injectable()
export class UomRepository extends BaseRepository {
	constructor(cls: ClsService) {
		super(cls);
	}

	async findAll(tx?: any) {
		const runner = tx || this.db;
		return runner
			.select()
			.from(schema.unitsOfMeasure)
			.orderBy(schema.unitsOfMeasure.createdAt);
	}

	async findAllActive(tx?: any) {
		const runner = tx || this.db;
		return runner
			.select()
			.from(schema.unitsOfMeasure)
			.where(eq(schema.unitsOfMeasure.isActive, true))
			.orderBy(schema.unitsOfMeasure.createdAt);
	}

	async findById(id: string, tx?: any) {
		const runner = tx || this.db;
		const [uom] = await runner
			.select()
			.from(schema.unitsOfMeasure)
			.where(eq(schema.unitsOfMeasure.id, id));
		return uom;
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
				eq(schema.unitsOfMeasure.name, name),
				eq(schema.unitsOfMeasure.code, code),
			),
		];
		if (excludeId) {
			conditions.push(ne(schema.unitsOfMeasure.id, excludeId));
		}
		const [existing] = await runner
			.select()
			.from(schema.unitsOfMeasure)
			.where(and(...conditions));
		return existing;
	}

	async create(data: typeof schema.unitsOfMeasure.$inferInsert, tx?: any) {
		const runner = tx || this.db;
		const [uom] = await runner
			.insert(schema.unitsOfMeasure)
			.values(data)
			.returning();
		return uom;
	}

	async update(
		id: string,
		data: Partial<typeof schema.unitsOfMeasure.$inferInsert>,
		tx?: any,
	) {
		const runner = tx || this.db;
		const [updated] = await runner
			.update(schema.unitsOfMeasure)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(schema.unitsOfMeasure.id, id))
			.returning();
		return updated;
	}

	async disable(id: string, tx?: any) {
		const runner = tx || this.db;
		const [updated] = await runner
			.update(schema.unitsOfMeasure)
			.set({
				isActive: false,
				disabledAt: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(schema.unitsOfMeasure.id, id))
			.returning();
		return updated;
	}

	async enable(id: string, tx?: any) {
		const runner = tx || this.db;
		const [updated] = await runner
			.update(schema.unitsOfMeasure)
			.set({
				isActive: true,
				disabledAt: null,
				updatedAt: new Date(),
			})
			.where(eq(schema.unitsOfMeasure.id, id))
			.returning();
		return updated;
	}
}
