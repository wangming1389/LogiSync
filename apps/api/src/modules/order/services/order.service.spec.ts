import { BadRequestException } from '@nestjs/common';
import {
	AuditAction,
	AuditStatus,
} from '../../../core/audit/enums/audit.enums';
import { UserRole } from '../../iam/auth/enums/user-role.enum';
import { ORDER_APPROVED_QUEUE } from '../constants/order.constants';
import {
	GoodsReceiptConfirmationType,
	OrderStatus,
} from '../enums/order.enums';
import { OrderService } from './order.service';

describe('OrderService', () => {
	const orderRepo = {
		listOrders: jest.fn(),
		runInTransaction: jest.fn(),
		findForUpdateBySupplier: jest.fn(),
		findForUpdateByBuyer: jest.fn(),
		updateOrder: jest.fn(),
		insertStatusHistory: jest.fn(),
		insertGoodsReceipt: jest.fn(),
		listDueAutoConfirmOrders: jest.fn(),
		listForExport: jest.fn(),
	};
	const auditLoggerService = {
		logInTx: jest.fn(),
	};
	const messageQueueService = {
		publishMessage: jest.fn(),
	};
	const tx = {};

	let service: OrderService;

	const order = {
		id: 'order-1',
		buyerWorkspaceId: 'buyer-workspace-1',
		supplierWorkspaceId: 'supplier-workspace-1',
		status: OrderStatus.PENDING_APPROVAL,
	};

	beforeEach(() => {
		jest.clearAllMocks();
		orderRepo.runInTransaction.mockImplementation((task) => task(tx));
		orderRepo.listOrders.mockResolvedValue({ items: [], total: 0 });
		orderRepo.findForUpdateBySupplier.mockResolvedValue(order);
		orderRepo.findForUpdateByBuyer.mockResolvedValue({
			...order,
			status: OrderStatus.APPROVED,
		});
		orderRepo.updateOrder.mockResolvedValue({ ...order, status: 'updated' });
		orderRepo.insertStatusHistory.mockResolvedValue({ id: 'history-1' });
		orderRepo.insertGoodsReceipt.mockResolvedValue({ id: 'receipt-1' });
		orderRepo.listDueAutoConfirmOrders.mockResolvedValue([
			{ id: 'order-1', supplierWorkspaceId: 'supplier-workspace-1' },
		]);
		orderRepo.listForExport.mockResolvedValue([]);
		auditLoggerService.logInTx.mockResolvedValue(undefined);
		messageQueueService.publishMessage.mockResolvedValue(undefined);

		service = new OrderService(
			orderRepo as never,
			auditLoggerService as never,
			messageQueueService as never,
		);
	});

	it('TC-ORD-04 Export Range Validation', async () => {
		await expect(
			service.exportOrders(
				{
					start_date: new Date('2026-01-01T00:00:00.000Z'),
					end_date: new Date('2027-01-03T00:00:00.000Z'),
					format: 'xlsx',
				},
				UserRole.BUYER_MANAGER,
				'buyer-workspace-1',
			),
		).rejects.toThrow(BadRequestException);
	});

	it('TC-ORD-05 Auto-Confirm Logic', async () => {
		const result = await service.settleDueConfirmations();

		expect(orderRepo.listDueAutoConfirmOrders).toHaveBeenCalledWith(tx);
		expect(orderRepo.insertGoodsReceipt).toHaveBeenCalledWith(
			expect.objectContaining({
				orderId: 'order-1',
				confirmationType: GoodsReceiptConfirmationType.AUTO,
				confirmedBy: null,
			}),
			tx,
		);
		expect(result).toEqual({ processed: 1 });
	});

	it('TC-ORD-06 Atomic Transactions', async () => {
		await service.approveOrder(
			'order-1',
			'supplier-1',
			'supplier-workspace-1',
			'127.0.0.1',
		);

		expect(orderRepo.runInTransaction).toHaveBeenCalledTimes(1);
		expect(orderRepo.updateOrder).toHaveBeenCalledWith(
			'order-1',
			expect.objectContaining({ status: OrderStatus.APPROVED }),
			tx,
		);
		expect(orderRepo.insertStatusHistory).toHaveBeenCalledWith(
			expect.objectContaining({
				orderId: 'order-1',
				statusValue: OrderStatus.APPROVED,
			}),
			tx,
		);
		expect(auditLoggerService.logInTx).toHaveBeenCalledWith(
			tx,
			expect.objectContaining({
				action: AuditAction.ORDER_APPROVE_SUCCESS,
				status: AuditStatus.SUCCESS,
			}),
		);
	});

	it('TC-ORD-07 Post-Commit Notifications', async () => {
		await service.approveOrder(
			'order-1',
			'supplier-1',
			'supplier-workspace-1',
			'127.0.0.1',
		);

		const transactionOrder =
			orderRepo.runInTransaction.mock.invocationCallOrder[0];
		const publishOrder =
			messageQueueService.publishMessage.mock.invocationCallOrder[0];
		expect(transactionOrder).toBeLessThan(publishOrder);
		expect(messageQueueService.publishMessage).toHaveBeenCalledWith(
			ORDER_APPROVED_QUEUE,
			{
				event: 'ORDER_APPROVED',
				orderId: 'order-1',
				buyerWorkspaceId: 'buyer-workspace-1',
			},
		);
	});
});
