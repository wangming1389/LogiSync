'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

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
const MAX_ORDERS = 100;

type RecentOrdersState = {
	orders: PurchaseOrderSnapshot[];
};

// Stores the most recent purchase orders for the buyer dashboard.
// Persisted to `localStorage` because the list is purely UI-side
// (server-side data is refetched on demand via React Query).
export const useRecentPurchaseOrdersStore = create<RecentOrdersState>()(
	persist((): RecentOrdersState => ({ orders: [] }), {
		name: STORAGE_KEY,
		storage: createJSONStorage(() => localStorage),
	}),
);

function isBrowser() {
	return typeof window !== 'undefined';
}

export function loadRecentPurchaseOrders(): PurchaseOrderSnapshot[] {
	if (!isBrowser()) return [];
	return useRecentPurchaseOrdersStore.getState().orders;
}

export function saveRecentPurchaseOrders(orders: PurchaseOrderSnapshot[]) {
	if (!isBrowser()) return;
	useRecentPurchaseOrdersStore.setState(
		{ orders: orders.slice(0, MAX_ORDERS) },
		true,
	);
}

export function upsertRecentPurchaseOrder(order: PurchaseOrderSnapshot) {
	if (!order?.id) return;
	const current = loadRecentPurchaseOrders();
	const next = [
		order,
		...current.filter((entry) => entry.id !== order.id),
	].slice(0, MAX_ORDERS);
	saveRecentPurchaseOrders(next);
}

export function upsertRecentPurchaseOrders(orders: PurchaseOrderSnapshot[]) {
	const current = loadRecentPurchaseOrders();
	const map = new Map(current.map((order) => [order.id, order]));
	for (const order of orders) {
		if (order?.id) map.set(order.id, { ...map.get(order.id), ...order });
	}
	saveRecentPurchaseOrders(Array.from(map.values()).slice(0, MAX_ORDERS));
}

// API envelope helpers. Kept in this module for backwards compatibility
// with existing imports; new code should prefer `lib/api-envelope.ts`.
type ApiEnvelope<T> = {
	data?: T | { items?: T; data?: T };
	success?: boolean;
	items?: T;
};

export function unwrapApiEnvelope<T>(response: unknown): T {
	let payload = response as ApiEnvelope<T> | T;
	if (
		payload &&
		typeof payload === 'object' &&
		'data' in payload &&
		(payload as ApiEnvelope<T>).data !== undefined
	) {
		payload = (payload as ApiEnvelope<T>).data as T;
	}
	if (
		payload &&
		typeof payload === 'object' &&
		'success' in payload &&
		'data' in payload &&
		(payload as ApiEnvelope<T>).data !== undefined
	) {
		payload = (payload as ApiEnvelope<T>).data as T;
	}
	return payload as T;
}

export function unwrapApiList<T>(response: unknown): T[] {
	const payload = unwrapApiEnvelope<unknown>(response);
	if (Array.isArray(payload)) return payload as T[];
	if (payload && typeof payload === 'object') {
		const record = payload as Record<string, unknown>;
		if (Array.isArray(record.items)) return record.items as T[];
		if (Array.isArray(record.data)) return record.data as T[];
		const data = record.data as Record<string, unknown> | undefined;
		if (data && Array.isArray(data.items)) return data.items as T[];
	}
	return [];
}
