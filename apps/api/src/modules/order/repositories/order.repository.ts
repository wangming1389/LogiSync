/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import { and, desc, eq, gte, inArray, isNull, lte, or, sql } from 'drizzle-orm';
import { ClsService } from 'nestjs-cls';
import { buildPaginationMeta } from '../../../common/utils/pagination.utils';
import { BaseRepository } from '../../../core/database/base.repository';
import {
	getActiveTransaction,
	runInTransactionContext,
} from '../../../core/database/transaction-context';
import { getDatabase, schema } from '../../../infrastructure/database';
import type {
	GoodsReceiptConfirmationType,
	OrderStatus,
} from '../enums/order.enums';

export interface ListOrdersParams {
	role: string;
	userId: string;
	workspaceId: string;
	status?: string;
	limit: number;
	offset: number;
}

export interface ConfirmReceiptParams {
	orderId: string;
	confirmationType: GoodsReceiptConfirmationType;
	confirmedBy: string | null;
	confirmedAt: Date;
}

@Injectable()
export class OrderRepository extends BaseRepository {
	constructor(cls: ClsService) {
		super(cls);
	}

	async runInTransaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
		const activeTx = getActiveTransaction(this.cls);
		if (activeTx) {
			return callback(activeTx);
		}

		return getDatabase().transaction((tx) =>
			runInTransactionContext(this.cls, tx, callback),
		);
	}

	async listOrders(params: ListOrdersParams, tx?: any) {
		const runner = tx || this.db;
		const conditions: any[] = [
			this.scopeCondition(params.role, params.workspaceId),
		];
		if (this.isStaffRole(params.role)) {
			conditions.push(eq(schema.purchaseOrders.assignedTo, params.userId));
		}
		if (params.status) {
			conditions.push(eq(schema.purchaseOrders.status, params.status));
		}

		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		const whereClause = and(...(conditions as any));
		const [items, countResult] = await Promise.all([
			runner
				.select()
				.from(schema.purchaseOrders)
				.where(whereClause)
				.orderBy(desc(schema.purchaseOrders.createdAt))
				.limit(params.limit)
				.offset(params.offset),
			runner
				.select({ count: sql<number>`count(*)::int` })
				.from(schema.purchaseOrders)
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

	async findVisibleById(
		orderId: string,
		role: string,
		workspaceId: string,
		userId?: string,
		tx?: any,
	) {
		const runner = tx || this.db;
		const conditions: any[] = [
			eq(schema.purchaseOrders.id, orderId),
			this.scopeCondition(role, workspaceId),
		];
		if (userId && this.isStaffRole(role)) {
			conditions.push(eq(schema.purchaseOrders.assignedTo, userId));
		}

		const [order] = await runner
			.select()
			.from(schema.purchaseOrders)
			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			.where(and(...(conditions as any)));
		return order;
	}

	async findForUpdateBySupplier(
		orderId: string,
		supplierWorkspaceId: string,
		status: OrderStatus,
		tx: any,
	) {
		const [order] = await tx
			.select()
			.from(schema.purchaseOrders)
			.where(
				and(
					eq(schema.purchaseOrders.id, orderId),
					eq(schema.purchaseOrders.supplierWorkspaceId, supplierWorkspaceId),
					eq(schema.purchaseOrders.status, status),
				),
			)
			.for('update');
		return order;
	}

	async findForUpdateByBuyer(
		orderId: string,
		buyerWorkspaceId: string,
		status: OrderStatus,
		tx: any,
	) {
		const [order] = await tx
			.select()
			.from(schema.purchaseOrders)
			.where(
				and(
					eq(schema.purchaseOrders.id, orderId),
					eq(schema.purchaseOrders.buyerWorkspaceId, buyerWorkspaceId),
					eq(schema.purchaseOrders.status, status),
				),
			)
			.for('update');
		return order;
	}

	async updateOrder(
		orderId: string,
		data: Partial<typeof schema.purchaseOrders.$inferInsert>,
		tx: any,
	) {
		const [updated] = await tx
			.update(schema.purchaseOrders)
			.set(data)
			.where(eq(schema.purchaseOrders.id, orderId))
			.returning();
		return updated;
	}

	async insertStatusHistory(
		data: typeof schema.orderStatusHistory.$inferInsert,
		tx: any,
	) {
		const [history] = await tx
			.insert(schema.orderStatusHistory)
			.values(data)
			.returning();
		return history;
	}

	async insertGoodsReceipt(data: ConfirmReceiptParams, tx: any) {
		const [receipt] = await tx
			.insert(schema.goodsReceipts)
			.values({
				purchaseOrderId: data.orderId,
				confirmationType: data.confirmationType,
				confirmedBy: data.confirmedBy,
				confirmedAt: data.confirmedAt,
				isLocked: true,
			})
			.returning();
		return receipt;
	}

	async closeOpenAssignment(orderId: string, unassignedAt: Date, tx: any) {
		await tx
			.update(schema.orderAssignmentHistory)
			.set({ unassignedAt })
			.where(
				and(
					eq(schema.orderAssignmentHistory.orderId, orderId),
					isNull(schema.orderAssignmentHistory.unassignedAt),
				),
			);
	}

	async insertAssignmentHistory(
		data: typeof schema.orderAssignmentHistory.$inferInsert,
		tx: any,
	) {
		const [assignment] = await tx
			.insert(schema.orderAssignmentHistory)
			.values(data)
			.returning();
		return assignment;
	}

	listStatusHistory(orderId: string, tx?: any) {
		const runner = tx || this.db;
		return runner
			.select()
			.from(schema.orderStatusHistory)
			.where(eq(schema.orderStatusHistory.orderId, orderId))
			.orderBy(schema.orderStatusHistory.changedAt);
	}

	listAssignmentHistory(orderId: string, tx?: any) {
		const runner = tx || this.db;
		return runner
			.select()
			.from(schema.orderAssignmentHistory)
			.where(eq(schema.orderAssignmentHistory.orderId, orderId))
			.orderBy(schema.orderAssignmentHistory.assignedAt);
	}

	async findAssignableUser(
		userId: string,
		workspaceId: string,
		roles: string[],
		tx?: any,
	) {
		const runner = tx || this.db;
		const [user] = await runner
			.select()
			.from(schema.users)
			.where(
				and(
					eq(schema.users.id, userId),
					eq(schema.users.workspaceId, workspaceId),
					eq(schema.users.isActive, true),
					inArray(schema.users.role, roles),
				),
			);
		return user;
	}

	listForExport(
		role: string,
		workspaceId: string,
		startDate: Date,
		endDate: Date,
		tx?: any,
	) {
		const runner = tx || this.db;
		return runner
			.select()
			.from(schema.purchaseOrders)
			.where(
				and(
					this.scopeCondition(role, workspaceId),
					gte(schema.purchaseOrders.createdAt, startDate),
					lte(schema.purchaseOrders.createdAt, endDate),
				),
			)
			.orderBy(desc(schema.purchaseOrders.createdAt));
	}

	listDueAutoConfirmOrders(tx: any) {
		return tx
			.select()
			.from(schema.purchaseOrders)
			.where(
				and(
					eq(schema.purchaseOrders.status, 'approved'),
					lte(schema.purchaseOrders.autoConfirmAt, new Date()),
				),
			)
			.for('update', { skipLocked: true });
	}

	private scopeCondition(role: string, workspaceId: string) {
		if (role.startsWith('buyer') || role === 'company_admin') {
			return eq(schema.purchaseOrders.buyerWorkspaceId, workspaceId);
		}
		if (role.startsWith('supplier')) {
			return eq(schema.purchaseOrders.supplierWorkspaceId, workspaceId);
		}
		return or(
			eq(schema.purchaseOrders.buyerWorkspaceId, workspaceId),
			eq(schema.purchaseOrders.supplierWorkspaceId, workspaceId),
		);
	}

	private isStaffRole(role: string) {
		return role === 'buyer_staff' || role === 'supplier_staff';
	}
}
