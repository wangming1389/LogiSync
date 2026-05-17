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

export const ORDER_READ_ROLES = [
	'buyer_staff',
	'buyer_manager',
	'supplier_staff',
	'supplier_manager',
	'company_admin',
] as const;

export const ORDER_MANAGER_ROLES = [
	'buyer_manager',
	'supplier_manager',
] as const;

export const ORDER_BUYER_ASSIGNABLE_ROLES = ['buyer_staff'] as const;

export const ORDER_SUPPLIER_ASSIGNABLE_ROLES = ['supplier_staff'] as const;

export const ORDER_EXPORT_FORMATS = ['xlsx', 'pdf'] as const;
