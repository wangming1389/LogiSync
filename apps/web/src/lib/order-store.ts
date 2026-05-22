'use client';

export type PurchaseOrderSnapshot = {
	id: string;
	quotationId?: string | null;
	buyerWorkspaceId?: string | null;
	supplierWorkspaceId?: string | null;
	supplierName?: string | null;
	productName?: string | null;
	status?: string | null;
	assignedTo?: string | null;
	totalPrice?: number | null;
	finalUnitPrice?: number | null;
	finalPaymentTerms?: string | null;
	finalDeliveryDate?: string | null;
	autoConfirmAt?: string | null;
	approvedAt?: string | null;
	rejectionReason?: string | null;
	createdAt?: string | null;
};

const STORAGE_KEY = 'logisync.recent-purchase-orders.v1';

function isBrowser() {
	return typeof window !== 'undefined';
}

export function loadRecentPurchaseOrders(): PurchaseOrderSnapshot[] {
	if (!isBrowser()) return [];
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

export function saveRecentPurchaseOrders(orders: PurchaseOrderSnapshot[]) {
	if (!isBrowser()) return;
	window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function upsertRecentPurchaseOrder(order: PurchaseOrderSnapshot) {
	if (!order?.id) return;
	const current = loadRecentPurchaseOrders();
	const next = [
		order,
		...current.filter((entry) => entry.id !== order.id),
	].slice(0, 100);
	saveRecentPurchaseOrders(next);
}

export function upsertRecentPurchaseOrders(orders: PurchaseOrderSnapshot[]) {
	const current = loadRecentPurchaseOrders();
	const map = new Map(current.map((order) => [order.id, order]));
	for (const order of orders) {
		if (order?.id) map.set(order.id, { ...map.get(order.id), ...order });
	}
	saveRecentPurchaseOrders(Array.from(map.values()).slice(0, 100));
}

export function unwrapApiEnvelope<T>(response: unknown): T {
	let payload = response as any;
	if (payload?.data !== undefined) payload = payload.data;
	if (payload?.success !== undefined && payload?.data !== undefined) {
		payload = payload.data;
	}
	return payload as T;
}

export function unwrapApiList<T>(response: unknown): T[] {
	const payload = unwrapApiEnvelope<any>(response);
	if (Array.isArray(payload)) return payload as T[];
	if (Array.isArray(payload?.items)) return payload.items as T[];
	if (Array.isArray(payload?.data)) return payload.data as T[];
	if (Array.isArray(payload?.data?.items)) return payload.data.items as T[];
	return [];
}
