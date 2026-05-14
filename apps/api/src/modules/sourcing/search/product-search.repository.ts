/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import { Injectable } from '@nestjs/common';
import {
	and,
	asc,
	desc,
	eq,
	gte,
	ilike,
	inArray,
	lte,
	ne,
	or,
} from 'drizzle-orm';
import { ClsService } from 'nestjs-cls';
import { BaseRepository } from '../../../core/database/base.repository';
import { schema } from '../../../infrastructure/database';

export interface ProductSearchParams {
	buyerWorkspaceId: string;
	keyword?: string;
	catalogCategoryId?: string;
	minPrice?: number;
	maxPrice?: number;
	supplierWorkspaceIds?: string[];
	sortBy?: 'relevance' | 'price' | 'reputation_score';
	order?: 'asc' | 'desc';
	limit: number;
	offset: number;
}

@Injectable()
export class ProductSearchRepository extends BaseRepository {
	constructor(cls: ClsService) {
		super(cls);
	}

	async search(params: ProductSearchParams, tx?: any) {
		const runner = tx || this.db;

		const conditions: any[] = [
			eq(schema.products.status, 'active'),
			eq(schema.workspaces.status, 'active'),
			// Buyers must never see their own workspace's products in cross-tenant search
			ne(schema.products.workspaceId, params.buyerWorkspaceId),
		];

		if (params.keyword) {
			conditions.push(
				or(
					ilike(schema.products.name, `%${params.keyword}%`),
					ilike(schema.products.sku, `%${params.keyword}%`),
				),
			);
		}

		if (params.catalogCategoryId) {
			conditions.push(
				eq(
					schema.supplierCategories.catalogCategoryId,
					params.catalogCategoryId,
				),
			);
		}

		if (params.minPrice !== undefined) {
			conditions.push(gte(schema.products.unitPrice, params.minPrice));
		}

		if (params.maxPrice !== undefined) {
			conditions.push(lte(schema.products.unitPrice, params.maxPrice));
		}

		if (params.supplierWorkspaceIds && params.supplierWorkspaceIds.length > 0) {
			conditions.push(
				inArray(schema.products.workspaceId, params.supplierWorkspaceIds),
			);
		}

		const direction = params.order === 'asc' ? asc : desc;
		let orderByClause;
		switch (params.sortBy) {
			case 'price':
				orderByClause = direction(schema.products.unitPrice);
				break;
			case 'reputation_score':
			case 'relevance':
			default:
				// Default ordering - reputation re-ranking is applied in the service layer
				// using cached scores so we never compute reputation in SQL at request time.
				orderByClause = desc(schema.products.updatedAt);
				break;
		}

		const whereClause = and(...conditions);

		const baseQuery = runner
			.select({
				id: schema.products.id,
				workspaceId: schema.products.workspaceId,
				supplierCategoryId: schema.products.supplierCategoryId,
				uomId: schema.products.uomId,
				sku: schema.products.sku,
				name: schema.products.name,
				description: schema.products.description,
				unitPrice: schema.products.unitPrice,
				minOrderQty: schema.products.minOrderQty,
				status: schema.products.status,
				imageUrls: schema.products.imageUrls,
				attributes: schema.products.attributes,
				updatedAt: schema.products.updatedAt,
				supplierWorkspaceName: schema.workspaces.name,
				supplierWorkspaceSlug: schema.workspaces.slug,
				catalogCategoryId: schema.supplierCategories.catalogCategoryId,
			})
			.from(schema.products)
			.innerJoin(
				schema.supplierCategories,
				eq(schema.products.supplierCategoryId, schema.supplierCategories.id),
			)
			.innerJoin(
				schema.workspaces,
				eq(schema.products.workspaceId, schema.workspaces.id),
			)
			.where(whereClause);

		const countQuery = runner
			.select({ id: schema.products.id })
			.from(schema.products)
			.innerJoin(
				schema.supplierCategories,
				eq(schema.products.supplierCategoryId, schema.supplierCategories.id),
			)
			.innerJoin(
				schema.workspaces,
				eq(schema.products.workspaceId, schema.workspaces.id),
			)
			.where(whereClause);

		const [items, countResult] = await Promise.all([
			baseQuery
				.orderBy(orderByClause)
				.limit(params.limit)
				.offset(params.offset),
			countQuery,
		]);

		return {
			items,
			total: countResult.length,
			limit: params.limit,
			offset: params.offset,
		};
	}
}
