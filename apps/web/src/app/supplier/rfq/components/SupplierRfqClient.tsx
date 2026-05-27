'use client';

import { ChevronLeft, FileText, Save, Send } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import {
	getClaimsWorkspaceTypes,
	getStoredAccessToken,
	parseJwtClaims,
} from '@/lib/auth';
import { saveWorkflowState, useWorkflowState } from '@/lib/workflow-store';

type BackendRfqItem = {
	id?: string;
	product?: string;
	productName?: string;
	sku?: string;
	productSku?: string;
	productId?: string;
	quantity?: number;
	qty?: number;
	unit?: string;
	deliveryDate?: string;
	notes?: string | null;
};

type ProductLookup = {
	id?: string;
	name?: string;
	sku?: string | null;
	uomId?: string | null;
};

type UomOption = {
	id: string;
	name: string;
	code: string;
};

type BackendRfqDetail = {
	id: string;
	buyerWorkspaceId?: string;
	parentRfqId?: string | null;
	supplierWorkspaceId?: string | null;
	note?: string | null;
	status?: string;
	submittedAt?: string | null;
	createdAt?: string | null;
	updatedAt?: string | null;
	items?: BackendRfqItem[];
	quotation?: unknown;
};

function unwrapApiResponse<T>(response: any): T {
	let payload = response;
	if (payload?.data !== undefined) payload = payload.data;
	if (payload?.success !== undefined && payload?.data !== undefined) {
		payload = payload.data;
	}
	return payload as T;
}

function unwrapList<T>(response: any): T[] {
	const payload = unwrapApiResponse<any>(response);
	if (Array.isArray(payload)) return payload as T[];
	if (Array.isArray(payload?.items)) return payload.items as T[];
	if (Array.isArray(payload?.data)) return payload.data as T[];
	if (Array.isArray(payload?.data?.items)) return payload.data.items as T[];
	return [];
}

function logRfqDebug(label: string, data: unknown) {
	console.log(`[RFQ_DEBUG][Supplier] ${label}`, data);
}

function getAuthDebugClaims() {
	const token = getStoredAccessToken();
	const claims = token ? parseJwtClaims(token) : null;
	return {
		role: claims?.role ?? claims?.userRole,
		workspaceId: claims?.workspaceId,
		workspaceTypes: getClaimsWorkspaceTypes(claims),
	};
}

function isSupplierCompanyAdminSession() {
	const claims = getAuthDebugClaims();
	return claims.role === 'company_admin' && claims.workspaceTypes.includes('supplier');
}

function formatBuyerLabel(rfq: BackendRfqDetail) {
	if (!rfq.buyerWorkspaceId) return 'Buyer';
	return `Buyer ${rfq.buyerWorkspaceId.slice(0, 8)}`;
}

function displayProductName(
	item: BackendRfqItem,
	products: Map<string, string>,
) {
	if (item.product) return item.product;
	if (item.productName) {
		return item.productSku || item.sku
			? `${item.productName} (${item.productSku ?? item.sku})`
			: item.productName;
	}
	if (item.productId && products.has(item.productId)) {
		return products.get(item.productId) as string;
	}
	return item.productId ? `Product ${item.productId.slice(0, 8)}` : 'Product';
}

function mapStatus(status?: string) {
	if (status === 'pending_response') return 'pending';
	if (status === 'responded') return 'submitted';
	return status ?? 'pending';
}

function formatDateForInput(value?: string | null) {
	if (!value) return '';
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return value.slice(0, 10);
	return parsed.toISOString().slice(0, 10);
}

function mapRfqToWorkflow(
	rfq: BackendRfqDetail,
	names: {
		buyers: Map<string, string>;
		products: Map<string, string>;
		units: Map<string, string>;
	},
) {
	const items = Array.isArray(rfq.items) ? rfq.items : [];
	const firstItem = items[0];
	const totalQty = items.reduce(
		(total, item) => total + (item.quantity ?? item.qty ?? 0),
		0,
	);
	const mappedItems = items.map((item) => {
		const productId = item.productId;
		return {
			id: item.id,
			product: displayProductName(item, names.products),
			qty: item.quantity ?? item.qty ?? 0,
			unit:
				(item.productId ? names.units.get(item.productId) : undefined) ??
				item.unit ??
				'unit',
			productId,
			deliveryDate: formatDateForInput(item.deliveryDate),
			notes: item.notes ?? undefined,
		};
	});
	const summary =
		mappedItems.length > 1
			? `${mappedItems[0]?.product ?? 'Mixed Basket'} + ${mappedItems.length - 1} more`
			: (mappedItems[0]?.product ?? rfq.note ?? 'RFQ');

	return {
		id: rfq.id,
		buyer: rfq.buyerWorkspaceId
			? (names.buyers.get(rfq.buyerWorkspaceId) ?? formatBuyerLabel(rfq))
			: 'Buyer',
		product: summary,
		qty: totalQty || (firstItem?.quantity ?? firstItem?.qty ?? 0),
		unit: mappedItems[0]?.unit ?? firstItem?.unit ?? 'MT',
		deliveryDate:
			mappedItems[0]?.deliveryDate ??
			formatDateForInput(rfq.submittedAt ?? rfq.createdAt) ??
			'',
		status: mapStatus(rfq.status),
		receivedAt: (
			rfq.submittedAt ??
			rfq.createdAt ??
			rfq.updatedAt ??
			new Date().toISOString()
		).slice(0, 10),
		notes: rfq.note ?? firstItem?.notes ?? '',
		items: mappedItems,
		quotation: undefined,
	};
}

const statusColor: Record<string, { bg: string; color: string }> = {
	pending: { bg: '#FFEFC6', color: '#7A4F00' },
	draft_saved: { bg: '#D3E4F5', color: '#0F4C8A' },
	submitted: { bg: '#C8F0D8', color: '#1B6B3A' },
};

export default function SupplierRfqClient() {
	const [workflow, setWorkflow] = useWorkflowState();
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [form, setForm] = useState({ price: '', terms: '', notes: '' });
	const [submittedMessage, setSubmittedMessage] = useState('');
	const [loadingRfqs, setLoadingRfqs] = useState(false);
	const [rfqError, setRfqError] = useState<string | null>(null);
	const [savingQuotation, setSavingQuotation] = useState(false);

	useEffect(() => {
		let mounted = true;
		setLoadingRfqs(true);
		setRfqError(null);

		(async () => {
			try {
				logRfqDebug('load:start', {
					auth: getAuthDebugClaims(),
				});
				const response: any = await api.get('/rfqs?limit=50');
				logRfqDebug('list:response', response);
				const rawItems = unwrapList<BackendRfqDetail>(response);
				logRfqDebug('list:raw-items', {
					count: rawItems.length,
					items: rawItems.map((rfq) => ({
						id: rfq.id,
						status: rfq.status,
						parentRfqId: rfq.parentRfqId,
						buyerWorkspaceId: rfq.buyerWorkspaceId,
						supplierWorkspaceId: rfq.supplierWorkspaceId,
					})),
				});
				const items = rawItems.filter((rfq) =>
					['pending_response', 'responded'].includes(
						rfq.status ?? 'pending_response',
					),
				);
				const buyerIds = Array.from(
					new Set(
						items
							.map((rfq) => rfq.buyerWorkspaceId)
							.filter((id): id is string => Boolean(id)),
					),
				);
				const buyerNames = new Map<string, string>();
				if (buyerIds.length > 0) {
					try {
						const namesRes: any = await api.get(
							`/workspaces/public?ids=${buyerIds.join(',')}`,
						);
						for (const row of unwrapList<{ id?: string; name?: string }>(
							namesRes,
						)) {
							if (row.id && row.name) buyerNames.set(row.id, row.name);
						}
					} catch {
						// Fall back to short workspace labels.
					}
				}
				const productNames = new Map<string, string>();
				const productUnits = new Map<string, string>();
				const uomNames = new Map<string, string>();
				try {
					const uomRes: any = await api.get('/uom');
					for (const uom of unwrapList<UomOption>(uomRes)) {
						uomNames.set(uom.id, uom.code ? uom.code.toUpperCase() : uom.name);
					}
				} catch {
					// Unit labels are optional display data.
				}
				try {
					const productsRes: any = await api.get('/catalog/products?limit=25');
					for (const product of unwrapList<ProductLookup>(productsRes)) {
						if (!product.id || !product.name) continue;
						productNames.set(
							product.id,
							product.sku ? `${product.name} (${product.sku})` : product.name,
						);
						if (product.uomId && uomNames.has(product.uomId)) {
							productUnits.set(
								product.id,
								uomNames.get(product.uomId) as string,
							);
						}
					}
				} catch {
					// Fall back to names embedded in the RFQ detail.
				}
				logRfqDebug('list:unwrapped', {
					count: items.length,
					items: items.map((rfq) => ({
						id: rfq.id,
						status: rfq.status,
						buyerWorkspaceId: rfq.buyerWorkspaceId,
					})),
				});

				const mapped = await Promise.all(
					items.map(async (rfq) => {
						const detailResponse: any = await api.get(`/rfqs/${rfq.id}`);
						logRfqDebug('detail:response', {
							rfqId: rfq.id,
							response: detailResponse,
						});
						const detail = unwrapApiResponse<BackendRfqDetail>(detailResponse);
						const missingProductIds = Array.from(
							new Set(
								(detail.items ?? [])
									.map((item) => item.productId)
									.filter(
										(id): id is string =>
											typeof id === 'string' && !productNames.has(id),
									),
							),
						);
						await Promise.all(
							missingProductIds.map(async (productId) => {
								try {
									const productResponse: any = await api.get(
										`/catalog/products/${productId}`,
									);
									const product =
										unwrapApiResponse<ProductLookup>(productResponse);
									if (product.id && product.name) {
										productNames.set(
											product.id,
											product.sku
												? `${product.name} (${product.sku})`
												: product.name,
										);
										if (product.uomId && uomNames.has(product.uomId)) {
											productUnits.set(
												product.id,
												uomNames.get(product.uomId) as string,
											);
										}
									}
								} catch {
									// Keep product id fallback for inaccessible/missing products.
								}
							}),
						);
						return mapRfqToWorkflow(detail, {
							buyers: buyerNames,
							products: productNames,
							units: productUnits,
						});
					}),
				);
				logRfqDebug('mapped', {
					count: mapped.length,
					items: mapped.map((rfq) => ({
						id: rfq.id,
						status: rfq.status,
						product: rfq.product,
						itemCount: rfq.items?.length ?? 0,
					})),
				});

				if (mounted) {
					setWorkflow((currentState) => ({
						...currentState,
						supplierRfqs: mapped,
					}));
				}
			} catch (error) {
				try {
					console.error(
						'SupplierRfqClient: failed to load RFQs',
						JSON.stringify(error),
					);
				} catch {
					console.error('SupplierRfqClient: failed to load RFQs', error);
				}
				if (mounted) {
					const message =
						error && typeof error === 'object'
							? ((error as any).message ?? JSON.stringify(error))
							: String(error);
					setRfqError(message || 'Failed to load RFQs');
				}
			} finally {
				if (mounted) setLoadingRfqs(false);
			}
		})();

		return () => {
			mounted = false;
		};
	}, [setWorkflow]);

	useEffect(() => {
		if (!selectedId && workflow.supplierRfqs.length > 0) {
			setSelectedId(workflow.supplierRfqs[0].id);
		}
	}, [selectedId, workflow.supplierRfqs]);

	const detail = useMemo(
		() => workflow.supplierRfqs.find((rfq) => rfq.id === selectedId) ?? null,
		[workflow.supplierRfqs, selectedId],
	);

	useEffect(() => {
		if (!detail?.quotation) return;
		setForm({
			price: String(detail.quotation.price),
			terms: detail.quotation.terms,
			notes: detail.quotation.notes,
		});
	}, [detail]);

	function getQuotationDeliveryDate() {
		const raw = detail?.deliveryDate;
		const parsed = raw ? new Date(raw) : null;
		if (parsed && !Number.isNaN(parsed.getTime())) {
			return parsed.toISOString();
		}
		const fallback = new Date();
		fallback.setDate(fallback.getDate() + 7);
		return fallback.toISOString();
	}

	async function persist(status: 'draft_saved' | 'submitted') {
		if (!detail || !form.price) return;
		const unitPrice = Number(form.price);
		if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
			setRfqError('Quoted price must be greater than 0.');
			return;
		}
		const quotationItems =
			detail.items
				?.filter((item) => item.id)
				.map((item) => ({
					rfqItemId: item.id as string,
					unitPrice,
					quantity: item.qty || 1,
				})) ?? [];

		if (quotationItems.length === 0) {
			setRfqError(
				'RFQ detail is missing item ids, so quotation cannot be submitted.',
			);
			return;
		}

		setSavingQuotation(true);
		setRfqError(null);
		try {
			logRfqDebug('quotation:submit:start', {
				auth: getAuthDebugClaims(),
				rfqId: detail.id,
				mode: status === 'draft_saved' ? 'draft' : 'submit',
				unitPrice,
				items: quotationItems,
			});
			const quotationResponse: any = await api.post(
				`/rfqs/${detail.id}/quotations`,
				{
					mode: status === 'draft_saved' ? 'draft' : 'submit',
					unitPrice,
					estimatedDeliveryDate: getQuotationDeliveryDate(),
					deliveryTerms: form.terms.trim() || 'To be negotiated',
					note: form.notes.trim() || undefined,
					items: quotationItems,
				},
			);
			logRfqDebug('quotation:submit:response', quotationResponse);
			const quotation = unwrapApiResponse<any>(quotationResponse);
			const nextState = {
				...workflow,
				supplierRfqs: workflow.supplierRfqs.map((rfq) =>
					rfq.id === detail.id
						? {
								...rfq,
								status,
								quotation: {
									id: quotation?.id,
									price: unitPrice,
									terms: form.terms.trim() || 'To be negotiated',
									notes: form.notes,
									submittedAt:
										quotation?.submittedAt ??
										new Date().toLocaleString('vi-VN'),
								},
							}
						: rfq,
				),
			};

			setWorkflow(nextState);
			saveWorkflowState(nextState);
			setSubmittedMessage(
				status === 'submitted'
					? 'Quotation submitted successfully.'
					: 'Quotation draft saved.',
			);
			if (status === 'submitted') {
				setSelectedId(null);
			}
		} catch (error) {
			try {
				console.error(
					'SupplierRfqClient: quotation save failed',
					JSON.stringify(error),
				);
			} catch {
				console.error('SupplierRfqClient: quotation save failed', error);
			}
			const message =
				error && typeof error === 'object'
					? ((error as any).message ?? JSON.stringify(error))
					: String(error);
			setRfqError(message || 'Failed to submit quotation.');
		} finally {
			setSavingQuotation(false);
		}
	}

	if (selectedId && detail) {
		const s = statusColor[detail.status] ?? { bg: '#E0E4EB', color: '#191C1E' };

		return (
			<div className="p-6 max-w-2xl mx-auto">
				<button
					onClick={() => setSelectedId(null)}
					className="flex items-center gap-1 mb-4 hover:opacity-80"
					style={{ fontSize: 13, color: 'rgba(25,28,30,0.55)' }}
				>
					<ChevronLeft className="w-4 h-4" /> Back
				</button>
				<div
					className="rounded-xl p-6"
					style={{
						background: '#FFFFFF',
						boxShadow: '0px 8px 24px rgba(15,76,138,0.08)',
					}}
				>
					<div className="flex items-start justify-between mb-5">
						<div>
							<h2 style={{ color: '#191C1E' }}>Respond to {detail.product}</h2>
							<p
								style={{
									fontSize: 13,
									color: 'rgba(25,28,30,0.55)',
									marginTop: 2,
								}}
							>
								From: {detail.buyer} · Received: {detail.receivedAt}
							</p>
						</div>
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
							{detail.status.replace('_', ' ').toUpperCase()}
						</span>
					</div>
					<div
						className="rounded-lg p-4 mb-5 grid grid-cols-2 gap-3"
						style={{ background: '#F2F4F7' }}
					>
						{[
							['Product', detail.product],
							['Quantity', `${detail.qty} ${detail.unit}`],
							['Delivery Date', detail.deliveryDate],
							['Buyer Notes', detail.notes || '—'],
						].map(([label, value]) => (
							<div key={label}>
								<p
									style={{
										fontSize: 11,
										fontWeight: 500,
										letterSpacing: '0.05em',
										textTransform: 'uppercase',
										color: 'rgba(25,28,30,0.55)',
									}}
								>
									{label}
								</p>
								<p style={{ fontSize: 14, color: '#191C1E', marginTop: 2 }}>
									{value}
								</p>
							</div>
						))}
					</div>
					{submittedMessage && (
						<div
							className="flex items-center gap-2 p-3 rounded-lg mb-4"
							style={{ background: '#C8F0D8', fontSize: 13, color: '#1B6B3A' }}
						>
							<Send className="w-4 h-4" /> {submittedMessage}
						</div>
					)}
					{rfqError && <p className="mb-4 text-sm text-red-600">{rfqError}</p>}
					<div className="space-y-4">
						<div>
							<label
								className="block mb-1"
								style={{
									fontSize: 11,
									fontWeight: 500,
									letterSpacing: '0.05em',
									textTransform: 'uppercase',
									color: 'rgba(25,28,30,0.6)',
								}}
							>
								Quoted Price (₫/{detail.unit}) *
							</label>
							<input
								type="number"
								value={form.price}
								onChange={(e) => setForm({ ...form, price: e.target.value })}
								placeholder="Enter unit price..."
								className="w-full px-3 h-10 rounded-t-[6px] focus:outline-none"
								style={{
									background: '#D5DAE3',
									borderBottom: '2px solid #00559F',
									color: '#191C1E',
									fontSize: 14,
								}}
							/>
						</div>
						<div>
							<label
								className="block mb-1"
								style={{
									fontSize: 11,
									fontWeight: 500,
									letterSpacing: '0.05em',
									textTransform: 'uppercase',
									color: 'rgba(25,28,30,0.6)',
								}}
							>
								Payment Terms
							</label>
							<input
								value={form.terms}
								onChange={(e) => setForm({ ...form, terms: e.target.value })}
								placeholder="e.g. 30% advance, 70% on delivery"
								className="w-full px-3 h-10 rounded-t-[6px] focus:outline-none"
								style={{
									background: '#D5DAE3',
									borderBottom: '2px solid #00559F',
									color: '#191C1E',
									fontSize: 14,
								}}
							/>
						</div>
						<div>
							<label
								className="block mb-1"
								style={{
									fontSize: 11,
									fontWeight: 500,
									letterSpacing: '0.05em',
									textTransform: 'uppercase',
									color: 'rgba(25,28,30,0.6)',
								}}
							>
								Additional Notes
							</label>
							<textarea
								value={form.notes}
								onChange={(e) => setForm({ ...form, notes: e.target.value })}
								rows={3}
								placeholder="Quality specs, certifications, lead time..."
								className="w-full px-3 py-2 rounded-t-[6px] focus:outline-none resize-none"
								style={{
									background: '#D5DAE3',
									borderBottom: '2px solid #00559F',
									color: '#191C1E',
									fontSize: 14,
								}}
							/>
						</div>
					</div>
					<div className="flex gap-3 mt-5">
						<button
							onClick={() => {
								void persist('draft_saved');
							}}
							disabled={savingQuotation}
							className="flex items-center gap-2 px-4 py-2.5 rounded-[6px] disabled:opacity-50"
							style={{
								background: '#D5DAE3',
								color: '#191C1E',
								fontWeight: 500,
								fontSize: 13,
							}}
						>
							<Save className="w-4 h-4" /> Save Draft
						</button>
						<button
							onClick={() => {
								void persist('submitted');
							}}
							disabled={!form.price || savingQuotation}
							className="flex items-center gap-2 px-5 py-2.5 text-white rounded-[6px] disabled:opacity-40 transition-all hover:brightness-105"
							style={{
								background: 'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)',
								fontWeight: 600,
								fontSize: 12,
								letterSpacing: '0.05em',
							}}
						>
							<Send className="w-4 h-4" /> SUBMIT QUOTATION
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6">
			<div className="mb-6">
				<h1 style={{ color: '#191C1E' }}>RFQ Management</h1>
				<p className="mt-1 text-sm text-slate-500">
					Respond to buyer RFQs and track quotation status.
				</p>
				{loadingRfqs && (
					<p className="mt-2 text-xs text-slate-400">Loading RFQs...</p>
				)}
				{rfqError && <p className="mt-2 text-xs text-red-600">{rfqError}</p>}
				{isSupplierCompanyAdminSession() && (
					<div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
						You are logged in as company_admin in a Supplier workspace. The RFQ
						API currently treats company_admin as a Buyer role first, so this
						view may not receive child RFQs addressed to the Supplier. Use a
						supplier_staff or supplier_manager account to respond to RFQs.
					</div>
				)}
			</div>
			{submittedMessage && (
				<div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
					{submittedMessage}
				</div>
			)}
			<div className="space-y-3">
				{workflow.supplierRfqs.map((rfq) => {
					const s = statusColor[rfq.status] ?? {
						bg: '#E0E4EB',
						color: '#191C1E',
					};
					return (
						<button
							key={rfq.id}
							onClick={() => setSelectedId(rfq.id)}
							className="w-full text-left rounded-xl p-5 transition-all"
							style={{
								background: '#FFFFFF',
								boxShadow: '0px 8px 24px rgba(15,76,138,0.08)',
							}}
						>
							<div className="flex items-start justify-between mb-2">
								<div className="flex items-start gap-3">
									<div
										className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
										style={{ background: '#D3E4F5' }}
									>
										<FileText
											className="w-5 h-5"
											style={{ color: '#0F4C8A' }}
										/>
									</div>
									<div>
										<p
											style={{
												fontSize: 15,
												fontWeight: 600,
												color: '#191C1E',
											}}
										>
											{rfq.product}
										</p>
										<p
											style={{
												fontSize: 12,
												color: 'rgba(25,28,30,0.5)',
												marginTop: 2,
											}}
										>
											Buyer: {rfq.buyer} · {rfq.qty} {rfq.unit}
										</p>
									</div>
								</div>
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
									{rfq.status.replace('_', ' ').toUpperCase()}
								</span>
							</div>
							<div
								className="flex items-center gap-4 mt-2"
								style={{ fontSize: 12, color: 'rgba(25,28,30,0.55)' }}
							>
								<span>Received: {rfq.receivedAt}</span>
								<span>·</span>
								<span>Delivery: {rfq.deliveryDate}</span>
								{rfq.quotation && (
									<>
										<span>·</span>
										<span>
											{rfq.quotation.price.toLocaleString('vi-VN')} quoted
										</span>
									</>
								)}
							</div>
						</button>
					);
				})}
			</div>
		</div>
	);
}
