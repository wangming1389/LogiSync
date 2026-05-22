'use client';

import {
	AlertTriangle,
	CheckCircle,
	ChevronLeft,
	ClipboardList,
	RefreshCw,
	XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { getStoredAccessToken, parseJwtClaims } from '@/lib/auth';
import {
	loadRecentPurchaseOrders,
	PurchaseOrderSnapshot,
	unwrapApiEnvelope,
	unwrapApiList,
	upsertRecentPurchaseOrder,
	upsertRecentPurchaseOrders,
} from '@/lib/order-store';

const SHADOW = '0px 8px 24px rgba(15,76,138,0.08)';

function StatusChip({ status }: { status: string }) {
	const label =
		status === 'approved'
			? 'confirmed'
			: status === 'rejected'
				? 'denied'
				: status === 'goods_received'
					? 'completed'
					: status;
	const map: Record<string, { bg: string; color: string }> = {
		pending_approval: { bg: '#FFEFC6', color: '#7A4F00' },
		approved: { bg: '#C8F0D8', color: '#1B6B3A' },
		rejected: { bg: '#FFDAD6', color: '#BA1A1A' },
		goods_received: { bg: '#D3E4F5', color: '#0F4C8A' },
	};
	const s = map[status] ?? { bg: '#E0E4EB', color: '#191C1E' };
	return (
		<span
			className="px-3 py-1 rounded-full"
			style={{
				background: s.bg,
				color: s.color,
				fontSize: 11,
				fontWeight: 500,
				letterSpacing: '0.05em',
			}}
		>
			{label.replace(/_/g, ' ').toUpperCase()}
		</span>
	);
}

function formatDate(value?: string | null) {
	if (!value) return '-';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value.slice(0, 10);
	return date.toISOString().slice(0, 10);
}

function formatMoney(value?: number | null) {
	return `₫${Number(value ?? 0).toLocaleString('vi-VN')}`;
}

function currentWorkspaceId() {
	const token = getStoredAccessToken();
	const claims = token ? parseJwtClaims(token) : null;
	return typeof claims?.workspaceId === 'string' ? claims.workspaceId : null;
}

type EnrichedOrder = PurchaseOrderSnapshot & {
	buyerName?: string | null;
	productName?: string | null;
	quantity?: number | null;
	unitLabel?: string | null;
};

type UomOption = { id: string; name: string; code: string };
type ProductLookup = {
	id?: string;
	name?: string;
	sku?: string | null;
	uomId?: string | null;
};

function formatProductLabel(product?: ProductLookup | null) {
	if (!product?.name) return undefined;
	return product.sku ? `${product.name} (${product.sku})` : product.name;
}

async function enrichSupplierOrders(
	orders: PurchaseOrderSnapshot[],
): Promise<EnrichedOrder[]> {
	const buyerIds = Array.from(
		new Set(
			orders
				.map((order) => order.buyerWorkspaceId)
				.filter((id): id is string => Boolean(id)),
		),
	);
	const buyerNames = new Map<string, string>();
	if (buyerIds.length > 0) {
		try {
			const response: any = await api.get(
				`/workspaces/public?ids=${buyerIds.join(',')}`,
			);
			for (const row of unwrapApiList<{ id?: string; name?: string }>(
				response,
			)) {
				if (row.id && row.name) buyerNames.set(row.id, row.name);
			}
		} catch {
			// Fall back to generic labels.
		}
	}

	const uoms = new Map<string, string>();
	try {
		const response: any = await api.get('/uom');
		for (const uom of unwrapApiList<UomOption>(response)) {
			uoms.set(uom.id, uom.code ? uom.code.toUpperCase() : uom.name);
		}
	} catch {
		// Unit labels are optional display data.
	}

	return Promise.all(
		orders.map(async (order) => {
			const enriched: EnrichedOrder = {
				...order,
				buyerName: order.buyerWorkspaceId
					? (buyerNames.get(order.buyerWorkspaceId) ?? 'Buyer')
					: 'Buyer',
			};

			if (!order.quotationId) return enriched;

			try {
				const quotationResponse: any = await api.get(
					`/quotations/${order.quotationId}`,
				);
				const quotation = unwrapApiEnvelope<any>(quotationResponse);
				if (!quotation?.rfqId) return enriched;

				const rfqResponse: any = await api.get(`/rfqs/${quotation.rfqId}`);
				const rfq = unwrapApiEnvelope<any>(rfqResponse);
				const item = Array.isArray(rfq?.items) ? rfq.items[0] : null;
				enriched.quantity = item?.quantity ?? quotation.items?.[0]?.quantity;

				if (!item?.productId) return enriched;
				const productResponse: any = await api.get(
					`/catalog/products/${item.productId}`,
				);
				const product = unwrapApiEnvelope<ProductLookup>(productResponse);
				enriched.productName =
					formatProductLabel(product) ??
					`Product ${item.productId.slice(0, 8)}`;
				enriched.unitLabel =
					product.uomId && uoms.has(product.uomId)
						? (uoms.get(product.uomId) as string)
						: null;
			} catch {
				// Keep the order visible even if label enrichment fails.
			}

			return enriched;
		}),
	);
}

export default function SupplierOrderManagement() {
	const [orders, setOrders] = useState<EnrichedOrder[]>([]);
	const [selected, setSelected] = useState<string | null>(null);
	const [denyModal, setDenyModal] = useState<string | null>(null);
	const [denyReason, setDenyReason] = useState('');
	const [loading, setLoading] = useState(false);
	const [actionLoading, setActionLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [notice, setNotice] = useState<string | null>(null);

	const loadOrders = useCallback(async () => {
		const workspaceId = currentWorkspaceId();
		setLoading(true);
		setError(null);
		try {
			const response: any = await api.get('/orders?limit=50');
			const apiOrders = unwrapApiList<PurchaseOrderSnapshot>(response);
			upsertRecentPurchaseOrders(apiOrders);
			const cachedOrders = loadRecentPurchaseOrders();
			const merged = [...apiOrders];
			for (const order of cachedOrders) {
				if (merged.some((entry) => entry.id === order.id)) continue;
				merged.push(order);
			}
			const visible = merged
				.filter(
					(order) => !workspaceId || order.supplierWorkspaceId === workspaceId,
				)
				.sort(
					(a, b) =>
						new Date(b.createdAt ?? 0).getTime() -
						new Date(a.createdAt ?? 0).getTime(),
				);
			setOrders(await enrichSupplierOrders(visible));
		} catch (err: any) {
			setError(err?.message ?? 'Failed to load orders.');
			const cached = loadRecentPurchaseOrders();
			const visible = cached.filter((order) => {
				const workspaceId = currentWorkspaceId();
				return !workspaceId || order.supplierWorkspaceId === workspaceId;
			});
			setOrders(await enrichSupplierOrders(visible));
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadOrders();
	}, [loadOrders]);

	const detail = useMemo(
		() => orders.find((order) => order.id === selected) ?? null,
		[orders, selected],
	);

	async function approve(id: string) {
		setActionLoading(true);
		setError(null);
		try {
			const response: any = await api.patch(`/orders/${id}/approve`, {});
			const updated = response?.data?.data ?? response?.data ?? response;
			const [enriched] = await enrichSupplierOrders([updated]);
			upsertRecentPurchaseOrder(enriched);
			setOrders((current) =>
				current.map((order) => (order.id === id ? enriched : order)),
			);
			setNotice('Order confirmed. Buyer can now confirm goods receipt.');
			setSelected(null);
		} catch (err: any) {
			setError(err?.message ?? 'Failed to approve order.');
		} finally {
			setActionLoading(false);
		}
	}

	async function deny(id: string) {
		setActionLoading(true);
		setError(null);
		try {
			const response: any = await api.patch(`/orders/${id}/reject`, {
				rejectionReason: denyReason,
			});
			const updated = response?.data?.data ?? response?.data ?? response;
			const [enriched] = await enrichSupplierOrders([updated]);
			upsertRecentPurchaseOrder(enriched);
			setOrders((current) =>
				current.map((order) => (order.id === id ? enriched : order)),
			);
			setNotice('Order denied with reason.');
			setDenyModal(null);
			setDenyReason('');
			setSelected(null);
		} catch (err: any) {
			setError(err?.message ?? 'Failed to reject order.');
		} finally {
			setActionLoading(false);
		}
	}

	if (selected && detail) {
		return (
			<div className="p-6 max-w-3xl mx-auto">
				<button
					onClick={() => setSelected(null)}
					className="flex items-center gap-1 mb-4 hover:opacity-80"
					style={{ fontSize: 13, color: 'rgba(25,28,30,0.55)' }}
				>
					<ChevronLeft className="w-4 h-4" /> Back
				</button>
				<div
					className="rounded-xl p-6"
					style={{ background: '#FFFFFF', boxShadow: SHADOW }}
				>
					<div className="flex items-start justify-between mb-5 gap-4">
						<div>
							<h2 style={{ color: '#191C1E' }}>
								{detail.productName ?? 'Purchase order'}
							</h2>
							<p
								style={{
									fontSize: 13,
									color: 'rgba(25,28,30,0.55)',
									marginTop: 2,
								}}
							>
								Created: {formatDate(detail.createdAt)} · Delivery:{' '}
								{formatDate(detail.finalDeliveryDate)}
							</p>
						</div>
						<StatusChip status={detail.status ?? 'pending_approval'} />
					</div>

					<div className="grid grid-cols-2 gap-3 mb-5">
						{[
							['BUYER', detail.buyerName ?? 'Buyer'],
							['PRODUCT', detail.productName ?? 'Purchase order'],
							[
								'QUANTITY',
								detail.quantity
									? `${detail.quantity.toLocaleString('vi-VN')} ${detail.unitLabel ?? 'unit'}`
									: '-',
							],
							['UNIT PRICE', formatMoney(detail.finalUnitPrice)],
							['TOTAL VALUE', formatMoney(detail.totalPrice)],
							['PAYMENT TERMS', detail.finalPaymentTerms ?? '-'],
							['ASSIGNED TO', detail.assignedTo ? 'Assigned' : 'Unassigned'],
						].map(([label, value]) => (
							<div
								key={label}
								className="rounded-lg p-3"
								style={{ background: '#F2F4F7' }}
							>
								<p className="text-[11px] font-medium tracking-wide text-slate-500">
									{label}
								</p>
								<p className="mt-1 text-sm text-slate-900 break-words">
									{value}
								</p>
							</div>
						))}
					</div>

					{error && (
						<div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
							<AlertTriangle className="w-4 h-4" /> {error}
						</div>
					)}

					{detail.status === 'pending_approval' && (
						<div className="flex gap-3">
							<button
								onClick={() => approve(detail.id)}
								disabled={actionLoading}
								className="flex items-center gap-2 px-4 py-2.5 text-white rounded-[6px] transition-all hover:brightness-105 disabled:opacity-50"
								style={{
									background:
										'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)',
									fontWeight: 600,
									fontSize: 12,
								}}
							>
								<CheckCircle className="w-4 h-4" /> APPROVE
							</button>
							<button
								onClick={() => setDenyModal(detail.id)}
								disabled={actionLoading}
								className="flex items-center gap-2 px-4 py-2.5 rounded-[6px] disabled:opacity-50"
								style={{
									background: '#FFDAD6',
									color: '#BA1A1A',
									fontWeight: 600,
									fontSize: 12,
								}}
							>
								<XCircle className="w-4 h-4" /> DENY
							</button>
						</div>
					)}
				</div>

				{denyModal && (
					<div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 p-4">
						<div className="rounded-xl bg-white p-6 w-full max-w-sm shadow-xl">
							<h3 className="mb-3 text-slate-900">Deny Order</h3>
							<textarea
								value={denyReason}
								onChange={(event) => setDenyReason(event.target.value)}
								rows={3}
								placeholder="Enter reason..."
								className="w-full px-3 py-2 rounded-t-[6px] focus:outline-none resize-none mb-3 bg-slate-200 border-b-2 border-red-700 text-sm"
							/>
							<div className="flex gap-2">
								<button
									onClick={() => deny(denyModal)}
									disabled={!denyReason.trim() || actionLoading}
									className="flex-1 py-2.5 text-white rounded-[6px] disabled:opacity-40 bg-red-700 text-sm font-semibold"
								>
									Confirm Deny
								</button>
								<button
									onClick={() => setDenyModal(null)}
									className="flex-1 py-2.5 rounded-[6px] bg-slate-200 text-slate-900 text-sm"
								>
									Cancel
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		);
	}

	return (
		<div className="p-6">
			<div className="mb-6 flex items-start justify-between gap-4">
				<div>
					<h1 style={{ color: '#191C1E' }}>Order Management</h1>
					<p className="mt-1 text-sm text-slate-500">
						Real purchase orders created when a buyer selects a quotation.
					</p>
				</div>
				<button
					onClick={loadOrders}
					disabled={loading}
					className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 disabled:opacity-50"
				>
					<RefreshCw className="w-4 h-4" /> Refresh
				</button>
			</div>

			{notice && (
				<div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
					<CheckCircle className="w-4 h-4" /> {notice}
				</div>
			)}
			{error && (
				<div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
					<AlertTriangle className="w-4 h-4" /> {error}
				</div>
			)}

			{loading && <p className="text-sm text-slate-500">Loading orders...</p>}
			{!loading && orders.length === 0 && (
				<div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
					No purchase orders are visible for this supplier workspace yet.
				</div>
			)}

			<div className="space-y-3">
				{orders.map((order) => (
					<button
						key={order.id}
						onClick={() => setSelected(order.id)}
						className="w-full rounded-xl p-5 text-left transition-all"
						style={{ background: '#FFFFFF', boxShadow: SHADOW }}
					>
						<div className="flex items-start justify-between mb-3 gap-4">
							<div className="flex items-start gap-3 min-w-0">
								<div
									className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
									style={{ background: '#D3E4F5' }}
								>
									<ClipboardList
										className="w-5 h-5"
										style={{ color: '#0F4C8A' }}
									/>
								</div>
								<div className="min-w-0">
									<p className="text-sm font-semibold text-slate-900 break-all">
										{order.productName ?? 'Purchase order'}
									</p>
									<p className="mt-1 text-xs text-slate-500">
										{order.buyerName ?? 'Buyer'} ·{' '}
										{formatMoney(order.totalPrice)}
									</p>
								</div>
							</div>
							<StatusChip status={order.status ?? 'pending_approval'} />
						</div>
						<div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
							<span>Unit: {formatMoney(order.finalUnitPrice)}</span>
							<span>
								Qty:{' '}
								{order.quantity
									? `${order.quantity.toLocaleString('vi-VN')} ${order.unitLabel ?? 'unit'}`
									: '-'}
							</span>
							<span>Delivery: {formatDate(order.finalDeliveryDate)}</span>
							<span>
								Assigned: {order.assignedTo ? 'Assigned' : 'Unassigned'}
							</span>
						</div>
					</button>
				))}
			</div>
		</div>
	);
}
