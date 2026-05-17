/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/require-await, @typescript-eslint/no-unsafe-argument */
import { Injectable } from '@nestjs/common';
import { and, asc, desc, eq, gte, ilike, lte, or, sql } from 'drizzle-orm';
import { ClsService } from 'nestjs-cls';
import { buildPaginationMeta } from '../../../../common/utils/pagination.utils';
import { BaseRepository } from '../../../../core/database/base.repository';
import { schema } from '../../../../infrastructure/database';

export interface ListProductsParams {
	keyword?: string;
	categoryId?: string;
	status?: string;
	minPrice?: number;
	maxPrice?: number;
	sortBy?: string;
	order?: string;
	limit: number;
	offset: number;
}

@Injectable()
export class ProductRepository extends BaseRepository {
	constructor(cls: ClsService) {
		super(cls);
	}

	async findAll(params: ListProductsParams, tx?: any) {
		const workspaceId = this.getRequiredWorkspaceId();
		const runner = tx || this.db;

		const conditions: any[] = [eq(schema.products.workspaceId, workspaceId)];

		if (params.keyword) {
			conditions.push(
				or(
					ilike(schema.products.name, `%${params.keyword}%`),
					ilike(schema.products.sku, `%${params.keyword}%`),
				),
			);
		}

		if (params.categoryId) {
			conditions.push(
				eq(schema.products.supplierCategoryId, params.categoryId),
			);
		}

		if (params.status) {
			conditions.push(eq(schema.products.status, params.status));
		}

		if (params.minPrice !== undefined) {
			conditions.push(gte(schema.products.unitPrice, params.minPrice));
		}

		if (params.maxPrice !== undefined) {
			conditions.push(lte(schema.products.unitPrice, params.maxPrice));
		}

		const whereClause = and(...conditions);

		let orderByClause;
		const direction = params.order === 'desc' ? desc : asc;

		switch (params.sortBy) {
			case 'name':
				orderByClause = direction(schema.products.name);
				break;
			case 'price':
				orderByClause = direction(schema.products.unitPrice);
				break;
			case 'updatedAt':
				orderByClause = direction(schema.products.updatedAt);
				break;
			default:
				orderByClause = desc(schema.products.updatedAt);
		}

		// Do two queries parallel: 1 to get paginated products, 1 to count total products matching filters
		const [items, countResult] = await Promise.all([
			runner
				.select()
				.from(schema.products)
				.where(whereClause)
				.orderBy(orderByClause)
				.limit(params.limit)
				.offset(params.offset),
			runner
				.select({ count: sql<number>`count(*)::int` })
				.from(schema.products)
				.where(whereClause),
		]);

		const total = Number(countResult[0]?.count ?? 0);
		const pagination = {
			limit: params.limit,
			offset: params.offset,
			page: Math.floor(params.offset / params.limit) + 1,
		};

		return {
			items,
			total,
			limit: params.limit,
			offset: params.offset,
			meta: buildPaginationMeta(pagination, total),
		};
	}

	async findById(id: string, tx?: any) {
		const workspaceId = this.getRequiredWorkspaceId();
		const runner = tx || this.db;
		const [product] = await runner
			.select()
			.from(schema.products)
			.where(
				and(
					eq(schema.products.id, id),
					eq(schema.products.workspaceId, workspaceId),
				),
			);
		return product;
	}

	async findBySku(sku: string, tx?: any) {
		const workspaceId = this.getRequiredWorkspaceId();
		const runner = tx || this.db;
		const [product] = await runner
			.select()
			.from(schema.products)
			.where(
				and(
					eq(schema.products.workspaceId, workspaceId),
					eq(schema.products.sku, sku),
				),
			);
		return product;
	}

	async create(data: typeof schema.products.$inferInsert, tx?: any) {
		const runner = tx || this.db;
		const [product] = await runner
			.insert(schema.products)
			.values(data)
			.returning();
		return product;
	}

	async update(
		id: string,
		data: Partial<typeof schema.products.$inferInsert>,
		tx?: any,
	) {
		const workspaceId = this.getRequiredWorkspaceId();
		const runner = tx || this.db;
		const [updated] = await runner
			.update(schema.products)
			.set({ ...data, updatedAt: new Date() })
			.where(
				and(
					eq(schema.products.id, id),
					eq(schema.products.workspaceId, workspaceId),
				),
			)
			.returning();
		return updated;
	}

	async delete(id: string, tx?: any) {
		const workspaceId = this.getRequiredWorkspaceId();
		const runner = tx || this.db;
		const [deleted] = await runner
			.delete(schema.products)
			.where(
				and(
					eq(schema.products.id, id),
					eq(schema.products.workspaceId, workspaceId),
				),
			)
			.returning();
		return deleted;
	}

	async insertPriceHistory(
		data: typeof schema.productPriceHistory.$inferInsert,
		tx?: any,
	) {
		const runner = tx || this.db;
		const [record] = await runner
			.insert(schema.productPriceHistory)
			.values(data)
			.returning();
		return record;
	}

	async getPriceHistory(productId: string, tx?: any) {
		const runner = tx || this.db;
		return runner
			.select()
			.from(schema.productPriceHistory)
			.where(eq(schema.productPriceHistory.productId, productId))
			.orderBy(desc(schema.productPriceHistory.effectiveFrom));
	}

	// Used when checking if a product can be deleted - if there are any RFQs with pending response for this product, deletion is blocked
	async countByRfqPendingResponse(productId: string, tx?: any) {
		const runner = tx || this.db;
		const rows = await runner
			.select()
			.from(schema.rfqItems)
			.innerJoin(schema.rfqs, eq(schema.rfqItems.rfqId, schema.rfqs.id))
			.where(
				and(
					eq(schema.rfqItems.productId, productId),
					eq(schema.rfqs.status, 'pending_response'),
				),
			);
		return rows.length;
	}
}
