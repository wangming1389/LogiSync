/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-enum-comparison */
import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import type { Counter } from 'prom-client';
import {
	AuditAction,
	AuditStatus,
} from '../../../core/audit/enums/audit.enums';
import { AuditLoggerService } from '../../../core/audit/services/audit-logger.service';
import {
	METRIC_ORDER_APPROVED,
	METRIC_ORDER_REJECTED,
} from '../../../core/metrics/business-metrics.providers';
import { MessageQueueService } from '../../../infrastructure/message-queue/message-queue.service';
import { UserRole } from '../../iam/auth/enums/user-role.enum';
import {
	EVENT_GOODS_RECEIPT_CONFIRMED,
	GOODS_RECEIPT_CONFIRMED_QUEUE,
	ORDER_APPROVED_QUEUE,
} from '../constants/order.constants';
import type {
	AssignOrderDto,
	ExportOrdersQueryDto,
	ListOrdersQueryDto,
	RejectOrderDto,
} from '../dtos/order.dto';
import {
	GoodsReceiptConfirmationType,
	ORDER_BUYER_ASSIGNABLE_ROLES,
	ORDER_READ_ROLES,
	ORDER_SUPPLIER_ASSIGNABLE_ROLES,
	OrderStatus,
} from '../enums/order.enums';
import { OrderRepository } from '../repositories/order.repository';
import { OrderExportService } from './order-export.service';
import { OrderStateTransitionService } from './order-state-transition.service';

interface DueAutoConfirmOrder {
	id: string;
	supplierWorkspaceId: string;
}

@Injectable()
export class OrderService {
	private readonly logger = new Logger(OrderService.name);

	constructor(
		private readonly orderRepo: OrderRepository,
		private readonly auditLoggerService: AuditLoggerService,
		private readonly messageQueueService: MessageQueueService,
		private readonly stateTransitions: OrderStateTransitionService,
		private readonly orderExportService: OrderExportService,
		@InjectMetric(METRIC_ORDER_APPROVED)
		private readonly orderApprovedCounter: Counter<string>,
		@InjectMetric(METRIC_ORDER_REJECTED)
		private readonly orderRejectedCounter: Counter<string>,
	) {}

	async listOrders(
		query: ListOrdersQueryDto,
		actorId: string,
		role: string,
		workspaceId: string,
	) {
		this.assertOrderReader(role);
		return this.orderRepo.listOrders({
			role,
			userId: actorId,
			workspaceId,
			status: query.status,
			limit: query.limit,
			offset: query.offset,
		});
	}

	async getOrderDetail(
		orderId: string,
		actorId: string,
		role: string,
		workspaceId: string,
	) {
		this.assertOrderReader(role);
		const order = await this.orderRepo.findVisibleById(
			orderId,
			role,
			workspaceId,
			actorId,
		);
		if (!order) throw new NotFoundException('Order not found');

		const [statusHistory, assignmentHistory] = await Promise.all([
			this.orderRepo.listStatusHistory(orderId),
			this.orderRepo.listAssignmentHistory(orderId),
		]);

		return { ...order, statusHistory, assignmentHistory };
	}

	async approveOrder(
		orderId: string,
		actorId: string,
		workspaceId: string,
		ipAddress: string,
	) {
		let buyerWorkspaceId = '';
		const result = await this.orderRepo.runInTransaction(async (tx) => {
			const order = await this.orderRepo.findForUpdateBySupplier(
				orderId,
				workspaceId,
				OrderStatus.PENDING_APPROVAL,
				tx,
			);
			if (!order) {
				throw new ConflictException(
					'Order is not pending approval for this supplier workspace',
				);
			}

			buyerWorkspaceId = order.buyerWorkspaceId;
			const transition = this.stateTransitions.approve(order);

			// TODO: Phase 2 - Integrate Finance (Credit Check & Payables)
			const updated = await this.orderRepo.updateOrder(
				orderId,
				{
					status: transition.status,
					approvedAt: transition.approvedAt,
					autoConfirmAt: transition.autoConfirmAt,
					rejectionReason: transition.rejectionReason,
				},
				tx,
			);

			await this.orderRepo.insertStatusHistory(
				{
					orderId,
					statusValue: transition.statusHistory.statusValue,
					changedBy: actorId,
					changedAt: transition.statusHistory.changedAt,
				},
				tx,
			);

			await this.auditLoggerService.logInTx(tx, {
				actorId,
				workspaceId,
				action: AuditAction.ORDER_APPROVE_SUCCESS,
				resourceType: 'purchase_order',
				resourceId: orderId,
				changes: transition.changes,
				ipAddress,
				status: AuditStatus.SUCCESS,
			});

			return updated;
		});

		await this.publishSafely(ORDER_APPROVED_QUEUE, {
			event: 'ORDER_APPROVED',
			orderId,
			buyerWorkspaceId,
		});

		this.orderApprovedCounter.inc();

		return result;
	}

	async rejectOrder(
		orderId: string,
		dto: RejectOrderDto,
		actorId: string,
		workspaceId: string,
		ipAddress: string,
	) {
		const result = await this.orderRepo.runInTransaction(async (tx) => {
			const order = await this.orderRepo.findForUpdateBySupplier(
				orderId,
				workspaceId,
				OrderStatus.PENDING_APPROVAL,
				tx,
			);
			if (!order) {
				throw new ConflictException(
					'Order is not pending approval for this supplier workspace',
				);
			}

			const transition = this.stateTransitions.reject(
				order,
				dto.rejectionReason,
			);
			const updated = await this.orderRepo.updateOrder(
				orderId,
				{
					status: transition.status,
					rejectionReason: transition.rejectionReason,
					autoConfirmAt: transition.autoConfirmAt,
				},
				tx,
			);

			await this.orderRepo.insertStatusHistory(
				{
					orderId,
					statusValue: transition.statusHistory.statusValue,
					changedBy: actorId,
					changedAt: transition.statusHistory.changedAt,
				},
				tx,
			);

			await this.auditLoggerService.logInTx(tx, {
				actorId,
				workspaceId,
				action: AuditAction.ORDER_REJECT_SUCCESS,
				resourceType: 'purchase_order',
				resourceId: orderId,
				changes: transition.changes,
				ipAddress,
				status: AuditStatus.SUCCESS,
			});

			return updated;
		});

		this.orderRejectedCounter.inc();

		return result;
	}

	async confirmReceiptManually(
		orderId: string,
		actorId: string,
		workspaceId: string,
		ipAddress: string,
	) {
		return this.confirmReceipt({
			orderId,
			confirmationType: GoodsReceiptConfirmationType.MANUAL,
			confirmedBy: actorId,
			workspaceId,
			ipAddress,
			actorWorkspaceRole: UserRole.BUYER_STAFF,
		});
	}

	async confirmReceipt(params: {
		orderId: string;
		confirmationType: GoodsReceiptConfirmationType;
		confirmedBy: string | null;
		workspaceId: string;
		ipAddress: string;
		actorWorkspaceRole?: UserRole;
	}) {
		let supplierWorkspaceId = '';
		const result = await this.orderRepo.runInTransaction(async (tx) => {
			const order =
				params.confirmationType === GoodsReceiptConfirmationType.MANUAL
					? await this.orderRepo.findForUpdateByBuyer(
							params.orderId,
							params.workspaceId,
							OrderStatus.APPROVED,
							tx,
						)
					: await this.orderRepo.findForUpdateBySupplier(
							params.orderId,
							params.workspaceId,
							OrderStatus.APPROVED,
							tx,
						);

			if (!order) {
				throw new ConflictException('Order is not approved or not accessible');
			}

			supplierWorkspaceId = order.supplierWorkspaceId;
			const transition = this.stateTransitions.confirmReceipt(
				order,
				params.confirmationType,
			);

			// TODO: Phase 2 - Integrate Finance (Credit Check & Payables)
			const updated = await this.orderRepo.updateOrder(
				params.orderId,
				{
					status: transition.status,
					autoConfirmAt: transition.autoConfirmAt,
				},
				tx,
			);

			await this.orderRepo.insertGoodsReceipt(
				{
					orderId: params.orderId,
					confirmationType: transition.goodsReceipt.confirmationType,
					confirmedBy: params.confirmedBy,
					confirmedAt: transition.goodsReceipt.confirmedAt,
				},
				tx,
			);

			await this.orderRepo.insertStatusHistory(
				{
					orderId: params.orderId,
					statusValue: transition.statusHistory.statusValue,
					changedBy: params.confirmedBy,
					changedAt: transition.statusHistory.changedAt,
				},
				tx,
			);

			await this.auditLoggerService.logInTx(tx, {
				actorId: params.confirmedBy ?? 'SYSTEM_SCHEDULER',
				workspaceId: params.workspaceId,
				action: AuditAction.GOODS_RECEIPT_CONFIRM_SUCCESS,
				resourceType: 'purchase_order',
				resourceId: params.orderId,
				changes: transition.changes,
				ipAddress: params.ipAddress,
				status: AuditStatus.SUCCESS,
			});

			return updated;
		});

		await this.publishSafely(GOODS_RECEIPT_CONFIRMED_QUEUE, {
			event: EVENT_GOODS_RECEIPT_CONFIRMED,
			orderId: params.orderId,
			supplierWorkspaceId,
		});

		return result;
	}

	async assignOrder(
		orderId: string,
		dto: AssignOrderDto,
		actorId: string,
		role: string,
		workspaceId: string,
		ipAddress: string,
	) {
		const assignableRoles = this.getAssignableRoles(role);

		return this.orderRepo.runInTransaction(async (tx) => {
			const order = await this.orderRepo.findVisibleById(
				orderId,
				role,
				workspaceId,
				undefined,
				tx,
			);
			if (!order) throw new NotFoundException('Order not found');

			const user = await this.orderRepo.findAssignableUser(
				dto.userId,
				workspaceId,
				assignableRoles,
				tx,
			);
			if (!user) {
				throw new BadRequestException(
					'Assigned user must be active staff in the manager workspace',
				);
			}

			const assignedAt = new Date();
			await this.orderRepo.closeOpenAssignment(orderId, assignedAt, tx);
			const updated = await this.orderRepo.updateOrder(
				orderId,
				{ assignedTo: dto.userId },
				tx,
			);
			await this.orderRepo.insertAssignmentHistory(
				{
					orderId,
					assignedTo: dto.userId,
					assignedBy: actorId,
					assignedAt,
				},
				tx,
			);

			await this.auditLoggerService.logInTx(tx, {
				actorId,
				workspaceId,
				action: AuditAction.ORDER_ASSIGN_SUCCESS,
				resourceType: 'purchase_order',
				resourceId: orderId,
				changes: {
					previousAssignedTo: order.assignedTo,
					assignedTo: dto.userId,
				},
				ipAddress,
				status: AuditStatus.SUCCESS,
			});

			return updated;
		});
	}

	async exportOrders(
		query: ExportOrdersQueryDto,
		role: string,
		workspaceId: string,
	) {
		if (
			![
				UserRole.BUYER_MANAGER,
				UserRole.SUPPLIER_MANAGER,
				UserRole.COMPANY_ADMIN,
			].includes(role as UserRole)
		) {
			throw new ForbiddenException(
				'Only company admins or buyer/supplier managers can export orders',
			);
		}
		if (query.end_date < query.start_date) {
			throw new BadRequestException('end_date must be on or after start_date');
		}
		const rangeMs = query.end_date.getTime() - query.start_date.getTime();
		if (rangeMs > 366 * 24 * 60 * 60 * 1000) {
			throw new BadRequestException('Date range must not exceed 366 days');
		}

		const orders = (await this.orderRepo.listForExport(
			role,
			workspaceId,
			query.start_date,
			query.end_date,
		)) as Record<string, unknown>[];

		return this.orderExportService.renderAndStore(query, orders);
	}

	async settleDueConfirmations() {
		const orders = (await this.orderRepo.runInTransaction((tx) =>
			this.orderRepo.listDueAutoConfirmOrders(tx),
		)) as DueAutoConfirmOrder[];

		for (const order of orders) {
			try {
				await this.confirmReceipt({
					orderId: order.id,
					confirmationType: GoodsReceiptConfirmationType.AUTO,
					confirmedBy: null,
					workspaceId: order.supplierWorkspaceId,
					ipAddress: 'system',
				});
			} catch (error) {
				this.logger.error(
					`Auto confirmation failed for order ${order.id}`,
					error instanceof Error ? error.stack : String(error),
				);
			}
		}

		return { processed: orders.length };
	}

	private assertOrderReader(role: string) {
		if (!this.hasRole(ORDER_READ_ROLES, role)) {
			throw new ForbiddenException('Role cannot access orders');
		}
	}

	private getAssignableRoles(role: string): string[] {
		if (role === UserRole.BUYER_MANAGER)
			return [...ORDER_BUYER_ASSIGNABLE_ROLES];
		if (role === UserRole.SUPPLIER_MANAGER)
			return [...ORDER_SUPPLIER_ASSIGNABLE_ROLES];
		if (role === UserRole.COMPANY_ADMIN) {
			return [
				...ORDER_BUYER_ASSIGNABLE_ROLES,
				...ORDER_SUPPLIER_ASSIGNABLE_ROLES,
			];
		}
		throw new ForbiddenException(
			'Only company admins or managers can assign orders',
		);
	}

	private hasRole(roles: readonly string[], role: string) {
		return roles.includes(role);
	}

	private async publishSafely(queue: string, message: Record<string, unknown>) {
		try {
			await this.messageQueueService.publishMessage(queue, message);
		} catch (error) {
			this.logger.warn(
				`Message publish skipped for ${queue}: ${
					error instanceof Error ? error.message : String(error)
				}`,
			);
		}
	}
}
