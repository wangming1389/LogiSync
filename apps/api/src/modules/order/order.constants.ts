export enum OrderStatus {
	PENDING_APPROVAL = 'pending_approval',
	APPROVED = 'approved',
	REJECTED = 'rejected',
	GOODS_RECEIVED = 'goods_received',
}

export enum GoodsReceiptConfirmationType {
	MANUAL = 'MANUAL',
	AUTO = 'AUTO',
}

export const ORDER_APPROVED_QUEUE = 'orders:approved';
export const GOODS_RECEIPT_CONFIRMED_QUEUE = 'orders:goods-receipt-confirmed';
export const EVENT_GOODS_RECEIPT_CONFIRMED = 'EVENT_GOODS_RECEIPT_CONFIRMED';
