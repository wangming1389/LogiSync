'use client';

import {
	ArrowRight,
	CheckCircle,
	FileText,
	Plus,
	Search,
	Send,
	ShoppingCart,
	SortAsc,
	Star,
	X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { buyerProducts } from '@/app/data/mockData';
import { api } from '@/lib/api';
import { getStoredAccessToken, parseJwtClaims } from '@/lib/auth';
import { upsertRecentPurchaseOrder } from '@/lib/order-store';
import {
	BuyerRfqItem,
	getWorkflowClone,
	makeWorkflowId,
	updateWorkflowState,
} from '@/lib/workflow-store';
import { isDemoWorkspaceSession } from '@/lib/workspace-mode';

type SortBy = 'score' | 'price';
type Tab = 'search' | 'rfq' | 'compare';

type BuyerProduct = (typeof buyerProducts)[number] & {
	workspaceId?: string;
	uomId?: string | null;
	sku?: string | null;
};

type BuyerSearchProduct = {
	id: string;
	sku?: string | null;
	name: string;
	workspaceId?: string;
	uomId?: string | null;
	supplierWorkspaceName?: string | null;
	supplierWorkspaceSlug?: string | null;
	unitPrice: number;
	minOrderQty?: number | null;
	uomCode?: string | null;
	uomName?: string | null;
	catalogCategoryName?: string | null;
	reputationScore?: number | null;
};

type UomOption = {
	id: string;
	name: string;
	code: string;
	isActive?: boolean;
};

type BackendRfqSummary = {
	id: string;
	parentRfqId?: string | null;
	supplierWorkspaceId?: string | null;
	buyerWorkspaceId?: string;
	status?: string;
	note?: string | null;
	submittedAt?: string | null;
	createdAt?: string | null;
	updatedAt?: string | null;
	items?: {
		id?: string;
		productId?: string;
		quantity?: number;
		qty?: number;
		unit?: string;
		deliveryDate?: string | null;
		notes?: string | null;
	}[];
};

type BackendQuotation = {
	id: string;
	rfqId: string;
	supplierWorkspaceId?: string | null;
	status?: string;
	totalPrice?: number | null;
	unitPrice?: number | null;
	estimatedDeliveryDate?: number | null;
	deliveryTerms?: string | null;
	note?: string | null;
	submittedAt?: string | null;
	createdAt?: string | null;
	items?: { quantity?: number | null; unitPrice?: number | null }[];
};

type ComparisonQuotation = {
	id: string;
	rfqId: string;
	supplier: string;
	supplierWorkspaceId?: string | null;
	score: number;
	unitPrice: number;
	total: number;
	deliveryDays: number | null;
	terms: string;
	validity: string;
	notes: string;
	status: string;
};

type AwaitingSupplier = {
	rfqId: string;
	supplierWorkspaceId?: string | null;
	status?: string;
	label: string;
	score: number;
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

function formatCurrency(value: number) {
	return `₫${value.toLocaleString('vi-VN')}`;
}

function inferCategory(product: BuyerSearchProduct) {
	if (product.catalogCategoryName) return product.catalogCategoryName;

	const text =
		`${product.name} ${product.supplierWorkspaceName ?? ''}`.toLowerCase();
	if (text.includes('rice')) return 'Rice';
	if (
		text.includes('wheat') ||
		text.includes('corn') ||
		text.includes('grain')
	) {
		return 'Grain';
	}
	if (text.includes('soy') || text.includes('bean')) return 'Legume';
	if (text.includes('nut') || text.includes('cashew')) return 'Nut';
	return 'Other';
}

function formatUomLabel(uom?: UomOption | null) {
	if (!uom) return undefined;
	return uom.code ? uom.code.toUpperCase() : uom.name;
}

function toBuyerProduct(
	product: BuyerSearchProduct,
	uomMap: Map<string, UomOption> = new Map(),
): BuyerProduct {
	const uom = product.uomId ? uomMap.get(product.uomId) : undefined;
	return {
		id: product.id,
		name: product.name,
		supplier:
			product.supplierWorkspaceName ??
			product.supplierWorkspaceSlug ??
			'Unknown Supplier',
		supplierScore: product.reputationScore ?? 0,
		category: inferCategory(product),
		basePrice: product.unitPrice,
		unit: product.uomCode ?? formatUomLabel(uom) ?? product.uomName ?? 'unit',
		minQty: product.minOrderQty ?? 1,
		workspaceId: product.workspaceId,
		uomId: product.uomId ?? undefined,
		sku: product.sku ?? undefined,
	};
}

function logRfqDebug(label: string, data: unknown) {
	console.log(`[RFQ_DEBUG][Buyer] ${label}`, data);
}

function getAuthDebugClaims() {
	const token = getStoredAccessToken();
	const claims = token ? parseJwtClaims(token) : null;
	return {
		role: claims?.role ?? claims?.userRole,
		workspaceId: claims?.workspaceId,
		workspaceType: claims?.workspaceType ?? claims?.workspace_type,
	};
}

function formatSupplierLabel(workspaceId?: string | null) {
	if (!workspaceId) return 'Unknown Supplier';
	return `Supplier ${workspaceId.slice(0, 8)}`;
}

function productDisplayName(product?: { name?: string; sku?: string | null }) {
	if (!product) return undefined;
	return product.sku ? `${product.name} (${product.sku})` : product.name;
}

function mapBackendStatus(status?: string): 'draft' | 'submitted' {
	if (status === 'draft') return 'draft';
	if (['pending_response', 'responded', 'closed'].includes(status ?? '')) {
		return 'submitted';
	}
	return 'submitted';
}

function formatDate(value?: string | null) {
	if (!value) return '';
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return value.slice(0, 10);
	return parsed.toISOString().slice(0, 10);
}

function calculateQuotationTotal(quotation: BackendQuotation) {
	const quantity = Array.isArray(quotation.items)
		? quotation.items.reduce((total, item) => total + (item.quantity ?? 0), 0)
		: 0;
	const unitPrice = quotation.unitPrice ?? quotation.items?.[0]?.unitPrice ?? 0;
	if (quantity > 0 && unitPrice > 0) return quantity * unitPrice;
	return quotation.totalPrice ?? 0;
}

export default function SourcingDashboardClient() {
	const [demoEnabled, setDemoEnabled] = useState(false);
	const [tab, setTab] = useState<Tab>('search');
	const [search, setSearch] = useState('');
	const [filterCat, setFilterCat] = useState('All');
	const [sortBy, setSortBy] = useState<SortBy>('score');
	const [workflow, setWorkflow] = useState(() => getWorkflowClone());
	const [products, setProducts] = useState<BuyerProduct[]>([]);
	const [loadingProducts, setLoadingProducts] = useState(false);
	const [productsError, setProductsError] = useState<string | null>(null);
	const [submittingRfq, setSubmittingRfq] = useState(false);
	const [loadingQuotations, setLoadingQuotations] = useState(false);
	const [quotationsError, setQuotationsError] = useState<string | null>(null);
	const [comparisonQuotations, setComparisonQuotations] = useState<
		ComparisonQuotation[]
	>([]);
	const [awaitingSuppliers, setAwaitingSuppliers] = useState<
		AwaitingSupplier[]
	>([]);
	const [selectionMessage, setSelectionMessage] = useState('');
	const [selectionPreview, setSelectionPreview] =
		useState<ComparisonQuotation | null>(null);
	const [cart, setCart] = useState<string[]>([]);
	const [rfqQuantities, setRfqQuantities] = useState<Record<string, number>>(
		{},
	);
	const [deliveryDate, setDeliveryDate] = useState('2026-05-01');
	const [notes, setNotes] = useState('');
	const [submittedMessage, setSubmittedMessage] = useState('');
	const [selectedQuotation, setSelectedQuotation] = useState<string | null>(
		null,
	);
	const [selectedRfqId, setSelectedRfqId] = useState<string | null>(null);

	useEffect(() => {
		if (isDemoWorkspaceSession()) setDemoEnabled(true);
	}, []);

	const categories = ['All', 'Rice', 'Grain', 'Legume', 'Nut'];
	useEffect(() => {
		const currentDraft = workflow.buyerRfqs.find(
			(rfq) => rfq.status === 'draft',
		);
		if (currentDraft?.items?.length) {
			const draftProductIds = currentDraft.items.map((item): string =>
				'productId' in item && item.productId
					? String(item.productId)
					: String(item.product),
			);
			setCart(draftProductIds);
			setRfqQuantities((current) => {
				const next = { ...current };
				currentDraft.items?.forEach((item, index) => {
					const productId = draftProductIds[index];
					if (productId) next[productId] = item.qty ?? 1;
				});
				return next;
			});
			setNotes(currentDraft.note ?? '');
			setDeliveryDate(currentDraft.deliveryDate ?? '2026-05-01');
			setSelectedRfqId(currentDraft.id);
		}
	}, [workflow.buyerRfqs]);

	const filteredProducts = useMemo(
		() =>
			products
				.filter(
					(product) =>
						(filterCat === 'All' || product.category === filterCat) &&
						(product.name.toLowerCase().includes(search.toLowerCase()) ||
							product.supplier.toLowerCase().includes(search.toLowerCase())),
				)
				.sort((a, b) =>
					sortBy === 'score'
						? b.supplierScore - a.supplierScore
						: a.basePrice - b.basePrice,
				),
		[search, filterCat, sortBy, products],
	);

	useEffect(() => {
		// For demo workspaces, show local mock products. For real (non-demo) workspaces,
		// load DB-backed products from the API.
		if (demoEnabled) {
			setProducts(buyerProducts as BuyerProduct[]);
			return;
		}

		let mounted = true;
		setLoadingProducts(true);
		setProductsError(null);
		Promise.all([api.get('/products/search?limit=25'), api.get('/uom')])
			.then(([res, uomRes]) => {
				console.log('products/search raw:', JSON.stringify(res));
				const uomMap = new Map(
					unwrapList<UomOption>(uomRes).map((uom) => [uom.id, uom]),
				);
				const payload: any = res as any;
				const inner = payload?.data?.data ?? payload?.data ?? payload;
				const items = Array.isArray(inner) ? inner : (inner?.items ?? []);
				(async () => {
					const list = Array.isArray(items) ? items : [];
					// Find workspaceIds missing a supplier name and fetch names
					const missingIds = Array.from(
						new Set(
							list
								.map((it: any) => it.workspaceId)
								.filter(
									(id: string | undefined) =>
										!!id &&
										!list.find(
											(x: any) =>
												x.workspaceId === id && x.supplierWorkspaceName,
										),
								),
						),
					);
					let nameMap: Record<string, string> = {};
					if (missingIds.length > 0) {
						try {
							const namesRes: any = await api.get(
								`/workspaces/public?ids=${missingIds.join(',')}`,
							);
							const rows: any[] = namesRes?.data ?? namesRes ?? [];
							for (const r of rows) {
								if (r?.id && r?.name) nameMap[r.id] = r.name;
							}
						} catch (err) {
							// Name lookup failed; proceed without workspace names
						}
					}
					if (mounted) {
						setProducts(
							list.map((item: any) => {
								const p = item as BuyerSearchProduct;
								const supplierName =
									p.supplierWorkspaceName ??
									(p.workspaceId ? nameMap[p.workspaceId] : undefined) ??
									p.supplierWorkspaceSlug;
								return toBuyerProduct(
									{
										...p,
										supplierWorkspaceName: supplierName,
									} as BuyerSearchProduct,
									uomMap,
								);
							}),
						);
					}
				})();
			})
			.catch((err: any) => {
				try {
					console.error(
						'BuyerSourcing: products load error',
						JSON.stringify(err),
					);
				} catch {
					console.error('BuyerSourcing: products load error', err);
				}
				if (mounted) setProductsError(err?.message ?? String(err));
			})
			.finally(() => {
				if (mounted) setLoadingProducts(false);
			});

		return () => {
			mounted = false;
		};
	}, [demoEnabled]);

	useEffect(() => {
		if (demoEnabled) return;

		let mounted = true;
		(async () => {
			try {
				const response: any = await api.get('/rfqs?limit=50');
				const rfqs = unwrapList<BackendRfqSummary>(response);
				const parents = rfqs.filter((rfq) => !rfq.parentRfqId);
				const childrenByParent = new Map<string, BackendRfqSummary[]>();
				for (const child of rfqs.filter((rfq) => rfq.parentRfqId)) {
					const siblings =
						childrenByParent.get(child.parentRfqId as string) ?? [];
					siblings.push(child);
					childrenByParent.set(child.parentRfqId as string, siblings);
				}

				const details = await Promise.all(
					parents.map(async (rfq) => {
						try {
							const detailResponse: any = await api.get(`/rfqs/${rfq.id}`);
							return unwrapApiResponse<BackendRfqSummary>(detailResponse);
						} catch {
							return rfq;
						}
					}),
				);

				const mapped = details.map((rfq) => {
					const childRfqs = childrenByParent.get(rfq.id) ?? [];
					const items = Array.isArray(rfq.items) ? rfq.items : [];
					const firstProductId = items[0]?.productId;
					const firstProduct = firstProductId
						? products.find((product) => product.id === firstProductId)
						: undefined;
					const firstProductName = firstProductId
						? (productDisplayName(firstProduct) ??
							`Product ${firstProductId.slice(0, 8)}`)
						: undefined;
					const summary =
						items.length > 1
							? `RFQ ${rfq.id.slice(0, 8)} · ${items.length} items`
							: firstProductId
								? `Product ${firstProductId.slice(0, 8)}`
								: (rfq.note ?? `RFQ ${rfq.id.slice(0, 8)}`);
					const displaySummary =
						items.length > 1
							? `${firstProductName ?? 'Mixed products'} · ${items.length} items`
							: (firstProductName ?? summary);
					const deliveryDate =
						formatDate(items[0]?.deliveryDate) ??
						formatDate(rfq.submittedAt ?? rfq.createdAt) ??
						'';

					return {
						id: rfq.id,
						buyer: 'Current Workspace',
						product: displaySummary,
						qty: items.reduce(
							(total, item) => total + (item.quantity ?? item.qty ?? 0),
							0,
						),
						unit: firstProduct?.unit ?? items[0]?.unit ?? 'unit',
						deliveryDate,
						status: mapBackendStatus(rfq.status),
						receivedAt: formatDate(rfq.submittedAt ?? rfq.createdAt),
						createdAt: rfq.createdAt ?? rfq.submittedAt ?? '',
						deadline: deliveryDate,
						suppliers: childRfqs.map((child) =>
							child.supplierWorkspaceId
								? (products.find(
										(product) =>
											product.workspaceId === child.supplierWorkspaceId,
									)?.supplier ?? formatSupplierLabel(child.supplierWorkspaceId))
								: 'Unknown Supplier',
						),
						childRfqs: childRfqs.map((child) => ({
							id: child.id,
							supplierWorkspaceId: child.supplierWorkspaceId ?? undefined,
							status: child.status,
						})),
						notes: rfq.note ?? '',
						note: rfq.note ?? '',
						items: items.map((item) => ({
							product: item.productId
								? (productDisplayName(
										products.find((product) => product.id === item.productId),
									) ?? `Product ${item.productId.slice(0, 8)}`)
								: 'Product',
							qty: item.quantity ?? item.qty ?? 0,
							unit:
								(item.productId
									? products.find((product) => product.id === item.productId)
											?.unit
									: undefined) ??
								item.unit ??
								'unit',
							productId: item.productId,
						})),
					};
				});

				logRfqDebug('buyer-rfqs:loaded', {
					count: mapped.length,
					items: mapped.map((rfq) => ({
						id: rfq.id,
						status: rfq.status,
						childCount: rfq.childRfqs.length,
					})),
				});

				if (mounted) {
					setWorkflow((currentState) => ({
						...currentState,
						buyerRfqs: mapped,
					}));
					if (!selectedRfqId && mapped.length > 0) {
						setSelectedRfqId(mapped[0].id);
					}
				}
			} catch (error) {
				console.error('BuyerSourcing: failed to load RFQs', error);
			}
		})();

		return () => {
			mounted = false;
		};
	}, [demoEnabled, selectedRfqId, products]);

	const activeDraft =
		workflow.buyerRfqs.find((rfq) => rfq.id === selectedRfqId) ??
		workflow.buyerRfqs.find((rfq) => rfq.status === 'draft') ??
		workflow.buyerRfqs.find((rfq) => rfq.status === 'submitted') ??
		null;

	const supplierScoreByWorkspaceId = useMemo(() => {
		const scores = new Map<string, number>();
		for (const product of products) {
			if (!product.workspaceId) continue;
			scores.set(
				product.workspaceId,
				Math.max(scores.get(product.workspaceId) ?? 0, product.supplierScore),
			);
		}
		return scores;
	}, [products]);

	const supplierNameByWorkspaceId = useMemo(() => {
		const names = new Map<string, string>();
		for (const product of products) {
			if (product.workspaceId && product.supplier) {
				names.set(product.workspaceId, product.supplier);
			}
		}
		return names;
	}, [products]);

	const productNameById = useMemo(() => {
		const names = new Map<string, string>();
		for (const product of products) {
			names.set(product.id, productDisplayName(product) ?? product.name);
		}
		return names;
	}, [products]);

	useEffect(() => {
		if (tab !== 'compare') return;
		if (!selectedRfqId && !activeDraft?.id) return;

		let mounted = true;
		const parentId = selectedRfqId ?? activeDraft?.id;
		if (!parentId) return;

		(async () => {
			setLoadingQuotations(true);
			setQuotationsError(null);
			setSelectionMessage('');
			try {
				const rfqResponse: any = await api.get('/rfqs?limit=50');
				const rfqs = unwrapList<BackendRfqSummary>(rfqResponse);
				const selected = rfqs.find((rfq) => rfq.id === parentId);
				const rootRfqId = selected?.parentRfqId ?? parentId;
				const childRfqs = rfqs.filter((rfq) => rfq.parentRfqId === rootRfqId);
				const targets =
					childRfqs.length > 0 ? childRfqs : selected ? [selected] : [];

				logRfqDebug('compare:rfqs', {
					parentId,
					rootRfqId,
					targets: targets.map((rfq) => ({
						id: rfq.id,
						status: rfq.status,
						parentRfqId: rfq.parentRfqId,
						supplierWorkspaceId: rfq.supplierWorkspaceId,
					})),
				});

				const quoteGroups = await Promise.all(
					targets.map(async (rfq) => {
						const quoteResponse: any = await api.get(
							`/rfqs/${rfq.id}/quotations`,
						);
						const quotations = unwrapList<BackendQuotation>(quoteResponse);
						const enrichedQuotations = await Promise.all(
							quotations.map(async (quotation) => {
								try {
									const detailResponse: any = await api.get(
										`/quotations/${quotation.id}`,
									);
									return {
										...quotation,
										...unwrapApiResponse<BackendQuotation>(detailResponse),
									};
								} catch {
									return quotation;
								}
							}),
						);
						return {
							rfq,
							quotations: enrichedQuotations,
						};
					}),
				);

				const nextQuotations = quoteGroups
					.flatMap(({ rfq, quotations }) =>
						quotations
							.filter((quotation) => quotation.status !== 'draft')
							.map((quotation) => {
								const supplierWorkspaceId =
									quotation.supplierWorkspaceId ?? rfq.supplierWorkspaceId;
								return {
									id: quotation.id,
									rfqId: quotation.rfqId,
									supplierWorkspaceId,
									supplier: supplierWorkspaceId
										? (supplierNameByWorkspaceId.get(supplierWorkspaceId) ??
											formatSupplierLabel(supplierWorkspaceId))
										: 'Unknown Supplier',
									score: supplierWorkspaceId
										? (supplierScoreByWorkspaceId.get(supplierWorkspaceId) ?? 0)
										: 0,
									unitPrice: quotation.unitPrice ?? 0,
									total: calculateQuotationTotal(quotation),
									deliveryDays: quotation.estimatedDeliveryDate ?? null,
									terms: quotation.deliveryTerms ?? 'To be negotiated',
									validity: quotation.submittedAt
										? quotation.submittedAt.slice(0, 10)
										: 'Submitted',
									notes: quotation.note ?? '',
									status: quotation.status ?? 'submitted',
								};
							}),
					)
					.sort((a, b) => b.score - a.score || a.unitPrice - b.unitPrice);

				const quotedRfqIds = new Set(
					nextQuotations.map((quote) => quote.rfqId),
				);
				const nextAwaiting = targets
					.filter((rfq) => !quotedRfqIds.has(rfq.id))
					.map((rfq) => ({
						rfqId: rfq.id,
						supplierWorkspaceId: rfq.supplierWorkspaceId,
						status: rfq.status,
						label: rfq.supplierWorkspaceId
							? (supplierNameByWorkspaceId.get(rfq.supplierWorkspaceId) ??
								formatSupplierLabel(rfq.supplierWorkspaceId))
							: 'Unknown Supplier',
						score: rfq.supplierWorkspaceId
							? (supplierScoreByWorkspaceId.get(rfq.supplierWorkspaceId) ?? 0)
							: 0,
					}));

				logRfqDebug('compare:quotations', {
					count: nextQuotations.length,
					quotations: nextQuotations,
					awaiting: nextAwaiting,
				});

				if (mounted) {
					setComparisonQuotations(nextQuotations);
					setAwaitingSuppliers(nextAwaiting);
					const selectedQuote = nextQuotations.find(
						(quotation) => quotation.status === 'selected',
					);
					if (selectedQuote) setSelectedQuotation(selectedQuote.id);
				}
			} catch (error) {
				console.error('BuyerSourcing: failed to load quotations', error);
				if (mounted) {
					const message =
						error && typeof error === 'object'
							? ((error as any).message ?? JSON.stringify(error))
							: String(error);
					setQuotationsError(message || 'Failed to load quotations.');
					setComparisonQuotations([]);
					setAwaitingSuppliers([]);
				}
			} finally {
				if (mounted) setLoadingQuotations(false);
			}
		})();

		return () => {
			mounted = false;
		};
	}, [
		tab,
		selectedRfqId,
		activeDraft?.id,
		supplierScoreByWorkspaceId,
		supplierNameByWorkspaceId,
	]);

	function addToCart(productId: string) {
		setCart((current) => {
			if (current.includes(productId)) return current;
			const product = products.find((entry) => entry.id === productId);
			setRfqQuantities((quantities) => ({
				...quantities,
				[productId]: quantities[productId] ?? product?.minQty ?? 1,
			}));
			return [...current, productId];
		});
	}

	function removeFromCart(productId: string) {
		setCart((current) => current.filter((item) => item !== productId));
		setRfqQuantities((current) => {
			const next = { ...current };
			delete next[productId];
			return next;
		});
	}

	function setRfqQuantity(productId: string, value: number) {
		const product = products.find((entry) => entry.id === productId);
		const minQty = product?.minQty ?? 1;
		const quantity = Math.max(minQty, Math.trunc(value || minQty));
		setRfqQuantities((current) => ({ ...current, [productId]: quantity }));
	}

	async function selectWinningQuotation(quotationId: string) {
		setSelectedQuotation(quotationId);
		setSelectionMessage('');
		try {
			const response: any = await api.post(
				`/quotations/${quotationId}/select`,
				{},
			);
			logRfqDebug('quotation:select:response', response);
			const purchaseOrder =
				response?.data?.data?.purchaseOrder ??
				response?.data?.purchaseOrder ??
				response?.purchaseOrder;
			if (purchaseOrder?.id) {
				const selectedQuote =
					selectionPreview ??
					comparisonQuotations.find((quote) => quote.id === quotationId);
				upsertRecentPurchaseOrder({
					...purchaseOrder,
					supplierName: selectedQuote?.supplier,
					productName: activeDraft?.product,
				});
			}
			setComparisonQuotations((current) =>
				current.map((quotation) =>
					quotation.id === quotationId
						? { ...quotation, status: 'selected' }
						: quotation,
				),
			);
			setSelectionMessage('Supplier selected and purchase order created.');
			setSelectionPreview(null);
		} catch (error) {
			console.error('BuyerSourcing: quotation select failed', error);
			const message =
				error && typeof error === 'object'
					? ((error as any).message ?? JSON.stringify(error))
					: String(error);
			setSelectionMessage(message || 'Failed to select supplier.');
		}
	}

	async function persistDraft(status: 'draft' | 'submitted') {
		const items: BuyerRfqItem[] = cart.map((productId) => {
			const product = products.find((entry) => entry.id === productId);
			return {
				product: product?.name ?? productId,
				qty: rfqQuantities[productId] ?? product?.minQty ?? 1,
				unit: product?.unit ?? 'MT',
				productId,
			};
		});

		const nextRfqId =
			selectedRfqId ??
			makeWorkflowId(
				'BRFQ',
				workflow.buyerRfqs.map((rfq) => rfq.id),
			);
		const primaryProduct = items[0]?.product ?? 'Mixed Basket';
		const summary =
			items.length > 1
				? `${primaryProduct} + ${items.length - 1} more`
				: primaryProduct;
		const suppliers = Array.from(
			new Set(
				items
					.map(
						(item) =>
							products.find((entry) => entry.id === item.productId)?.supplier,
					)
					.filter((supplier): supplier is string => Boolean(supplier)),
			),
		);

		if (status === 'submitted') {
			if (items.length === 0) {
				setSubmittedMessage('Add at least one product before submitting.');
				return;
			}

			setSubmittingRfq(true);
			try {
				const supplierWorkspaceId = products.find((p) =>
					cart.includes(p.id),
				)?.workspaceId;
				logRfqDebug('submit:start', {
					auth: getAuthDebugClaims(),
					cart,
					items,
					selectedProducts: products
						.filter((product) => cart.includes(product.id))
						.map((product) => ({
							id: product.id,
							name: product.name,
							supplier: product.supplier,
							workspaceId: product.workspaceId,
						})),
					note: notes,
					deliveryDate,
					firstSupplierWorkspaceId: supplierWorkspaceId,
				});
				const created: any = await api.post('/rfqs', {
					note: notes,
					supplierWorkspaceId,
				});
				logRfqDebug('create:response', created);
				const rfqId =
					created?.data?.data?.id ?? created?.data?.id ?? created?.id;
				if (!rfqId) {
					throw new Error('RFQ creation did not return an id');
				}

				for (const item of items) {
					const itemResponse = await api.post(`/rfqs/${rfqId}/items`, {
						productId: item.productId,
						quantity: item.qty,
						deliveryDate,
						notes,
					});
					logRfqDebug('item:add:response', {
						rfqId,
						productId: item.productId,
						response: itemResponse,
					});
				}

				const submitResponse: any = await api.post(`/rfqs/${rfqId}/submit`, {});
				logRfqDebug('submit:response', {
					rfqId,
					response: submitResponse,
					parentId:
						submitResponse?.data?.data?.parent?.id ??
						submitResponse?.data?.parent?.id,
					childRfqs:
						submitResponse?.data?.data?.childRfqs ??
						submitResponse?.data?.childRfqs,
				});
				const childRfqs =
					submitResponse?.data?.data?.childRfqs ??
					submitResponse?.data?.childRfqs ??
					[];

				updateWorkflowState((currentState) => {
					const existingIndex = currentState.buyerRfqs.findIndex(
						(rfq) => rfq.id === rfqId,
					);
					const nextRfq = {
						id: rfqId,
						buyer: 'Current Workspace',
						product: summary,
						qty: items.reduce((total, item) => total + item.qty, 0),
						unit: items[0]?.unit ?? 'unit',
						deliveryDate,
						status: 'submitted' as const,
						receivedAt: new Date().toISOString().slice(0, 10),
						createdAt: new Date().toISOString(),
						deadline: deliveryDate,
						suppliers,
						childRfqs,
						notes,
						items,
						note: notes,
					};

					const buyerRfqs = [...currentState.buyerRfqs];
					if (existingIndex >= 0) {
						buyerRfqs[existingIndex] = nextRfq;
					} else {
						buyerRfqs.unshift(nextRfq);
					}

					const nextState = {
						...currentState,
						buyerRfqs,
					};

					setWorkflow(nextState);
					return nextState;
				});

				setSelectedRfqId(rfqId);
				setSubmittedMessage('RFQ submitted to suppliers.');
				setTab('compare');
			} catch (error) {
				console.error('BuyerSourcing: RFQ submit failed', error);
				setSubmittedMessage(
					error instanceof Error ? error.message : 'Failed to submit RFQ.',
				);
			} finally {
				setSubmittingRfq(false);
			}

			return;
		}

		updateWorkflowState((currentState) => {
			const existingIndex = currentState.buyerRfqs.findIndex(
				(rfq) => rfq.id === nextRfqId,
			);
			const nextRfq = {
				id: nextRfqId,
				buyer: 'Current Workspace',
				product: summary,
				qty: items.reduce((total, item) => total + item.qty, 0),
				unit: items[0]?.unit ?? 'unit',
				deliveryDate,
				status,
				receivedAt: new Date().toISOString().slice(0, 10),
				createdAt: new Date().toISOString(),
				deadline: deliveryDate,
				suppliers,
				notes,
				items,
				note: notes,
			};

			const buyerRfqs = [...currentState.buyerRfqs];
			if (existingIndex >= 0) {
				buyerRfqs[existingIndex] = nextRfq;
			} else {
				buyerRfqs.unshift(nextRfq);
			}

			const nextState = {
				...currentState,
				buyerRfqs,
			};

			setWorkflow(nextState);
			return nextState;
		});

		setSelectedRfqId(nextRfqId);
		setSubmittedMessage('Draft saved locally.');
	}

	const cartItems = cart
		.map((productId) => products.find((product) => product.id === productId))
		.filter((item): item is (typeof buyerProducts)[number] => Boolean(item));
	const selectedSupplierQuotation =
		comparisonQuotations.find(
			(quotation) =>
				quotation.id === selectedQuotation || quotation.status === 'selected',
		) ?? null;
	const openQuotations = comparisonQuotations.filter(
		(quotation) =>
			quotation.id !== selectedSupplierQuotation?.id &&
			quotation.status !== 'selected',
	);

	return (
		<div className="p-6">
			<div className="mb-6">
				<h1 style={{ color: '#191C1E' }}>Sourcing</h1>
				<p className="mt-1 text-sm text-slate-500">
					Draft RFQs, compare quotations, and move selected items into workflow.
				</p>
				{loadingProducts && (
					<p className="mt-2 text-xs text-slate-400">Loading products...</p>
				)}
				{productsError && (
					<p className="mt-2 text-xs text-red-600">{productsError}</p>
				)}
			</div>

			<div
				className="flex gap-1 p-1 rounded-lg mb-6 flex-wrap"
				style={{ background: '#E0E4EB' }}
			>
				{[
					{ key: 'search', label: `Product Search (${cart.length} in RFQ)` },
					{ key: 'rfq', label: 'Draft RFQ' },
					{ key: 'compare', label: 'Compare Quotations' },
				].map((item) => (
					<button
						key={item.key}
						onClick={() => setTab(item.key as Tab)}
						className="px-4 py-2 rounded-md transition-all"
						style={{
							background: tab === item.key ? '#0F4C8A' : 'transparent',
							color: tab === item.key ? '#FFFFFF' : 'rgba(25,28,30,0.6)',
							fontWeight: tab === item.key ? 600 : 400,
							fontSize: 13,
						}}
					>
						{item.label}
					</button>
				))}
			</div>

			{tab === 'search' && (
				<>
					<div className="flex gap-3 mb-5 flex-wrap">
						<div className="relative flex-1 min-w-48">
							<Search
								className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
								style={{ color: 'rgba(25,28,30,0.4)' }}
							/>
							<input
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								placeholder="Search product or supplier..."
								className="w-full pl-9 pr-4 h-10 rounded-t-[6px] focus:outline-none"
								style={{
									background: '#D5DAE3',
									borderBottom: '2px solid #00559F',
									color: '#191C1E',
									fontSize: 14,
								}}
							/>
						</div>
						{categories.map((category) => (
							<button
								key={category}
								onClick={() => setFilterCat(category)}
								className="px-3 py-2 rounded-[6px] transition-all"
								style={{
									background: filterCat === category ? '#0F4C8A' : '#E0E4EB',
									color:
										filterCat === category ? '#FFFFFF' : 'rgba(25,28,30,0.65)',
									fontSize: 13,
									fontWeight: filterCat === category ? 600 : 400,
								}}
							>
								{category}
							</button>
						))}
						<select
							value={sortBy}
							onChange={(e) => setSortBy(e.target.value as SortBy)}
							className="px-3 h-10 rounded-t-[6px] focus:outline-none"
							style={{
								background: '#D5DAE3',
								borderBottom: '2px solid transparent',
								color: '#191C1E',
								fontSize: 13,
							}}
						>
							<option value="score">Sort: Reputation ↓</option>
							<option value="price">Sort: Price ↑</option>
						</select>
					</div>
					<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
						{filteredProducts.map((product) => (
							<div
								key={product.id}
								className="rounded-xl p-5 transition-all"
								style={{
									background: '#FFFFFF',
									boxShadow: '0px 8px 24px rgba(15,76,138,0.08)',
								}}
							>
								<div className="flex items-start justify-between mb-3">
									<div>
										<p
											className="text-[15px] font-semibold"
											style={{ color: '#191C1E' }}
										>
											{product.name}
										</p>
										<p className="text-xs mt-0.5 text-slate-500">
											{product.supplier}
										</p>
									</div>
									<div
										className="flex items-center gap-1 px-2 py-0.5 rounded-full"
										style={{ background: '#FFEFC6' }}
									>
										<Star className="w-3 h-3" style={{ color: '#7A4F00' }} />
										<span
											className="text-xs font-medium"
											style={{ color: '#7A4F00' }}
										>
											{product.supplierScore}
										</span>
									</div>
								</div>
								<span
									className="px-3 py-1 rounded-full"
									style={{
										background: '#D3E4F5',
										color: '#0F4C8A',
										fontSize: 11,
										fontWeight: 500,
										letterSpacing: '0.05em',
									}}
								>
									{product.category.toUpperCase()}
								</span>
								<div className="mt-3 flex items-center justify-between gap-3">
									<div>
										<p
											className="text-[15px] font-semibold"
											style={{ color: '#0F4C8A' }}
										>
											{formatCurrency(product.basePrice)}
										</p>
										<p className="text-xs text-slate-500">
											/{product.unit} · Min {product.minQty} {product.unit}
										</p>
									</div>
									<button
										onClick={() => addToCart(product.id)}
										className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-white transition-all"
										style={{
											background: cart.includes(product.id)
												? '#C8F0D8'
												: 'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)',
											color: cart.includes(product.id) ? '#1B6B3A' : '#FFFFFF',
											fontSize: 12,
											fontWeight: 500,
										}}
									>
										{cart.includes(product.id) ? (
											<>
												<CheckCircle className="w-3.5 h-3.5" /> Added
											</>
										) : (
											<>
												<Plus className="w-3.5 h-3.5" /> ADD TO RFQ
											</>
										)}
									</button>
								</div>
							</div>
						))}
					</div>
					{cart.length > 0 && (
						<button
							onClick={() => setTab('rfq')}
							className="fixed bottom-6 right-6 px-5 py-3 rounded-xl text-white flex items-center gap-2 cursor-pointer transition-all hover:brightness-105"
							style={{
								background: 'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)',
								boxShadow: '0px 8px 24px rgba(15,76,138,0.25)',
							}}
						>
							<ShoppingCart className="w-5 h-5" />
							{cart.length} item(s) in RFQ draft
							<ArrowRight className="w-4 h-4" />
						</button>
					)}
				</>
			)}

			{tab === 'rfq' && (
				<div
					className="max-w-3xl mx-auto rounded-xl p-6"
					style={{
						background: '#FFFFFF',
						boxShadow: '0px 8px 24px rgba(15,76,138,0.08)',
					}}
				>
					<div className="flex items-center justify-between mb-5">
						<div>
							<h4 style={{ color: '#191C1E' }}>Draft RFQ</h4>
							<p className="text-sm text-slate-500 mt-1">
								{
									workflow.buyerRfqs.filter((rfq) => rfq.status === 'submitted')
										.length
								}{' '}
								RFQ(s) submitted
							</p>
						</div>
						{submittedMessage && (
							<div
								className="rounded-full px-3 py-1 text-sm"
								style={{ background: '#C8F0D8', color: '#1B6B3A' }}
							>
								{submittedMessage}
							</div>
						)}
					</div>
					<div className="space-y-3 mb-5">
						{cartItems.map((product) => (
							<div
								key={product.id}
								className="flex items-center gap-3 p-3 rounded-lg"
								style={{ background: '#F2F4F7' }}
							>
								<div className="flex-1 min-w-0">
									<p
										className="text-sm font-medium"
										style={{ color: '#191C1E' }}
									>
										{product.name}
									</p>
									<p className="text-xs text-slate-500">{product.supplier}</p>
								</div>
								<div className="text-xs text-slate-500 whitespace-nowrap">
									Min {product.minQty} {product.unit}
								</div>
								<label className="flex items-center gap-2 text-xs text-slate-500 whitespace-nowrap">
									Qty
									<input
										type="number"
										min={product.minQty}
										value={rfqQuantities[product.id] ?? product.minQty}
										onChange={(event) =>
											setRfqQuantity(product.id, Number(event.target.value))
										}
										className="h-9 w-24 rounded-t-[6px] px-2 text-sm text-slate-900 focus:outline-none"
										style={{
											background: '#D5DAE3',
											borderBottom: '2px solid #00559F',
										}}
									/>
									{product.unit}
								</label>
								<button
									onClick={() => removeFromCart(product.id)}
									className="text-slate-500"
								>
									<X className="w-4 h-4" />
								</button>
							</div>
						))}
						{cartItems.length === 0 && (
							<p className="py-8 text-center text-sm text-slate-400">
								No items added. Go to Product Search.
							</p>
						)}
					</div>
					{cartItems.length > 0 && (
						<>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
								<div>
									<label className="block mb-1 text-[11px] font-medium uppercase tracking-[0.05em] text-slate-500">
										Required Delivery Date
									</label>
									<input
										type="date"
										value={deliveryDate}
										onChange={(e) => setDeliveryDate(e.target.value)}
										className="w-full px-3 h-10 rounded-t-[6px] focus:outline-none"
										style={{
											background: '#D5DAE3',
											borderBottom: '2px solid #00559F',
											color: '#191C1E',
											fontSize: 13,
										}}
									/>
								</div>
								<div>
									<label className="block mb-1 text-[11px] font-medium uppercase tracking-[0.05em] text-slate-500">
										RFQ Note
									</label>
									<input
										value={notes}
										onChange={(e) => setNotes(e.target.value)}
										placeholder="Spec, packaging, incoterms..."
										className="w-full px-3 h-10 rounded-t-[6px] focus:outline-none"
										style={{
											background: '#D5DAE3',
											borderBottom: '2px solid #00559F',
											color: '#191C1E',
											fontSize: 13,
										}}
									/>
								</div>
							</div>
							<div className="flex gap-3">
								<button
									onClick={() => {
										void persistDraft('draft');
									}}
									className="px-4 py-2.5 rounded-[6px]"
									style={{
										background: '#D5DAE3',
										color: '#191C1E',
										fontWeight: 500,
										fontSize: 13,
									}}
								>
									Save Draft
								</button>
								<button
									onClick={() => {
										void persistDraft('submitted');
									}}
									disabled={submittingRfq}
									className="flex items-center gap-2 px-5 py-2.5 text-white rounded-[6px] transition-all hover:brightness-105 disabled:opacity-50"
									style={{
										background:
											'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)',
										fontWeight: 600,
										fontSize: 12,
										letterSpacing: '0.05em',
									}}
								>
									<Send className="w-4 h-4" /> SUBMIT RFQ
								</button>
							</div>
						</>
					)}
					{workflow.buyerRfqs.length > 0 && (
						<div className="mt-6 border-t border-slate-200 pt-5">
							<div className="flex items-center gap-2 mb-3 text-xs uppercase tracking-[0.06em] text-slate-500">
								<FileText className="w-4 h-4" /> Recent RFQs
							</div>
							<div className="space-y-2">
								{workflow.buyerRfqs.slice(0, 3).map((rfq) => (
									<button
										key={rfq.id}
										onClick={() => setSelectedRfqId(rfq.id)}
										className="w-full text-left rounded-lg border px-3 py-2 transition-colors"
										style={{
											borderColor:
												selectedRfqId === rfq.id ? '#0F4C8A' : '#E0E4EB',
											background:
												selectedRfqId === rfq.id ? '#F2F4F7' : '#FFFFFF',
										}}
									>
										<div className="flex items-center justify-between gap-3">
											<div>
												<p
													className="text-sm font-medium"
													style={{ color: '#191C1E' }}
												>
													{rfq.id} — {rfq.product}
												</p>
												<p className="text-xs text-slate-500">
													{rfq.status.replace('_', ' ')} · {rfq.deliveryDate}
												</p>
											</div>
											<span
												className="text-xs px-2 py-1 rounded-full"
												style={{
													background:
														rfq.status === 'submitted' ? '#C8F0D8' : '#D3E4F5',
													color:
														rfq.status === 'submitted' ? '#1B6B3A' : '#0F4C8A',
												}}
											>
												{rfq.items?.length ?? 0} item(s)
											</span>
										</div>
									</button>
								))}
							</div>
						</div>
					)}
				</div>
			)}

			{tab === 'compare' && (
				<div
					className="max-w-4xl mx-auto rounded-xl p-6"
					style={{
						background: '#FFFFFF',
						boxShadow: '0px 8px 24px rgba(15,76,138,0.08)',
					}}
				>
					<div className="flex items-center justify-between mb-5 flex-wrap gap-2">
						<div>
							<h4 style={{ color: '#191C1E' }}>Compare Quotations</h4>
							<p className="text-sm text-slate-500 mt-1">
								RFQ {activeDraft?.id ?? selectedRfqId ?? 'selected'} is ready
								for review.
							</p>
							{loadingQuotations && (
								<p className="mt-2 text-xs text-slate-400">
									Loading quotations...
								</p>
							)}
							{quotationsError && (
								<p className="mt-2 text-xs text-red-600">{quotationsError}</p>
							)}
						</div>
						<div className="flex items-center gap-2 text-sm text-slate-500">
							<SortAsc className="w-4 h-4" /> Sorted by score
						</div>
					</div>
					<div className="space-y-3">
						{openQuotations.length === 0 && !loadingQuotations && (
							<div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
								{selectedSupplierQuotation
									? 'All supplier selection is complete for this RFQ.'
									: 'No submitted quotations yet.'}
							</div>
						)}
						{openQuotations.map((quotation) => {
							return (
								<div
									key={quotation.id}
									className="rounded-xl border p-5 transition-all"
									style={{
										borderColor: '#E0E4EB',
										background: '#FFFFFF',
									}}
								>
									<div className="flex items-start justify-between gap-4 mb-3">
										<div>
											<p
												className="text-sm font-medium"
												style={{ color: '#191C1E' }}
											>
												{quotation.supplier}
											</p>
											<p className="text-xs text-slate-500 mt-0.5">
												{quotation.deliveryDays ?? '-'} days · {quotation.terms}
											</p>
										</div>
										<div
											className="flex items-center gap-1 px-2 py-1 rounded-full"
											style={{ background: '#FFEFC6' }}
										>
											<Star
												className="w-3.5 h-3.5"
												style={{ color: '#7A4F00' }}
											/>
											<span
												className="text-xs font-medium"
												style={{ color: '#7A4F00' }}
											>
												{quotation.score}
											</span>
										</div>
									</div>
									<div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
										<div className="rounded-lg bg-slate-50 p-3">
											<p className="text-xs text-slate-500">Unit price</p>
											<p className="font-medium text-black">
												{formatCurrency(quotation.unitPrice)}
											</p>
										</div>
										<div className="rounded-lg bg-slate-50 p-3">
											<p className="text-xs text-slate-500">Total</p>
											<p className="font-medium text-black">
												{formatCurrency(quotation.total)}
											</p>
										</div>
										<div className="rounded-lg bg-slate-50 p-3">
											<p className="text-xs text-slate-500">Validity</p>
											<p className="font-medium text-black">
												{quotation.validity}
											</p>
										</div>
										<div className="rounded-lg bg-slate-50 p-3">
											<p className="text-xs text-slate-500">Notes</p>
											<p className="font-medium text-black">
												{quotation.notes}
											</p>
										</div>
									</div>
									<div className="mt-4 flex items-center justify-end gap-3">
										<button
											onClick={() => setSelectionPreview(quotation)}
											className="px-4 py-2 rounded-[6px]"
											style={{
												background: '#D5DAE3',
												color: '#191C1E',
												fontWeight: 500,
												fontSize: 13,
											}}
										>
											Review
										</button>
										<button
											onClick={() => setSelectionPreview(quotation)}
											disabled={Boolean(selectedSupplierQuotation)}
											className="px-4 py-2 rounded-[6px] text-white font-semibold"
											style={{
												background: selectedSupplierQuotation
													? '#94A3B8'
													: 'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)',
												fontSize: 13,
												cursor: selectedSupplierQuotation
													? 'not-allowed'
													: 'pointer',
											}}
										>
											Select Supplier
										</button>
									</div>
								</div>
							);
						})}
					</div>
					{awaitingSuppliers.length > 0 && (
						<div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
							<p className="text-xs uppercase tracking-[0.06em] text-slate-500">
								Awaiting quotations
							</p>
							<div className="mt-3 space-y-2">
								{awaitingSuppliers.map((supplier) => (
									<div
										key={supplier.rfqId}
										className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
									>
										<span className="text-slate-700">{supplier.label}</span>
										<span className="text-xs text-slate-500">
											{supplier.status?.replace('_', ' ') ?? 'pending'} · score{' '}
											{supplier.score}
										</span>
									</div>
								))}
							</div>
						</div>
					)}
					<div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
						<p className="text-xs uppercase tracking-[0.06em] text-slate-500">
							Selected supplier
						</p>
						{selectedSupplierQuotation ? (
							<div className="mt-3 rounded-lg border border-green-200 bg-white p-4">
								<div className="flex items-start justify-between gap-3">
									<div>
										<p className="font-semibold text-slate-900">
											{selectedSupplierQuotation.supplier}
										</p>
										<p className="mt-1 text-xs text-slate-500">
											Confirmed for award · Quotation{' '}
											{selectedSupplierQuotation.id.slice(0, 8)}
										</p>
									</div>
									<span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
										SELECTED
									</span>
								</div>
								<div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
									{[
										[
											'Unit price',
											formatCurrency(selectedSupplierQuotation.unitPrice),
										],
										['Total', formatCurrency(selectedSupplierQuotation.total)],
										[
											'Delivery',
											selectedSupplierQuotation.deliveryDays
												? `${selectedSupplierQuotation.deliveryDays} days`
												: '-',
										],
										['Payment terms', selectedSupplierQuotation.terms],
									].map(([label, value]) => (
										<div key={label} className="rounded-lg bg-slate-50 p-3">
											<p className="text-xs text-slate-500">{label}</p>
											<p className="mt-1 font-medium text-slate-900">{value}</p>
										</div>
									))}
								</div>
							</div>
						) : (
							<p className="mt-2 text-sm text-slate-500">None</p>
						)}
						{selectionMessage && (
							<p className="mt-2 text-sm text-slate-700">{selectionMessage}</p>
						)}
					</div>
				</div>
			)}

			{selectionPreview && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
					<div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
						<h3 className="text-lg font-semibold text-slate-900">
							Purchase Order Preview
						</h3>
						<p className="mt-1 text-sm text-slate-500">
							Review the frozen commercial snapshot before creating the PO.
						</p>
						<div className="mt-5 grid grid-cols-2 gap-3 text-sm">
							{[
								['Supplier', selectionPreview.supplier],
								['Unit price', formatCurrency(selectionPreview.unitPrice)],
								['Total price', formatCurrency(selectionPreview.total)],
								[
									'Delivery',
									selectionPreview.deliveryDays
										? `${selectionPreview.deliveryDays} days`
										: '-',
								],
								['Payment terms', selectionPreview.terms],
								['Quotation', selectionPreview.id],
							].map(([label, value]) => (
								<div key={label} className="rounded-lg bg-slate-50 p-3">
									<p className="text-xs text-slate-500">{label}</p>
									<p className="mt-1 break-words font-medium text-slate-900">
										{value}
									</p>
								</div>
							))}
						</div>
						<div className="mt-5 flex justify-end gap-2">
							<button
								onClick={() => setSelectionPreview(null)}
								className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600"
							>
								Cancel
							</button>
							<button
								onClick={() => {
									void selectWinningQuotation(selectionPreview.id);
								}}
								className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
							>
								Confirm & Create PO
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
