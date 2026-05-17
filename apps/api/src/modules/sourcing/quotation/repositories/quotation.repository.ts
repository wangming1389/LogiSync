/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/require-await */
import { Injectable } from '@nestjs/common';
import { and, desc, eq, ne, sql } from 'drizzle-orm';
import { ClsService } from 'nestjs-cls';
import { BaseRepository } from '../../../../core/database/base.repository';
import { schema } from '../../../../infrastructure/database';

@Injectable()
export class QuotationRepository extends BaseRepository {
	constructor(cls: ClsService) {
		super(cls);
	}

	async findById(id: string, tx?: any) {
		const runner = tx || this.db;
		const [quotation] = await runner
			.select()
			.from(schema.quotations)
			.where(eq(schema.quotations.id, id));
		return quotation;
	}

	// Pessimistic row lock for the selectQuotation transaction (US-64).
	async findByIdForUpdate(id: string, tx: any) {
		const [quotation] = await tx
			.select()
			.from(schema.quotations)
			.where(eq(schema.quotations.id, id))
			.for('update');
		return quotation;
	}

	async findByRfqAndSupplier(
		rfqId: string,
		supplierWorkspaceId: string,
		tx?: any,
	) {
		const runner = tx || this.db;
		const [quotation] = await runner
			.select()
			.from(schema.quotations)
			.where(
				and(
					eq(schema.quotations.rfqId, rfqId),
					eq(schema.quotations.supplierWorkspaceId, supplierWorkspaceId),
				),
			);
		return quotation;
	}

	async createQuotation(data: typeof schema.quotations.$inferInsert, tx?: any) {
		const runner = tx || this.db;
		const [quotation] = await runner
			.insert(schema.quotations)
			.values(data)
			.returning();
		return quotation;
	}

	async updateQuotation(
		id: string,
		data: Partial<typeof schema.quotations.$inferInsert>,
		tx?: any,
	) {
		const runner = tx || this.db;
		const [updated] = await runner
			.update(schema.quotations)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(schema.quotations.id, id))
			.returning();
		return updated;
	}

	async rejectOtherQuotationsForRfq(
		rfqId: string,
		selectedId: string,
		tx: any,
	) {
		await tx
			.update(schema.quotations)
			.set({ status: 'rejected', updatedAt: new Date() })
			.where(
				and(
					eq(schema.quotations.rfqId, rfqId),
					ne(schema.quotations.id, selectedId),
				),
			);
	}

	async cancelSiblingChildRfqs(
		parentRfqId: string,
		selectedSupplierWorkspaceId: string,
		tx: any,
	) {
		await tx
			.update(schema.rfqs)
			.set({ status: 'cancelled', updatedAt: new Date() })
			.where(
				and(
					eq(schema.rfqs.parentRfqId, parentRfqId),
					ne(schema.rfqs.supplierWorkspaceId, selectedSupplierWorkspaceId),
				),
			);
	}

	async closeRfq(rfqId: string, tx: any) {
		await tx
			.update(schema.rfqs)
			.set({ status: 'closed', updatedAt: new Date() })
			.where(eq(schema.rfqs.id, rfqId));
	}

	async insertQuotationItems(
		items: (typeof schema.quotationItems.$inferInsert)[],
		tx?: any,
	) {
		if (items.length === 0) return [];
		const runner = tx || this.db;
		return runner.insert(schema.quotationItems).values(items).returning();
	}

	async createPurchaseOrder(
		data: typeof schema.purchaseOrders.$inferInsert,
		tx: any,
	) {
		const [po] = await tx
			.insert(schema.purchaseOrders)
			.values(data)
			.returning();
		return po;
	}

	// Negotiation rounds - append-only at the DB layer (trigger enforces)
	async insertNegotiationRound(
		data: typeof schema.negotiationRounds.$inferInsert,
		tx?: any,
	) {
		const runner = tx || this.db;
		const [round] = await runner
			.insert(schema.negotiationRounds)
			.values(data)
			.returning();
		return round;
	}

	async findLatestNegotiationRound(quotationId: string, tx?: any) {
		const runner = tx || this.db;
		const [latest] = await runner
			.select()
			.from(schema.negotiationRounds)
			.where(eq(schema.negotiationRounds.quotationId, quotationId))
			.orderBy(desc(schema.negotiationRounds.submittedAt))
			.limit(1);
		return latest;
	}

	async findNegotiationRoundById(roundId: string, tx?: any) {
		const runner = tx || this.db;
		const [round] = await runner
			.select()
			.from(schema.negotiationRounds)
			.where(eq(schema.negotiationRounds.id, roundId));
		return round;
	}

	async markRoundAccepted(roundId: string, tx?: any) {
		const runner = tx || this.db;
		// Trigger allows ONLY this specific update (is_accepted false -> true)
		const [updated] = await runner
			.update(schema.negotiationRounds)
			.set({ isAccepted: true })
			.where(
				and(
					eq(schema.negotiationRounds.id, roundId),
					eq(schema.negotiationRounds.isAccepted, false),
				),
			)
			.returning();
		return updated;
	}

	async listNegotiationRounds(quotationId: string, tx?: any) {
		const runner = tx || this.db;
		return runner
			.select()
			.from(schema.negotiationRounds)
			.where(eq(schema.negotiationRounds.quotationId, quotationId))
			.orderBy(schema.negotiationRounds.submittedAt);
	}

	async listItems(quotationId: string, tx?: any) {
		const runner = tx || this.db;
		return runner
			.select()
			.from(schema.quotationItems)
			.where(eq(schema.quotationItems.quotationId, quotationId));
	}

	async findRfqById(rfqId: string, tx: any) {
		const [rfq] = await tx
			.select()
			.from(schema.rfqs)
			.where(eq(schema.rfqs.id, rfqId));
		return rfq;
	}

	async sumQuotationTotalForItems(quotationId: string, tx?: any) {
		const runner = tx || this.db;
		const [row] = await runner
			.select({
				// COALESCE to treat null as 0 when there are no items for this quotation
				total: sql<number>`COALESCE(SUM(${schema.quotationItems.unitPrice} * ${schema.quotationItems.quantity}), 0)::int`,
			})
			.from(schema.quotationItems)
			.where(eq(schema.quotationItems.quotationId, quotationId));
		return row?.total ?? 0;
	}
}
