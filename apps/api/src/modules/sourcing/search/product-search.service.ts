/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import { Injectable } from '@nestjs/common';
import { SessionRegistryService } from '../../../core/session/session-registry.service';
import type { ProductSearchQueryDto } from './product-search.dto';
import { ProductSearchRepository } from './product-search.repository';

// Persisted search filter survives Buyer page reloads (BR-384)
const SEARCH_FILTER_TTL_SECONDS = 60 * 60 * 24; // 24h
const searchFilterKey = (userId: string) => `session:search:${userId}`;
const reputationKey = (supplierWorkspaceId: string) =>
	`reputation:${supplierWorkspaceId}`;

@Injectable()
export class ProductSearchService {
	constructor(
		private readonly productSearchRepo: ProductSearchRepository,
		private readonly sessionRegistry: SessionRegistryService,
	) {}

	async search(
		query: ProductSearchQueryDto,
		buyerWorkspaceId: string,
		userId: string,
	) {
		// BR-384: persist the supplier filter to Redis when present,
		// load the previously saved filter when the caller omits it entirely.
		let supplierWorkspaceIds = query.supplierWorkspaceIds;
		if (supplierWorkspaceIds && supplierWorkspaceIds.length > 0) {
			await this.sessionRegistry.setJsonEx(
				searchFilterKey(userId),
				supplierWorkspaceIds,
				SEARCH_FILTER_TTL_SECONDS,
			);
		} else if (supplierWorkspaceIds === undefined) {
			const cached = await this.sessionRegistry.getJson<string[]>(
				searchFilterKey(userId),
			);
			if (cached && cached.length > 0) {
				supplierWorkspaceIds = cached;
			}
		}

		const result = await this.productSearchRepo.search({
			buyerWorkspaceId,
			keyword: query.keyword,
			catalogCategoryId: query.catalogCategoryId,
			minPrice: query.minPrice,
			maxPrice: query.maxPrice,
			supplierWorkspaceIds,
			sortBy: query.sortBy,
			order: query.order,
			limit: query.limit,
			offset: query.offset,
		});

		const itemsWithReputation = await Promise.all(
			result.items.map(async (item: any) => ({
				...item,
				reputationScore: await this.loadReputationScore(item.workspaceId),
			})),
		);

		// Apply reputation-based ordering when requested, using cached scores only
		let ordered = itemsWithReputation;
		if (query.sortBy === 'reputation_score') {
			const direction = query.order === 'asc' ? 1 : -1;
			ordered = [...itemsWithReputation].sort(
				(a, b) =>
					((a.reputationScore ?? 0) - (b.reputationScore ?? 0)) * direction,
			);
		}

		return {
			items: ordered,
			total: result.total,
			limit: result.limit,
			offset: result.offset,
			appliedSupplierWorkspaceIds: supplierWorkspaceIds ?? null,
		};
	}

	// Reputation scores are pre-computed (e.g. via a worker) and stored in Redis under `reputation:{workspaceId}`.
	private async loadReputationScore(
		supplierWorkspaceId: string,
	): Promise<number | null> {
		const raw = await this.sessionRegistry.get(
			reputationKey(supplierWorkspaceId),
		);
		if (raw === null) return null;
		const parsed = Number(raw);
		return Number.isFinite(parsed) ? parsed : null;
	}
}
