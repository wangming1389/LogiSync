'use client';

import {
	AlertTriangle,
	CheckCircle,
	DollarSign,
	Download,
	FileText,
	MapPin,
	Star,
	X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { getStoredAccessToken, parseJwtClaims } from '@/lib/auth';
import {
	loadRecentPurchaseOrders,
	PurchaseOrderSnapshot,
	unwrapApiList,
	upsertRecentPurchaseOrder,
	upsertRecentPurchaseOrders,
} from '@/lib/order-store';
import { updateWorkflowState, useWorkflowState } from '@/lib/workflow-store';

const orderStatusColor: Record<string, string> = {
	pending_approval: 'bg-yellow-100 text-yellow-700',
	approved: 'bg-blue-100 text-blue-700',
	goods_received: 'bg-green-100 text-green-700',
	confirmed: 'bg-blue-100 text-blue-700',
	in_transit: 'bg-orange-100 text-orange-700',
	delivered: 'bg-green-100 text-green-700',
	cancelled: 'bg-red-100 text-red-700',
	rejected: 'bg-red-100 text-red-700',
};

function displayOrderStatus(status: string) {
	if (status === 'approved') return 'confirmed';
	if (status === 'goods_received') return 'completed';
	return status;
}

function formatDate(value?: string | null) {
	if (!value) return '-';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value.slice(0, 10);
	return date.toISOString().slice(0, 10);
}

function currentWorkspaceId() {
	const token = getStoredAccessToken();
	const claims = token ? parseJwtClaims(token) : null;
	return typeof claims?.workspaceId === 'string' ? claims.workspaceId : null;
}

type OrderLabelMaps = {
	suppliers?: Map<string, string>;
	suppliersByOrder?: Map<string, string>;
	productsByQuotation?: Map<string, string>;
	productsByOrder?: Map<string, string>;
	quantitiesByQuotation?: Map<string, number>;
	quantitiesByOrder?: Map<string, number>;
	unitsByQuotation?: Map<string, string>;
	unitsByOrder?: Map<string, string>;
};

type SearchProductLabel = {
	id?: string;
	name?: string;
	sku?: string | null;
	uomId?: string | null;
	workspaceId?: string | null;
	supplierWorkspaceName?: string | null;
	supplierWorkspaceSlug?: string | null;
};

type RfqSummaryForLabel = {
	id?: string;
	parentRfqId?: string | null;
	supplierWorkspaceId?: string | null;
};

type QuotationForLabel = {
	id?: string;
	rfqId?: string;
	supplierWorkspaceId?: string | null;
	status?: string | null;
	totalPrice?: number | null;
	unitPrice?: number | null;
};

type ResolvedOrderLabels = {
	product?: string;
	supplier?: string;
	quantity?: number;
	unit?: string;
};

function isPlaceholderProductLabel(value?: string | null) {
	return !value || value.trim().toLowerCase() === 'purchase order';
}

function isPlaceholderSupplierLabel(value?: string | null) {
	return !value || /^Supplier [0-9a-f-]+$/i.test(value);
}

function supplierPrefixFromLabel(value?: string | null) {
	const match = value?.match(/^Supplier ([0-9a-f-]+)/i);
	return match?.[1]?.toLowerCase();
}

function mapPurchaseOrder(
	order: PurchaseOrderSnapshot,
	labelMaps: OrderLabelMaps = {},
) {
	const supplierLabel = order.supplierWorkspaceId
		? ((!isPlaceholderSupplierLabel(order.supplierName)
				? order.supplierName
				: undefined) ??
			labelMaps.suppliers?.get(order.supplierWorkspaceId) ??
			Array.from(labelMaps.suppliers?.entries() ?? []).find(([id]) =>
				id
					.toLowerCase()
					.startsWith(order.supplierWorkspaceId?.toLowerCase() ?? ''),
			)?.[1] ??
			`Supplier ${order.supplierWorkspaceId.slice(0, 8)}`)
		: (labelMaps.suppliersByOrder?.get(order.id) ??
			(!isPlaceholderSupplierLabel(order.supplierName)
				? order.supplierName
				: undefined) ??
			'Supplier');
	const productLabel =
		(!isPlaceholderProductLabel(order.productName)
			? order.productName
			: undefined) ??
		(order.quotationId
			? (labelMaps.productsByQuotation?.get(order.quotationId) ??
				Array.from(labelMaps.productsByQuotation?.entries() ?? []).find(
					([id]) => id.startsWith(order.quotationId ?? ''),
				)?.[1])
			: undefined) ??
		labelMaps.productsByOrder?.get(order.id) ??
		'Purchase order';

	return {
		id: order.id,
		supplier: supplierLabel,
		product: productLabel,
		qty:
			(order.quotationId
				? labelMaps.quantitiesByQuotation?.get(order.quotationId)
				: undefined) ??
			labelMaps.quantitiesByOrder?.get(order.id) ??
			1,
		unit:
			(order.quotationId
				? labelMaps.unitsByQuotation?.get(order.quotationId)
				: undefined) ??
			labelMaps.unitsByOrder?.get(order.id) ??
			'unit',
		totalValue: order.totalPrice ?? 0,
		status: order.status ?? 'pending_approval',
		createdAt: formatDate(order.createdAt),
		deliveryDate: formatDate(order.finalDeliveryDate),
		tracking: order.autoConfirmAt
			? `Auto-confirm ${formatDate(order.autoConfirmAt)}`
			: '-',
		raw: order,
	};
}

function formatProductLabel(item: any) {
	const product = item?.product;
	const name =
		(typeof product === 'string' ? product : product?.name) ??
		item?.productName ??
		item?.name;
	const sku = product?.sku ?? item?.productSku ?? item?.sku;
	if (name) return sku ? `${name} (${sku})` : name;
	return undefined;
}

function productIdFromItem(item: any) {
	return item?.productId ?? item?.product_id ?? item?.product?.id;
}

async function loadProductSearchMaps() {
	const productsById = new Map<string, string>();
	const productUnitsById = new Map<string, string>();
	const suppliersByWorkspaceId = new Map<string, string>();
	const uoms = new Map<string, string>();

	try {
		const uomResponse: any = await api.get('/uom');
		for (const uom of unwrapApiList<{
			id?: string;
			name?: string;
			code?: string;
		}>(uomResponse)) {
			if (uom.id)
				uoms.set(uom.id, uom.code?.toUpperCase() ?? uom.name ?? 'unit');
		}
	} catch {
		// Unit labels are optional display data.
	}

	try {
		const response: any = await api.get('/products/search?limit=25');
		for (const product of unwrapApiList<SearchProductLabel>(response)) {
			if (product.id && product.name) {
				productsById.set(
					product.id,
					product.sku ? `${product.name} (${product.sku})` : product.name,
				);
				if (product.uomId && uoms.has(product.uomId)) {
					productUnitsById.set(product.id, uoms.get(product.uomId) as string);
				}
			}
			if (product.workspaceId) {
				const supplierName =
					product.supplierWorkspaceName ?? product.supplierWorkspaceSlug;
				if (supplierName)
					suppliersByWorkspaceId.set(product.workspaceId, supplierName);
			}
		}
	} catch {
		// These maps are best-effort fallbacks for labels only.
	}

	return { productsById, productUnitsById, suppliersByWorkspaceId };
}

async function resolveQuotationOrderInfo(
	quotationId: string,
	productsById: Map<string, string>,
	productUnitsById: Map<string, string>,
) {
	const quoteResponse: any = await api.get(`/quotations/${quotationId}`);
	const quote =
		quoteResponse?.data?.data ?? quoteResponse?.data ?? quoteResponse;
	const quoteItems = Array.isArray(quote?.items) ? quote.items : [];
	const quoteItem = quoteItems[0];
	const quantity = quoteItem?.quantity;
	const quoteLabel = formatProductLabel(quoteItem);
	if (quoteLabel) return { product: quoteLabel, quantity };

	const quoteProductId = productIdFromItem(quoteItem);
	if (quoteProductId && productsById.has(quoteProductId)) {
		return {
			product: productsById.get(quoteProductId),
			quantity,
			unit: productUnitsById.get(quoteProductId),
		};
	}

	if (!quote?.rfqId) return { quantity };

	const rfqResponse: any = await api.get(`/rfqs/${quote.rfqId}`);
	const rfq = rfqResponse?.data?.data ?? rfqResponse?.data ?? rfqResponse;
	const rfqItems = Array.isArray(rfq?.items) ? rfq.items : [];
	const rfqItem = rfqItems[0];
	const rfqLabel = formatProductLabel(rfqItem);
	if (rfqLabel)
		return { product: rfqLabel, quantity: quantity ?? rfqItem?.quantity };

	const rfqProductId = productIdFromItem(rfqItem);
	if (rfqProductId && productsById.has(rfqProductId)) {
		return {
			product: productsById.get(rfqProductId),
			quantity: quantity ?? rfqItem?.quantity,
			unit: productUnitsById.get(rfqProductId),
		};
	}

	return { quantity: quantity ?? rfqItem?.quantity };
}

async function resolveQuotationProductLabel(
	quotationId: string,
	productsById: Map<string, string>,
	productUnitsById: Map<string, string>,
) {
	return (
		await resolveQuotationOrderInfo(quotationId, productsById, productUnitsById)
	).product;
}

function sameIdOrPrefix(left?: string | null, right?: string | null) {
	if (!left || !right) return false;
	const normalizedLeft = left.toLowerCase();
	const normalizedRight = right.toLowerCase();
	return (
		normalizedLeft === normalizedRight ||
		normalizedLeft.startsWith(normalizedRight) ||
		normalizedRight.startsWith(normalizedLeft)
	);
}

function sameMoney(left?: number | null, right?: number | null) {
	if (left == null || right == null) return false;
	return Math.abs(Number(left) - Number(right)) < 0.01;
}

async function resolveOrderLabelsWithoutQuotationId(
	order: PurchaseOrderSnapshot,
	productsById: Map<string, string>,
	productUnitsById: Map<string, string>,
	suppliersByWorkspaceId: Map<string, string>,
): Promise<ResolvedOrderLabels> {
	if (
		!order.supplierWorkspaceId &&
		!supplierPrefixFromLabel(order.supplierName) &&
		order.totalPrice == null
	) {
		return {};
	}
	const supplierHint =
		order.supplierWorkspaceId ?? supplierPrefixFromLabel(order.supplierName);

	const rfqResponse: any = await api.get('/rfqs?limit=100');
	const rfqs = unwrapApiList<RfqSummaryForLabel>(rfqResponse);
	const candidateRfqs = rfqs.filter(
		(rfq) =>
			rfq.id &&
			rfq.supplierWorkspaceId &&
			(!supplierHint || sameIdOrPrefix(rfq.supplierWorkspaceId, supplierHint)),
	);

	for (const rfq of candidateRfqs) {
		try {
			const quoteResponse: any = await api.get(`/rfqs/${rfq.id}/quotations`);
			const quotations = unwrapApiList<QuotationForLabel>(quoteResponse);
			const matchingQuote = quotations.find(
				(quotation) =>
					sameMoney(quotation.totalPrice, order.totalPrice) ||
					sameMoney(quotation.unitPrice, order.finalUnitPrice),
			);
			if (!matchingQuote?.id) continue;

			const info = await resolveQuotationOrderInfo(
				matchingQuote.id,
				productsById,
				productUnitsById,
			);
			const supplier = rfq.supplierWorkspaceId
				? suppliersByWorkspaceId.get(rfq.supplierWorkspaceId)
				: undefined;
			if (info.product || supplier) return { ...info, supplier };
		} catch {
			// Try the next RFQ candidate.
		}
	}

	return {};
}

async function loadOrderLabelMaps(orders: PurchaseOrderSnapshot[]) {
	const suppliers = new Map<string, string>();
	const suppliersByOrder = new Map<string, string>();
	const productsByQuotation = new Map<string, string>();
	const productsByOrder = new Map<string, string>();
	const quantitiesByQuotation = new Map<string, number>();
	const quantitiesByOrder = new Map<string, number>();
	const unitsByQuotation = new Map<string, string>();
	const unitsByOrder = new Map<string, string>();
	const { productsById, productUnitsById, suppliersByWorkspaceId } =
		await loadProductSearchMaps();

	const supplierIds = Array.from(
		new Set(
			orders
				.map((order) => order.supplierWorkspaceId)
				.filter((id): id is string => Boolean(id)),
		),
	);
	if (supplierIds.length > 0) {
		try {
			const response: any = await api.get(
				`/workspaces/public?ids=${supplierIds.join(',')}`,
			);
			for (const row of unwrapApiList<{ id?: string; name?: string }>(
				response,
			)) {
				if (row.id && row.name) suppliers.set(row.id, row.name);
			}
		} catch {
			// Fallback remains the short workspace label.
		}
	}
	for (const [workspaceId, supplierName] of suppliersByWorkspaceId) {
		if (!suppliers.has(workspaceId)) suppliers.set(workspaceId, supplierName);
	}

	await Promise.all(
		orders.map(async (order) => {
			try {
				if (order.quotationId) {
					const info = await resolveQuotationOrderInfo(
						order.quotationId,
						productsById,
						productUnitsById,
					);
					if (info.product) {
						productsByQuotation.set(order.quotationId, info.product);
					}
					if (info.quantity) {
						quantitiesByQuotation.set(order.quotationId, info.quantity);
					}
					if (info.unit) {
						unitsByQuotation.set(order.quotationId, info.unit);
					}
					return;
				}

				const labels = await resolveOrderLabelsWithoutQuotationId(
					order,
					productsById,
					productUnitsById,
					suppliersByWorkspaceId,
				);
				if (labels.product) {
					productsByOrder.set(order.id, labels.product);
				}
				if (labels.quantity) {
					quantitiesByOrder.set(order.id, labels.quantity);
				}
				if (labels.unit) {
					unitsByOrder.set(order.id, labels.unit);
				}
				if (labels.supplier) {
					suppliersByOrder.set(order.id, labels.supplier);
				}
			} catch {
				// Fallback remains "Purchase order".
			}
		}),
	);

	return {
		suppliers,
		suppliersByOrder,
		productsByQuotation,
		productsByOrder,
		quantitiesByQuotation,
		quantitiesByOrder,
		unitsByQuotation,
		unitsByOrder,
	};
}

function enrichOrderWithLabels(
	order: PurchaseOrderSnapshot,
	labelMaps: OrderLabelMaps,
): PurchaseOrderSnapshot {
	const mapped = mapPurchaseOrder(order, labelMaps);
	return {
		...order,
		supplierName:
			mapped.supplier !== 'Supplier' ? mapped.supplier : order.supplierName,
		productName:
			mapped.product !== 'Purchase order' ? mapped.product : order.productName,
	};
}

export default function BuyerOrdersTracking() {
	const [workflow, setWorkflow] = useWorkflowState();
	const [tab, setTab] = useState<
		'orders' | 'logistics' | 'delivery' | 'finance' | 'disputes'
	>('orders');
	const [selectedFreight, setSelectedFreight] = useState<string | null>(null);
	const [ePODAction, setEPODAction] = useState<'accepted' | 'disputed' | null>(
		workflow.epodStatus,
	);
	const [disputeModal, setDisputeModal] = useState<'escalate' | null>(null);
	const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(
		null,
	);
	const [escalateReason, setEscalateReason] = useState('');
	const [justification, setJustification] = useState('');
	const [showComplaintForm, setShowComplaintForm] = useState(false);
	const [compForm, setCompForm] = useState({
		type: 'Quality Issue',
		description: '',
		orderId: '',
	});
	const [filter, setFilter] = useState('All');
	const [realOrders, setRealOrders] = useState<
		ReturnType<typeof mapPurchaseOrder>[]
	>([]);
	const [ordersLoading, setOrdersLoading] = useState(false);
	const [ordersError, setOrdersError] = useState<string | null>(null);
	const [ordersNotice, setOrdersNotice] = useState<string | null>(null);
	const [receiptModal, setReceiptModal] = useState<string | null>(null);
	const [receiptForm, setReceiptForm] = useState({
		quantityReceived: '1',
		conditionNotes: '',
		actualDeliveryDate: new Date().toISOString().slice(0, 10),
	});

	useEffect(() => {
		setEPODAction(workflow.epodStatus);
	}, [workflow.epodStatus]);

	useEffect(() => {
		let mounted = true;
		async function loadOrders() {
			const workspaceId = currentWorkspaceId();
			setOrdersLoading(true);
			setOrdersError(null);
			try {
				const response: any = await api.get('/orders?limit=50');
				const apiOrders = unwrapApiList<PurchaseOrderSnapshot>(response);
				upsertRecentPurchaseOrders(apiOrders);
				const cached = loadRecentPurchaseOrders();
				const merged = [...apiOrders];
				for (const order of cached) {
					if (!merged.some((entry) => entry.id === order.id))
						merged.push(order);
				}
				const visibleOrders = merged.filter(
					(order) => !workspaceId || order.buyerWorkspaceId === workspaceId,
				);
				const labelMaps = await loadOrderLabelMaps(visibleOrders);
				const enrichedOrders = visibleOrders.map((order) =>
					enrichOrderWithLabels(order, labelMaps),
				);
				upsertRecentPurchaseOrders(enrichedOrders);
				if (mounted) {
					setRealOrders(
						enrichedOrders.map((order) => mapPurchaseOrder(order, labelMaps)),
					);
				}
			} catch (err: any) {
				const cached = loadRecentPurchaseOrders();
				if (mounted) {
					setOrdersError(err?.message ?? 'Failed to load orders.');
					const visibleOrders = cached.filter((order) => {
						const workspaceId = currentWorkspaceId();
						return !workspaceId || order.buyerWorkspaceId === workspaceId;
					});
					const labelMaps = await loadOrderLabelMaps(visibleOrders);
					const enrichedOrders = visibleOrders.map((order) =>
						enrichOrderWithLabels(order, labelMaps),
					);
					upsertRecentPurchaseOrders(enrichedOrders);
					setRealOrders(
						enrichedOrders.map((order) => mapPurchaseOrder(order, labelMaps)),
					);
				}
			} finally {
				if (mounted) setOrdersLoading(false);
			}
		}
		loadOrders();
		return () => {
			mounted = false;
		};
	}, []);

	const displayOrders =
		realOrders.length > 0 ? realOrders : workflow.buyerOrders;
	const statusOptions = [
		'All',
		'pending_approval',
		'confirmed',
		'completed',
		'in_transit',
		'delivered',
	];
	const filteredOrders =
		filter === 'All'
			? displayOrders
			: displayOrders.filter(
					(order) =>
						order.status === filter ||
						displayOrderStatus(order.status) === filter,
				);

	async function confirmReceipt(orderId: string) {
		setOrdersError(null);
		setOrdersNotice(null);
		try {
			const response: any = await api.patch(
				`/orders/${orderId}/confirm-receipt`,
				{},
			);
			const updated = response?.data?.data ?? response?.data ?? response;
			const labelMaps = await loadOrderLabelMaps([updated]);
			const enriched = enrichOrderWithLabels(updated, labelMaps);
			upsertRecentPurchaseOrder(enriched);
			setRealOrders((current) =>
				current.map((order) =>
					order.id === orderId ? mapPurchaseOrder(enriched, labelMaps) : order,
				),
			);
			setOrdersNotice('Goods receipt confirmed. Order moved to completed.');
			setReceiptModal(null);
		} catch (err: any) {
			setOrdersError(err?.message ?? 'Failed to confirm goods receipt.');
		}
	}

	function confirmCarrier(id: string) {
		const nextState = updateWorkflowState((currentState) => ({
			...currentState,
			confirmedCarrierId: id,
		}));
		setWorkflow(nextState);
		setSelectedFreight(null);
	}

	function escalate(id: string) {
		const nextState = updateWorkflowState((currentState) => ({
			...currentState,
			buyerComplaints: currentState.buyerComplaints.map((complaint) =>
				complaint.id === id ? { ...complaint, status: 'escalated' } : complaint,
			),
			disputeReason: escalateReason,
		}));
		setWorkflow(nextState);
		setDisputeModal(null);
		setSelectedComplaintId(null);
		setEscalateReason('');
	}

	function confirmPayment(id: string) {
		const nextState = updateWorkflowState((currentState) => ({
			...currentState,
			buyerMatching: currentState.buyerMatching.map((matching) =>
				matching.id === id ? { ...matching, status: 'matched' } : matching,
			),
		}));
		setWorkflow(nextState);
	}

	function submitComplaint() {
		if (!compForm.description || !compForm.orderId) return;
		const nextState = updateWorkflowState((currentState) => {
			const nextId = `COMP${String(currentState.buyerComplaints.length + 1).padStart(3, '0')}`;
			return {
				...currentState,
				buyerComplaints: [
					{
						id: nextId,
						orderId: compForm.orderId,
						type: compForm.type,
						description: compForm.description,
						evidence: [],
						status: 'in_progress',
						filedAt: new Date().toISOString().slice(0, 10),
					},
					...currentState.buyerComplaints,
				],
			};
		});
		setWorkflow(nextState);
		setShowComplaintForm(false);
		setCompForm({ type: 'Quality Issue', description: '', orderId: '' });
	}

	const currentMatching = useMemo(
		() => workflow.buyerMatching,
		[workflow.buyerMatching],
	);

	return (
		<div className="p-6">
			<h1 className="text-2xl text-gray-900 mb-6">
				Orders, Tracking & Finance
			</h1>

			<div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-6 flex-wrap">
				{[
					{ key: 'orders', label: 'Orders' },
					{ key: 'logistics', label: 'Freight Quotes' },
					{ key: 'delivery', label: 'Delivery & e-POD' },
					{ key: 'finance', label: 'Finance & Payment' },
					{ key: 'disputes', label: 'Disputes' },
				].map((item) => (
					<button
						key={item.key}
						onClick={() => setTab(item.key as typeof tab)}
						className={`px-3 py-2 rounded-md text-sm transition-all ${tab === item.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
					>
						{item.label}
					</button>
				))}
			</div>

			{tab === 'orders' && (
				<>
					<div className="flex gap-2 mb-4 flex-wrap">
						{statusOptions.map((status) => (
							<button
								key={status}
								onClick={() => setFilter(status)}
								className={`px-3 py-1.5 rounded-full text-sm capitalize ${filter === status ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
							>
								{status}
							</button>
						))}
						<button className="ml-auto flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
							<Download className="w-4 h-4" /> Export
						</button>
					</div>
					{ordersNotice && (
						<div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
							<CheckCircle className="w-4 h-4" /> {ordersNotice}
						</div>
					)}
					{ordersError && (
						<div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
							<AlertTriangle className="w-4 h-4" /> {ordersError}
						</div>
					)}
					{ordersLoading && (
						<p className="mb-3 text-sm text-gray-500">Loading orders...</p>
					)}
					<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
						<table className="w-full text-sm">
							<thead className="bg-gray-50 border-b border-gray-200">
								<tr>
									{[
										'Order ID',
										'Supplier',
										'Product',
										'Qty',
										'Value',
										'Status',
										'Delivery Date',
										'Tracking',
										'Action',
									].map((heading) => (
										<th
											key={heading}
											className="text-left px-4 py-3 text-xs text-gray-500 uppercase"
										>
											{heading}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{filteredOrders.map((order, index) => (
									<tr
										key={order.id}
										className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 0 ? '' : 'bg-gray-50/30'}`}
									>
										<td className="px-4 py-3 text-blue-600 font-mono text-xs">
											{order.id}
										</td>
										<td className="px-4 py-3 text-gray-900">
											{order.supplier}
										</td>
										<td className="px-4 py-3 text-gray-600">{order.product}</td>
										<td className="px-4 py-3 text-gray-600">
											{order.qty} {order.unit}
										</td>
										<td className="px-4 py-3 text-gray-900">
											₫{order.totalValue.toLocaleString('vi-VN')}
										</td>
										<td className="px-4 py-3">
											<span
												className={`text-xs px-2 py-0.5 rounded-full ${orderStatusColor[order.status] ?? 'bg-gray-100 text-gray-700'}`}
											>
												{displayOrderStatus(order.status).replace('_', ' ')}
											</span>
										</td>
										<td className="px-4 py-3 text-gray-500 text-xs">
											{order.deliveryDate}
										</td>
										<td className="px-4 py-3 text-xs text-blue-600 font-mono">
											{order.tracking}
										</td>
										<td className="px-4 py-3">
											{order.status === 'approved' ? (
												<button
													onClick={() => {
														setReceiptModal(order.id);
														setReceiptForm({
															quantityReceived: String(order.qty ?? 1),
															conditionNotes: '',
															actualDeliveryDate: new Date()
																.toISOString()
																.slice(0, 10),
														});
													}}
													className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
												>
													Confirm Receipt
												</button>
											) : (
												<span className="text-xs text-gray-400">-</span>
											)}
										</td>
									</tr>
								))}
								{filteredOrders.length === 0 && (
									<tr>
										<td
											colSpan={9}
											className="px-4 py-8 text-center text-sm text-gray-500"
										>
											No orders are visible for this buyer workspace.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</>
			)}

			{tab === 'logistics' && (
				<div>
					{workflow.confirmedCarrierId && (
						<div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg mb-4 text-sm text-green-700">
							<CheckCircle className="w-4 h-4" /> Carrier confirmed:{' '}
							{
								workflow.freightQuotesBuyer.find(
									(quote) => quote.id === workflow.confirmedCarrierId,
								)?.carrier
							}
						</div>
					)}
					<h2 className="text-gray-900 mb-4">
						Freight Quotations - Shipment SHIP001
					</h2>
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
						{workflow.freightQuotesBuyer.map((quote) => (
							<button
								key={quote.id}
								className={`bg-white rounded-xl border-2 shadow-sm p-5 cursor-pointer transition-all text-left ${selectedFreight === quote.id ? 'border-red-500' : 'border-gray-200 hover:border-red-300'}`}
								onClick={() => setSelectedFreight(quote.id)}
							>
								<div className="flex items-start justify-between mb-3">
									<p className="text-gray-900">{quote.carrier}</p>
									<div className="flex items-center gap-1">
										<Star className="w-3.5 h-3.5 text-yellow-500" />
										<span className="text-sm text-gray-600">
											{quote.carrierScore}
										</span>
									</div>
								</div>
								<div className="space-y-1 text-xs text-gray-600 mb-3">
									<div className="flex items-center gap-1">
										<MapPin className="w-3 h-3" />
										{quote.route}
									</div>
									<div>{quote.vehicleType}</div>
									<div>ETA: {quote.eta}</div>
								</div>
								<p className="text-gray-900 mb-1">
									₫{quote.price.toLocaleString('vi-VN')}
								</p>
								<p className="text-xs text-gray-500">{quote.notes}</p>
								{selectedFreight === quote.id && (
									<CheckCircle className="w-4 h-4 text-red-500 mt-2" />
								)}
							</button>
						))}
					</div>
					<button
						disabled={!selectedFreight}
						onClick={() => confirmCarrier(selectedFreight!)}
						className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm disabled:opacity-40"
					>
						<CheckCircle className="w-4 h-4" /> Confirm Carrier Selection
					</button>
				</div>
			)}

			{tab === 'delivery' && (
				<div className="max-w-2xl mx-auto space-y-5">
					<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
						<h2 className="text-gray-900 mb-4">Review e-POD - SHIP002</h2>
						<div className="grid grid-cols-2 gap-3 mb-4">
							{[
								['Driver', 'Tran Minh Duc'],
								['Vehicle', '51G-67890'],
								['Cargo', 'Soybeans 200MT'],
								['Shipment', 'SHIP002'],
							].map(([label, value]) => (
								<div key={label} className="bg-gray-50 rounded-lg p-2">
									<p className="text-xs text-gray-400">{label}</p>
									<p className="text-sm text-gray-900">{value}</p>
								</div>
							))}
						</div>
						<div className="space-y-2 mb-5">
							{[
								{
									name: 'Geofence Check-in',
									completed: true,
									timestamp: '2026-04-13 14:22',
								},
								{
									name: 'Photo Capture',
									completed: true,
									timestamp: '2026-04-13 14:25',
								},
								{
									name: 'Signature Capture',
									completed: false,
									timestamp: null,
								},
								{ name: 'Submit', completed: false, timestamp: null },
							].map((step, index) => (
								<div
									key={step.name}
									className={`flex items-center gap-3 p-3 rounded-lg ${step.completed ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}
								>
									<CheckCircle
										className={`w-4 h-4 ${step.completed ? 'text-green-500' : 'text-gray-300'}`}
									/>
									<div>
										<p className="text-sm text-gray-900">{step.name}</p>
										{step.timestamp && (
											<p className="text-xs text-gray-500">{step.timestamp}</p>
										)}
									</div>
								</div>
							))}
						</div>
						{!ePODAction && (
							<div className="flex gap-3">
								<button
									onClick={() => {
										setEPODAction('accepted');
										const nextState = updateWorkflowState((currentState) => ({
											...currentState,
											epodStatus: 'accepted',
										}));
										setWorkflow(nextState);
									}}
									className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
								>
									<CheckCircle className="w-4 h-4" /> Accept & Confirm Goods
									Receipt
								</button>
								<button
									onClick={() => {
										setEPODAction('disputed');
										const nextState = updateWorkflowState((currentState) => ({
											...currentState,
											epodStatus: 'disputed',
										}));
										setWorkflow(nextState);
									}}
									className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
								>
									<AlertTriangle className="w-4 h-4" /> Raise Dispute
								</button>
							</div>
						)}
						{ePODAction === 'accepted' && (
							<div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
								<CheckCircle className="w-4 h-4" /> Goods Receipt confirmed.
								Supplier and carrier notified.
							</div>
						)}
						{ePODAction === 'disputed' && (
							<div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
								<AlertTriangle className="w-4 h-4" /> Dispute raised. Go to
								Disputes tab to file complaint.
							</div>
						)}
					</div>
				</div>
			)}

			{tab === 'finance' && (
				<div className="space-y-4">
					<div className="text-sm text-gray-500 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2 mb-2">
						<FileText className="w-4 h-4 text-blue-600" /> Only matched or
						approved-with-exception orders are eligible for payment.
					</div>
					{currentMatching.map((matching) => {
						const isDiscrepancy = matching.status === 'discrepancy';
						return (
							<div
								key={matching.id}
								className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
							>
								<div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
									<p className="text-gray-900">Order {matching.orderId}</p>
									<span
										className={`text-xs px-2 py-0.5 rounded-full ${matching.status === 'matched' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
									>
										{matching.status}
									</span>
								</div>
								<div className="grid grid-cols-4 divide-x divide-gray-200">
									{[
										{
											label: 'Purchase Order',
											items: [
												['PO ID', matching.po.id],
												['Qty', `${matching.po.qty} MT`],
												[
													'Total',
													`₫${matching.po.total.toLocaleString('vi-VN')}`,
												],
											],
										},
										{
											label: 'Goods Receipt',
											items: [
												['GR ID', matching.goodsReceipt.id],
												['Qty', `${matching.goodsReceipt.qty} MT`],
												['Date', matching.goodsReceipt.receivedDate],
											],
										},
										{
											label: 'Supplier Invoice',
											items: [
												['INV ID', matching.invoice.id],
												[
													'Total',
													`₫${matching.invoice.total.toLocaleString('vi-VN')}`,
												],
												['Due', matching.invoice.dueDate],
											],
										},
										{
											label: 'Freight Invoice',
											items: [
												['FI ID', matching.freightInvoice.id],
												[
													'Amount',
													`₫${matching.freightInvoice.amount.toLocaleString('vi-VN')}`,
												],
												['Due', matching.freightInvoice.dueDate],
											],
										},
									].map((column) => (
										<div
											key={column.label}
											className={`p-4 ${column.label === 'Goods Receipt' && isDiscrepancy ? 'bg-red-50' : ''}`}
										>
											<p className="text-xs text-gray-500 mb-2">
												{column.label}
											</p>
											{column.items.map(([key, value]) => (
												<div
													key={key}
													className="flex justify-between text-xs mb-1"
												>
													<span className="text-gray-400">{key}</span>
													<span className="text-gray-900 truncate">
														{value}
													</span>
												</div>
											))}
										</div>
									))}
								</div>
								<div className="px-5 py-3 border-t border-gray-200 flex items-center justify-between">
									{matching.status === 'matched' ? (
										<>
											<p className="text-sm text-green-600">
												All documents matched. Ready for payment.
											</p>
											<button
												onClick={() => confirmPayment(matching.id)}
												className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
											>
												<DollarSign className="w-4 h-4" /> Execute Payment
											</button>
										</>
									) : (
										<>
											<p className="text-sm text-red-600">
												Quantity discrepancy - submit justification to proceed.
											</p>
											<div className="flex gap-2">
												<input
													value={justification}
													onChange={(e) => setJustification(e.target.value)}
													placeholder="Justification..."
													className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
												/>
												<button
													disabled={!justification}
													onClick={() => confirmPayment(matching.id)}
													className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm disabled:opacity-40"
												>
													Confirm with Exception
												</button>
											</div>
										</>
									)}
								</div>
							</div>
						);
					})}
				</div>
			)}

			{tab === 'disputes' && (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
					<div className="space-y-3">
						{workflow.buyerComplaints.map((complaint) => (
							<div
								key={complaint.id}
								className="bg-white rounded-xl border border-gray-200 shadow-sm p-5"
							>
								<div className="flex items-start justify-between mb-2">
									<div>
										<p className="text-gray-900">
											{complaint.id} — {complaint.type}
										</p>
										<p className="text-xs text-gray-500 mt-0.5">
											Order {complaint.orderId} · Filed {complaint.filedAt}
										</p>
									</div>
									<span
										className={`text-xs px-2 py-0.5 rounded-full ${complaint.status === 'escalated' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}
									>
										{complaint.status}
									</span>
								</div>
								<p className="text-sm text-gray-600 mb-3">
									{complaint.description}
								</p>
								{complaint.status !== 'escalated' && (
									<button
										onClick={() => {
											setDisputeModal('escalate');
											setSelectedComplaintId(complaint.id);
											setEscalateReason('');
										}}
										className="text-sm text-red-600 font-medium"
									>
										Escalate
									</button>
								)}
							</div>
						))}
					</div>
					<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-gray-900">File Complaint</h2>
							<button
								onClick={() => setShowComplaintForm((value) => !value)}
								className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
							>
								<AlertTriangle className="w-4 h-4" /> New Complaint
							</button>
						</div>
						{showComplaintForm && (
							<div className="space-y-3">
								<div>
									<label className="block text-sm text-gray-700 mb-1">
										Order ID
									</label>
									<input
										value={compForm.orderId}
										onChange={(e) =>
											setCompForm({ ...compForm, orderId: e.target.value })
										}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
									/>
								</div>
								<div>
									<label className="block text-sm text-gray-700 mb-1">
										Type
									</label>
									<input
										value={compForm.type}
										onChange={(e) =>
											setCompForm({ ...compForm, type: e.target.value })
										}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
									/>
								</div>
								<div>
									<label className="block text-sm text-gray-700 mb-1">
										Description
									</label>
									<textarea
										value={compForm.description}
										onChange={(e) =>
											setCompForm({ ...compForm, description: e.target.value })
										}
										rows={3}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
										placeholder="Describe the issue..."
									/>
								</div>
								<div className="flex gap-2 mt-4">
									<button
										onClick={() => setShowComplaintForm(false)}
										className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-600 text-sm"
									>
										Cancel
									</button>
								</div>
								<div className="flex gap-2 justify-end">
									<button
										onClick={() => setShowComplaintForm(false)}
										className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 text-sm"
									>
										Cancel
									</button>
									<button
										onClick={submitComplaint}
										className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
									>
										Submit
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			)}

			{disputeModal === 'escalate' && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
						<h3 className="text-lg text-gray-900 mb-4">Escalate Complaint</h3>
						<textarea
							value={escalateReason}
							onChange={(e) => setEscalateReason(e.target.value)}
							rows={4}
							placeholder="Reason for escalation..."
							className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
						/>
						<div className="flex gap-2 mt-4">
							<button
								onClick={() => setDisputeModal(null)}
								className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-600 text-sm"
							>
								Cancel
							</button>
							<button
								onClick={() => escalate(selectedComplaintId ?? '')}
								disabled={!escalateReason || !selectedComplaintId}
								className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm disabled:opacity-40"
							>
								Escalate
							</button>
						</div>
					</div>
				</div>
			)}

			{receiptModal && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
						<h3 className="text-lg text-gray-900 mb-4">
							Confirm Goods Receipt
						</h3>
						<div className="space-y-3">
							<div>
								<label className="block text-sm text-gray-700 mb-1">
									Quantity received
								</label>
								<input
									type="number"
									min="1"
									value={receiptForm.quantityReceived}
									onChange={(event) =>
										setReceiptForm({
											...receiptForm,
											quantityReceived: event.target.value,
										})
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
								/>
							</div>
							<div>
								<label className="block text-sm text-gray-700 mb-1">
									Condition notes
								</label>
								<textarea
									value={receiptForm.conditionNotes}
									onChange={(event) =>
										setReceiptForm({
											...receiptForm,
											conditionNotes: event.target.value,
										})
									}
									rows={3}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
									placeholder="Condition notes..."
								/>
							</div>
							<div>
								<label className="block text-sm text-gray-700 mb-1">
									Actual delivery date
								</label>
								<input
									type="date"
									value={receiptForm.actualDeliveryDate}
									onChange={(event) =>
										setReceiptForm({
											...receiptForm,
											actualDeliveryDate: event.target.value,
										})
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
								/>
							</div>
						</div>
						<div className="flex gap-2 mt-5">
							<button
								onClick={() => setReceiptModal(null)}
								className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-600 text-sm"
							>
								Cancel
							</button>
							<button
								onClick={() => confirmReceipt(receiptModal)}
								disabled={
									!receiptForm.quantityReceived ||
									Number(receiptForm.quantityReceived) <= 0 ||
									!receiptForm.actualDeliveryDate
								}
								className="flex-1 py-2.5 bg-green-600 text-white rounded-lg text-sm disabled:opacity-40"
							>
								Submit Receipt
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
