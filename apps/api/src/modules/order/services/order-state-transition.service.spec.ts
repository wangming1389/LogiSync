import {
	GoodsReceiptConfirmationType,
	OrderStatus,
} from '../enums/order.enums';
import { OrderStateTransitionService } from './order-state-transition.service';

describe('OrderStateTransitionService', () => {
	const service = new OrderStateTransitionService();
	const now = new Date('2026-05-17T00:00:00.000Z');

	it('builds approval transition data without side effects', () => {
		const result = service.approve(
			{ status: OrderStatus.PENDING_APPROVAL },
			now,
		);

		expect(result).toEqual({
			status: OrderStatus.APPROVED,
			approvedAt: now,
			autoConfirmAt: new Date('2026-05-19T00:00:00.000Z'),
			rejectionReason: null,
			statusHistory: {
				statusValue: OrderStatus.APPROVED,
				changedAt: now,
			},
			changes: {
				oldStatus: OrderStatus.PENDING_APPROVAL,
				newStatus: OrderStatus.APPROVED,
				autoConfirmAt: new Date('2026-05-19T00:00:00.000Z'),
			},
		});
	});

	it('builds receipt confirmation transition data', () => {
		const result = service.confirmReceipt(
			{ status: OrderStatus.APPROVED },
			GoodsReceiptConfirmationType.AUTO,
			now,
		);

		expect(result.status).toBe(OrderStatus.GOODS_RECEIVED);
		expect(result.autoConfirmAt).toBeNull();
		expect(result.goodsReceipt).toEqual({
			confirmationType: GoodsReceiptConfirmationType.AUTO,
			confirmedAt: now,
		});
	});
});
