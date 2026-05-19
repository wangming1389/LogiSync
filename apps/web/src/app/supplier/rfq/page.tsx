'use client';

import { ChevronLeft, FileText, Save, Send } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { getStoredAccessToken, parseJwtClaims } from '@/lib/auth';
import { updateWorkflowState, useWorkflowState } from '@/lib/workflow-store';
import { isDemoWorkspaceSession } from '@/lib/workspace-mode';

type BackendRfqItem = {
	product?: string;
	quantity?: number;
	qty?: number;
	unit?: string;
	deliveryDate?: string;
	notes?: string | null;
};

type BackendRfqDetail = {
	id: string;
	buyerWorkspaceId?: string;
	note?: string | null;
	status?: string;
	submittedAt?: string | null;
	createdAt?: string | null;
	updatedAt?: string | null;
	items?: BackendRfqItem[];
	quotation?: unknown;
};

function unwrapApiResponse<T>(response: any): T {
	return (response?.data ?? response?.items ?? response) as T;
}

function formatBuyerLabel(rfq: BackendRfqDetail) {
	if (!rfq.buyerWorkspaceId) return 'Buyer';
	return `Buyer ${rfq.buyerWorkspaceId.slice(0, 8)}`;
}

function mapStatus(status?: string) {
	if (status === 'pending_response') return 'pending';
	if (status === 'responded') return 'submitted';
	return status ?? 'pending';
}

function mapRfqToWorkflow(rfq: BackendRfqDetail) {
	const items = Array.isArray(rfq.items) ? rfq.items : [];
	const firstItem = items[0];
	const totalQty = items.reduce((total, item) => total + (item.quantity ?? item.qty ?? 0), 0);
	const summary =
		items.length > 1
			? `${firstItem?.product ?? 'Mixed Basket'} + ${items.length - 1} more`
			: firstItem?.product ?? rfq.note ?? 'RFQ';

	return {
		id: rfq.id,
		buyer: formatBuyerLabel(rfq),
		product: summary,
		qty: totalQty || (firstItem?.quantity ?? firstItem?.qty ?? 0),
		unit: firstItem?.unit ?? 'MT',
		deliveryDate: firstItem?.deliveryDate ?? rfq.submittedAt ?? rfq.createdAt ?? '',
		status: mapStatus(rfq.status),
		receivedAt: (rfq.submittedAt ?? rfq.createdAt ?? rfq.updatedAt ?? new Date().toISOString()).slice(0, 10),
		notes: rfq.note ?? firstItem?.notes ?? '',
		quotation: undefined,
	};
}

const statusColor: Record<string, { bg: string; color: string }> = {
	pending: { bg: '#FFEFC6', color: '#7A4F00' },
	draft_saved: { bg: '#D3E4F5', color: '#0F4C8A' },
	submitted: { bg: '#C8F0D8', color: '#1B6B3A' },
};

export default function SupplierRFQ() {
	const [workflow, setWorkflow] = useWorkflowState();
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [form, setForm] = useState({ price: '', terms: '', notes: '' });
	const [submittedMessage, setSubmittedMessage] = useState('');
	const [loadingRfqs, setLoadingRfqs] = useState(false);
	const [rfqError, setRfqError] = useState<string | null>(null);

	useEffect(() => {
		// Always attempt to load RFQs from backend so suppliers see DB-backed RFQs.
		// Demo local state will be merged/overwritten by this fetch where applicable.

		let mounted = true;
		setLoadingRfqs(true);
		setRfqError(null);

		(async () => {
			try {
				const claims = (typeof window !== 'undefined') ? parseJwtClaims(getStoredAccessToken() ?? '') : null;
				console.debug('SupplierRFQ: jwtClaims=', claims);
				const response: any = await api.get('/rfqs?status=pending_response&limit=50');
				const list = unwrapApiResponse<{ items?: BackendRfqDetail[] } | BackendRfqDetail[]>(response);
				const items = Array.isArray(list) ? list : list.items ?? [];

				const mapped = await Promise.all(
					items.map(async (rfq) => {
						const detailResponse: any = await api.get(`/rfqs/${rfq.id}`);
						const detail = unwrapApiResponse<BackendRfqDetail>(detailResponse);
						return mapRfqToWorkflow(detail);
					}),
				);

				if (mounted) {
					setWorkflow((currentState) => ({
						...currentState,
						supplierRfqs: mapped,
					}));
				}
			} catch (error) {
				try {
					console.error('SupplierRFQ: failed to load RFQs', JSON.stringify(error));
				} catch {
					console.error('SupplierRFQ: failed to load RFQs', error);
				}
				if (mounted) {
					const message =
						error && typeof error === 'object'
							? (error as any).message ?? JSON.stringify(error)
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

	function persist(status: 'draft_saved' | 'submitted') {
		if (!detail || !form.price) return;
		const nextState = updateWorkflowState((currentState) => {
			const supplierRfqs = currentState.supplierRfqs.map((rfq) =>
				rfq.id === detail.id
					? {
						...rfq,
						status,
						quotation: {
							price: Number(form.price),
							terms: form.terms,
							notes: form.notes,
							submittedAt: new Date().toLocaleString('vi-VN'),
						},
					}
					: rfq,
			);

			return {
				...currentState,
				supplierRfqs,
			};
		});

		setWorkflow(nextState);
		setSubmittedMessage(
			status === 'submitted'
				? 'Quotation submitted successfully.'
				: 'Quotation draft saved.',
		);
		if (status === 'submitted') {
			setSelectedId(null);
		}
	}

	if (selectedId && detail) {
		const s = statusColor[detail.status] ?? { bg: '#E0E4EB', color: '#191C1E' };

		return (
			<div className="p-6 max-w-2xl mx-auto">
				<button onClick={() => setSelectedId(null)} className="flex items-center gap-1 mb-4 hover:opacity-80" style={{ fontSize: 13, color: 'rgba(25,28,30,0.55)' }}>
					<ChevronLeft className="w-4 h-4" /> Back
				</button>
				<div className="rounded-xl p-6" style={{ background: '#FFFFFF', boxShadow: '0px 8px 24px rgba(15,76,138,0.08)' }}>
					<div className="flex items-start justify-between mb-5">
						<div>
							<h2 style={{ color: '#191C1E' }}>Respond to {detail.id}</h2>
							<p style={{ fontSize: 13, color: 'rgba(25,28,30,0.55)', marginTop: 2 }}>From: {detail.buyer} · Received: {detail.receivedAt}</p>
						</div>
						<span className="px-3 py-1 rounded-full" style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 500, letterSpacing: '0.05em' }}>
							{detail.status.replace('_', ' ').toUpperCase()}
						</span>
					</div>
					<div className="rounded-lg p-4 mb-5 grid grid-cols-2 gap-3" style={{ background: '#F2F4F7' }}>
						{[[ 'Product', detail.product ], [ 'Quantity', `${detail.qty} ${detail.unit}` ], [ 'Delivery Date', detail.deliveryDate ], [ 'Buyer Notes', detail.notes || '—' ]].map(([label, value]) => (
							<div key={label}>
								<p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(25,28,30,0.55)' }}>{label}</p>
								<p style={{ fontSize: 14, color: '#191C1E', marginTop: 2 }}>{value}</p>
							</div>
						))}
					</div>
					{submittedMessage && <div className="flex items-center gap-2 p-3 rounded-lg mb-4" style={{ background: '#C8F0D8', fontSize: 13, color: '#1B6B3A' }}><Send className="w-4 h-4" /> {submittedMessage}</div>}
					<div className="space-y-4">
						<div>
							<label className="block mb-1" style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(25,28,30,0.6)' }}>Quoted Price (₫/{detail.unit}) *</label>
							<input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Enter unit price..." className="w-full px-3 h-10 rounded-t-[6px] focus:outline-none" style={{ background: '#D5DAE3', borderBottom: '2px solid #00559F', color: '#191C1E', fontSize: 14 }} />
						</div>
						<div>
							<label className="block mb-1" style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(25,28,30,0.6)' }}>Payment Terms</label>
							<input value={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.value })} placeholder="e.g. 30% advance, 70% on delivery" className="w-full px-3 h-10 rounded-t-[6px] focus:outline-none" style={{ background: '#D5DAE3', borderBottom: '2px solid #00559F', color: '#191C1E', fontSize: 14 }} />
						</div>
						<div>
							<label className="block mb-1" style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(25,28,30,0.6)' }}>Additional Notes</label>
							<textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="Quality specs, certifications, lead time..." className="w-full px-3 py-2 rounded-t-[6px] focus:outline-none resize-none" style={{ background: '#D5DAE3', borderBottom: '2px solid #00559F', color: '#191C1E', fontSize: 14 }} />
						</div>
					</div>
					<div className="flex gap-3 mt-5">
						<button onClick={() => persist('draft_saved')} className="flex items-center gap-2 px-4 py-2.5 rounded-[6px]" style={{ background: '#D5DAE3', color: '#191C1E', fontWeight: 500, fontSize: 13 }}>
							<Save className="w-4 h-4" /> Save Draft
						</button>
						<button onClick={() => persist('submitted')} disabled={!form.price} className="flex items-center gap-2 px-5 py-2.5 text-white rounded-[6px] disabled:opacity-40 transition-all hover:brightness-105" style={{ background: 'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)', fontWeight: 600, fontSize: 12, letterSpacing: '0.05em' }}>
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
				<p className="mt-1 text-sm text-slate-500">Respond to buyer RFQs and track quotation status.</p>
				{loadingRfqs && <p className="mt-2 text-xs text-slate-400">Loading RFQs...</p>}
				{rfqError && <p className="mt-2 text-xs text-red-600">{rfqError}</p>}
			</div>
			{submittedMessage && <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{submittedMessage}</div>}
			<div className="space-y-3">
				{workflow.supplierRfqs.map((rfq) => {
					const s = statusColor[rfq.status] ?? { bg: '#E0E4EB', color: '#191C1E' };
					return (
						<button key={rfq.id} onClick={() => setSelectedId(rfq.id)} className="w-full text-left rounded-xl p-5 transition-all" style={{ background: '#FFFFFF', boxShadow: '0px 8px 24px rgba(15,76,138,0.08)' }}>
							<div className="flex items-start justify-between mb-2">
								<div className="flex items-start gap-3">
									<div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#D3E4F5' }}>
										<FileText className="w-5 h-5" style={{ color: '#0F4C8A' }} />
									</div>
									<div>
										<p style={{ fontSize: 15, fontWeight: 600, color: '#191C1E' }}>{rfq.id} — {rfq.product}</p>
										<p style={{ fontSize: 12, color: 'rgba(25,28,30,0.5)', marginTop: 2 }}>Buyer: {rfq.buyer} · {rfq.qty} {rfq.unit}</p>
									</div>
								</div>
								<span className="px-3 py-1 rounded-full" style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 500, letterSpacing: '0.05em' }}>{rfq.status.replace('_', ' ').toUpperCase()}</span>
							</div>
							<div className="flex items-center gap-4 mt-2" style={{ fontSize: 12, color: 'rgba(25,28,30,0.55)' }}>
								<span>Received: {rfq.receivedAt}</span>
								<span>·</span>
								<span>Delivery: {rfq.deliveryDate}</span>
								{rfq.quotation && (
									<>
										<span>·</span>
										<span>{rfq.quotation.price.toLocaleString('vi-VN')} quoted</span>
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