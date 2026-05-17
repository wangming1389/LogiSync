/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/require-await */
import { Injectable } from '@nestjs/common';
import { and, desc, eq, isNotNull, sql } from 'drizzle-orm';
import { ClsService } from 'nestjs-cls';
import { buildPaginationMeta } from '../../../../common/utils/pagination.utils';
import { BaseRepository } from '../../../../core/database/base.repository';
import { schema } from '../../../../infrastructure/database';

export interface ListRfqsParams {
	status?: string;
	limit: number;
	offset: number;
}

@Injectable()
export class RfqRepository extends BaseRepository {
	constructor(cls: ClsService) {
		super(cls);
	}

	async createDraftRfq(
		data: {
			buyerWorkspaceId: string;
			createdBy: string;
			note: string | null;
		},
		tx?: any,
	) {
		const runner = tx || this.db;
		const [rfq] = await runner
			.insert(schema.rfqs)
			.values({
				buyerWorkspaceId: data.buyerWorkspaceId,
				createdBy: data.createdBy,
				note: data.note,
				status: 'draft',
				isLocked: false,
			})
			.returning();
		return rfq;
	}

	async createChildRfq(
		data: {
			buyerWorkspaceId: string;
			parentRfqId: string;
			supplierWorkspaceId: string;
			createdBy: string;
			note: string | null;
		},
		tx?: any,
	) {
		const runner = tx || this.db;
		const [rfq] = await runner
			.insert(schema.rfqs)
			.values({
				buyerWorkspaceId: data.buyerWorkspaceId,
				parentRfqId: data.parentRfqId,
				supplierWorkspaceId: data.supplierWorkspaceId,
				createdBy: data.createdBy,
				note: data.note,
				status: 'pending_response',
				isLocked: true,
				submittedAt: new Date(),
			})
			.returning();
		return rfq;
	}

	async findByIdForBuyer(id: string, tx?: any) {
		const workspaceId = this.getRequiredWorkspaceId();
		const runner = tx || this.db;
		const [rfq] = await runner
			.select()
			.from(schema.rfqs)
			.where(
				and(
					eq(schema.rfqs.id, id),
					eq(schema.rfqs.buyerWorkspaceId, workspaceId),
				),
			);
		return rfq;
	}

	async findByIdForSupplier(id: string, tx?: any) {
		const workspaceId = this.getRequiredWorkspaceId();
		const runner = tx || this.db;
		const [rfq] = await runner
			.select()
			.from(schema.rfqs)
			.where(
				and(
					eq(schema.rfqs.id, id),
					eq(schema.rfqs.supplierWorkspaceId, workspaceId),
					isNotNull(schema.rfqs.parentRfqId),
				),
			);
		return rfq;
	}

	async findByIdAnyRole(id: string, tx?: any) {
		const runner = tx || this.db;
		const [rfq] = await runner
			.select()
			.from(schema.rfqs)
			.where(eq(schema.rfqs.id, id));
		return rfq;
	}

	async listForBuyer(params: ListRfqsParams, tx?: any) {
		const workspaceId = this.getRequiredWorkspaceId();
		const runner = tx || this.db;
		const conditions: any[] = [eq(schema.rfqs.buyerWorkspaceId, workspaceId)];
		if (params.status) {
			conditions.push(eq(schema.rfqs.status, params.status));
		}
		const whereClause = and(...conditions);
		const [items, countResult] = await Promise.all([
			runner
				.select()
				.from(schema.rfqs)
				.where(whereClause)
				.orderBy(desc(schema.rfqs.updatedAt))
				.limit(params.limit)
				.offset(params.offset),
			runner
				.select({ count: sql<number>`count(*)::int` })
				.from(schema.rfqs)
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

	async listForSupplier(params: ListRfqsParams, tx?: any) {
		const workspaceId = this.getRequiredWorkspaceId();
		const runner = tx || this.db;
		// Suppliers only see Child RFQs explicitly addressed to their workspace
		const conditions: any[] = [
			eq(schema.rfqs.supplierWorkspaceId, workspaceId),
			isNotNull(schema.rfqs.parentRfqId),
		];
		if (params.status) {
			conditions.push(eq(schema.rfqs.status, params.status));
		}
		const whereClause = and(...conditions);
		const [items, countResult] = await Promise.all([
			runner
				.select()
				.from(schema.rfqs)
				.where(whereClause)
				.orderBy(desc(schema.rfqs.updatedAt))
				.limit(params.limit)
				.offset(params.offset),
			runner
				.select({ count: sql<number>`count(*)::int` })
				.from(schema.rfqs)
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

	async updateRfq(
		id: string,
		data: Partial<typeof schema.rfqs.$inferInsert>,
		tx?: any,
	) {
		const runner = tx || this.db;
		const [updated] = await runner
			.update(schema.rfqs)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(schema.rfqs.id, id))
			.returning();
		return updated;
	}

	async deleteRfq(id: string, tx?: any) {
		const workspaceId = this.getRequiredWorkspaceId();
		const runner = tx || this.db;
		const [deleted] = await runner
			.delete(schema.rfqs)
			.where(
				and(
					eq(schema.rfqs.id, id),
					eq(schema.rfqs.buyerWorkspaceId, workspaceId),
				),
			)
			.returning();
		return deleted;
	}

	async listItems(rfqId: string, tx?: any) {
		const runner = tx || this.db;
		return runner
			.select()
			.from(schema.rfqItems)
			.where(eq(schema.rfqItems.rfqId, rfqId));
	}

	async countItems(rfqId: string, tx?: any): Promise<number> {
		const runner = tx || this.db;
		const [row] = await runner
			.select({ count: sql<number>`count(*)::int` })
			.from(schema.rfqItems)
			.where(eq(schema.rfqItems.rfqId, rfqId));
		return row?.count ?? 0;
	}

	async findItemById(rfqId: string, itemId: string, tx?: any) {
		const runner = tx || this.db;
		const [item] = await runner
			.select()
			.from(schema.rfqItems)
			.where(
				and(eq(schema.rfqItems.id, itemId), eq(schema.rfqItems.rfqId, rfqId)),
			);
		return item;
	}

	// BR-387 auto-merge: ON CONFLICT (rfq_id, product_id) DO UPDATE adds quantities
	async upsertItem(
		data: {
			rfqId: string;
			productId: string;
			supplierWorkspaceId: string;
			quantity: number;
			targetPrice: number | null;
			deliveryDate: Date | null;
			deliveryLocation: string | null;
			notes: string | null;
		},
		tx?: any,
	) {
		const runner = tx || this.db;
		const [item] = await runner
			.insert(schema.rfqItems)
			.values(data)
			.onConflictDoUpdate({
				target: [schema.rfqItems.rfqId, schema.rfqItems.productId],
				set: {
					quantity: sql`${schema.rfqItems.quantity} + EXCLUDED.quantity`,
					// Latest-write-wins for the non-quantity fields when merging
					targetPrice: sql`COALESCE(EXCLUDED.target_price, ${schema.rfqItems.targetPrice})`,
					deliveryDate: sql`COALESCE(EXCLUDED.delivery_date, ${schema.rfqItems.deliveryDate})`,
					deliveryLocation: sql`COALESCE(EXCLUDED.delivery_location, ${schema.rfqItems.deliveryLocation})`,
					notes: sql`COALESCE(EXCLUDED.notes, ${schema.rfqItems.notes})`,
				},
			})
			.returning();
		return item;
	}

	async cloneItemsToChildRfq(
		params: {
			sourceRfqId: string;
			childRfqId: string;
			supplierWorkspaceId: string;
		},
		tx?: any,
	) {
		const runner = tx || this.db;
		const sourceItems: any[] = await runner
			.select()
			.from(schema.rfqItems)
			.where(
				and(
					eq(schema.rfqItems.rfqId, params.sourceRfqId),
					eq(schema.rfqItems.supplierWorkspaceId, params.supplierWorkspaceId),
				),
			);

		if (sourceItems.length === 0) return [];

		const cloned: any[] = await runner
			.insert(schema.rfqItems)
			.values(
				sourceItems.map((item) => ({
					rfqId: params.childRfqId,
					productId: item.productId,
					supplierWorkspaceId: item.supplierWorkspaceId,
					quantity: item.quantity,
					targetPrice: item.targetPrice,
					deliveryDate: item.deliveryDate,
					deliveryLocation: item.deliveryLocation,
					notes: item.notes,
				})),
			)
			.returning();
		return cloned;
	}

	async updateItem(
		rfqId: string,
		itemId: string,
		data: Partial<typeof schema.rfqItems.$inferInsert>,
		tx?: any,
	) {
		const runner = tx || this.db;
		const [updated] = await runner
			.update(schema.rfqItems)
			.set(data)
			.where(
				and(eq(schema.rfqItems.id, itemId), eq(schema.rfqItems.rfqId, rfqId)),
			)
			.returning();
		return updated;
	}

	async deleteItem(rfqId: string, itemId: string, tx?: any) {
		const runner = tx || this.db;
		const [deleted] = await runner
			.delete(schema.rfqItems)
			.where(
				and(eq(schema.rfqItems.id, itemId), eq(schema.rfqItems.rfqId, rfqId)),
			)
			.returning();
		return deleted;
	}

	async groupDraftItemsBySupplier(
		draftRfqId: string,
		tx?: any,
	): Promise<string[]> {
		const runner = tx || this.db;
		const rows: { supplierWorkspaceId: string }[] = await runner
			.selectDistinct({
				supplierWorkspaceId: schema.rfqItems.supplierWorkspaceId,
			})
			.from(schema.rfqItems)
			.where(eq(schema.rfqItems.rfqId, draftRfqId));
		return rows.map((r) => r.supplierWorkspaceId);
	}

	// Resolves a product's owning workspace - needed when inserting a new RFQ item
	// so we can stamp supplier_workspace_id without trusting the caller.
	async findProductWorkspace(
		productId: string,
		tx?: any,
	): Promise<{ workspaceId: string; status: string } | null> {
		const runner = tx || this.db;
		const [row] = await runner
			.select({
				workspaceId: schema.products.workspaceId,
				status: schema.products.status,
			})
			.from(schema.products)
			.where(eq(schema.products.id, productId));
		return row ?? null;
	}

	async listQuotationsForRfq(rfqId: string, tx?: any) {
		const runner = tx || this.db;
		return runner
			.select()
			.from(schema.quotations)
			.where(eq(schema.quotations.rfqId, rfqId))
			.orderBy(desc(schema.quotations.updatedAt));
	}
}
