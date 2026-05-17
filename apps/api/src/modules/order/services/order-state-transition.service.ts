import { Injectable } from '@nestjs/common';
import {
	GoodsReceiptConfirmationType,
	OrderStatus,
} from '../enums/order.enums';

export interface OrderStatusSnapshot {
	status: string;
	buyerWorkspaceId?: string;
	supplierWorkspaceId?: string;
}

export interface ApproveOrderTransition {
	status: OrderStatus.APPROVED;
	approvedAt: Date;
	autoConfirmAt: Date;
	rejectionReason: null;
	statusHistory: {
		statusValue: OrderStatus.APPROVED;
		changedAt: Date;
	};
	changes: {
		oldStatus: string;
		newStatus: OrderStatus.APPROVED;
		autoConfirmAt: Date;
	};
}

export interface RejectOrderTransition {
	status: OrderStatus.REJECTED;
	rejectionReason: string;
	autoConfirmAt: null;
	statusHistory: {
		statusValue: OrderStatus.REJECTED;
		changedAt: Date;
	};
	changes: {
		oldStatus: string;
		newStatus: OrderStatus.REJECTED;
		rejectionReason: string;
	};
}

export interface ConfirmReceiptTransition {
	status: OrderStatus.GOODS_RECEIVED;
	autoConfirmAt: null;
	statusHistory: {
		statusValue: OrderStatus.GOODS_RECEIVED;
		changedAt: Date;
	};
	goodsReceipt: {
		confirmationType: GoodsReceiptConfirmationType;
		confirmedAt: Date;
	};
	changes: {
		oldStatus: string;
		newStatus: OrderStatus.GOODS_RECEIVED;
		confirmationType: GoodsReceiptConfirmationType;
	};
}

@Injectable()
export class OrderStateTransitionService {
	approve(
		order: OrderStatusSnapshot,
		now = new Date(),
	): ApproveOrderTransition {
		const autoConfirmAt = new Date(now.getTime() + 48 * 60 * 60 * 1000);

		return {
			status: OrderStatus.APPROVED,
			approvedAt: now,
			autoConfirmAt,
			rejectionReason: null,
			statusHistory: {
				statusValue: OrderStatus.APPROVED,
				changedAt: now,
			},
			changes: {
				oldStatus: order.status,
				newStatus: OrderStatus.APPROVED,
				autoConfirmAt,
			},
		};
	}

	reject(
		order: OrderStatusSnapshot,
		rejectionReason: string,
		now = new Date(),
	): RejectOrderTransition {
		return {
			status: OrderStatus.REJECTED,
			rejectionReason,
			autoConfirmAt: null,
			statusHistory: {
				statusValue: OrderStatus.REJECTED,
				changedAt: now,
			},
			changes: {
				oldStatus: order.status,
				newStatus: OrderStatus.REJECTED,
				rejectionReason,
			},
		};
	}

	confirmReceipt(
		order: OrderStatusSnapshot,
		confirmationType: GoodsReceiptConfirmationType,
		now = new Date(),
	): ConfirmReceiptTransition {
		return {
			status: OrderStatus.GOODS_RECEIVED,
			autoConfirmAt: null,
			statusHistory: {
				statusValue: OrderStatus.GOODS_RECEIVED,
				changedAt: now,
			},
			goodsReceipt: {
				confirmationType,
				confirmedAt: now,
			},
			changes: {
				oldStatus: order.status,
				newStatus: OrderStatus.GOODS_RECEIVED,
				confirmationType,
			},
		};
	}
}
