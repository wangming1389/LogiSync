/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-enum-comparison, @typescript-eslint/no-unsafe-call */
import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import * as XLSX from 'xlsx';
import {
	AuditAction,
	AuditStatus,
} from '../../../core/audit/enums/audit.enums';
import { AuditLoggerService } from '../../../core/audit/services/audit-logger.service';
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
			const approvedAt = new Date();
			const autoConfirmAt = new Date(
				approvedAt.getTime() + 48 * 60 * 60 * 1000,
			);

			// TODO: Phase 2 - Integrate Finance (Credit Check & Payables)
			const updated = await this.orderRepo.updateOrder(
				orderId,
				{
					status: OrderStatus.APPROVED,
					approvedAt,
					autoConfirmAt,
					rejectionReason: null,
				},
				tx,
			);

			await this.orderRepo.insertStatusHistory(
				{
					orderId,
					statusValue: OrderStatus.APPROVED,
					changedBy: actorId,
					changedAt: approvedAt,
				},
				tx,
			);

			await this.auditLoggerService.logInTx(tx, {
				actorId,
				workspaceId,
				action: AuditAction.ORDER_APPROVE_SUCCESS,
				resourceType: 'purchase_order',
				resourceId: orderId,
				changes: {
					oldStatus: order.status,
					newStatus: OrderStatus.APPROVED,
					autoConfirmAt,
				},
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

		return result;
	}

	async rejectOrder(
		orderId: string,
		dto: RejectOrderDto,
		actorId: string,
		workspaceId: string,
		ipAddress: string,
	) {
		return this.orderRepo.runInTransaction(async (tx) => {
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

			const changedAt = new Date();
			const updated = await this.orderRepo.updateOrder(
				orderId,
				{
					status: OrderStatus.REJECTED,
					rejectionReason: dto.rejectionReason,
					autoConfirmAt: null,
				},
				tx,
			);

			await this.orderRepo.insertStatusHistory(
				{
					orderId,
					statusValue: OrderStatus.REJECTED,
					changedBy: actorId,
					changedAt,
				},
				tx,
			);

			await this.auditLoggerService.logInTx(tx, {
				actorId,
				workspaceId,
				action: AuditAction.ORDER_REJECT_SUCCESS,
				resourceType: 'purchase_order',
				resourceId: orderId,
				changes: {
					oldStatus: order.status,
					newStatus: OrderStatus.REJECTED,
					rejectionReason: dto.rejectionReason,
				},
				ipAddress,
				status: AuditStatus.SUCCESS,
			});

			return updated;
		});
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
			const confirmedAt = new Date();

			// TODO: Phase 2 - Integrate Finance (Credit Check & Payables)
			const updated = await this.orderRepo.updateOrder(
				params.orderId,
				{
					status: OrderStatus.GOODS_RECEIVED,
					autoConfirmAt: null,
				},
				tx,
			);

			await this.orderRepo.insertGoodsReceipt(
				{
					orderId: params.orderId,
					confirmationType: params.confirmationType,
					confirmedBy: params.confirmedBy,
					confirmedAt,
				},
				tx,
			);

			await this.orderRepo.insertStatusHistory(
				{
					orderId: params.orderId,
					statusValue: OrderStatus.GOODS_RECEIVED,
					changedBy: params.confirmedBy,
					changedAt: confirmedAt,
				},
				tx,
			);

			await this.auditLoggerService.logInTx(tx, {
				actorId: params.confirmedBy ?? 'SYSTEM_SCHEDULER',
				workspaceId: params.workspaceId,
				action: AuditAction.GOODS_RECEIPT_CONFIRM_SUCCESS,
				resourceType: 'purchase_order',
				resourceId: params.orderId,
				changes: {
					oldStatus: order.status,
					newStatus: OrderStatus.GOODS_RECEIVED,
					confirmationType: params.confirmationType,
				},
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
			![UserRole.BUYER_MANAGER, UserRole.SUPPLIER_MANAGER].includes(
				role as UserRole,
			)
		) {
			throw new ForbiddenException(
				'Only buyer or supplier managers can export orders',
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

		if (query.format === 'pdf') {
			return {
				contentType: 'application/pdf',
				filename: 'orders.pdf',
				buffer: this.renderSimplePdf(orders),
			};
		}

		return {
			contentType:
				'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			filename: 'orders.xlsx',
			buffer: this.renderXlsx(orders),
		};
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
		throw new ForbiddenException('Only managers can assign orders');
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

	private renderXlsx(orders: Record<string, unknown>[]): Buffer {
		const rows = (orders as any[]).map((order) => ({
			id: order.id,
			quotationId: order.quotationId,
			buyerWorkspaceId: order.buyerWorkspaceId,
			supplierWorkspaceId: order.supplierWorkspaceId,
			status: order.status,
			assignedTo: order.assignedTo,
			totalPrice: order.totalPrice,
			createdAt:
				order.createdAt instanceof Date
					? order.createdAt.toISOString()
					: order.createdAt,
		}));
		const workbook = XLSX.utils.book_new();
		const worksheet = XLSX.utils.json_to_sheet(rows);
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
		return XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' }) as Buffer;
	}

	private renderSimplePdf(orders: Record<string, unknown>[]): Buffer {
		const ordersAny = orders as any[];
		const lines = [
			'LogiSync Order Export',
			`Generated at: ${new Date().toISOString()}`,
			`Total orders: ${ordersAny.length}`,
			'',
			...ordersAny.map(
				(order) =>
					`${String(order.id)} | ${String(order.status)} | ${String(order.totalPrice)}`,
			),
		];
		const content = [
			'BT',
			'/F1 10 Tf',
			'50 780 Td',
			...lines.flatMap((line, index) => [
				index === 0 ? '' : '0 -14 Td',
				`(${this.escapePdfText(line)}) Tj`,
			]),
			'ET',
		]
			.filter(Boolean)
			.join('\n');
		const objects = [
			'<< /Type /Catalog /Pages 2 0 R >>',
			'<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
			'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
			'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
			`<< /Length ${Buffer.byteLength(content, 'utf8')} >>\nstream\n${content}\nendstream`,
		];
		let body = '%PDF-1.4\n';
		const offsets = [0];
		for (const [index, object] of objects.entries()) {
			offsets.push(Buffer.byteLength(body, 'utf8'));
			body += `${index + 1} 0 obj\n${object}\nendobj\n`;
		}
		const xrefOffset = Buffer.byteLength(body, 'utf8');
		body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
		body += offsets
			.slice(1)
			.map((offset) => `${offset.toString().padStart(10, '0')} 00000 n \n`)
			.join('');
		body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
		return Buffer.from(body, 'utf8');
	}

	private escapePdfText(value: string): string {
		return value
			.replace(/\\/g, '\\\\')
			.replace(/\(/g, '\\(')
			.replace(/\)/g, '\\)');
	}
}
