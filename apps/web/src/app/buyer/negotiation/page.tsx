'use client';

import {
	AlertTriangle,
	CheckCircle,
	ChevronLeft,
	Clock,
	RefreshCw,
	Send,
	TrendingDown,
	TrendingUp,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';

const SHADOW = '0px 8px 24px rgba(15,76,138,0.08)';

// ─── Types ───────────────────────────────────────────────────────────────────

type NegotiationRound = {
	id: string;
	quotationId: string;
	role: 'BUYER' | 'SUPPLIER';
	proposedPrice: number;
	proposedDeliveryDays: number;
	note: string | null;
	isAccepted: boolean;
	submittedBy: string;
	submittedAt: string;
};

type QuotationDetail = {
	id: string;
	rfqId: string;
	supplierWorkspaceId: string;
	status: string;
	totalPrice: number;
	unitPrice: number | null;
	estimatedDeliveryDate: number | null;
	deliveryTerms: string | null;
	note: string | null;
	isLocked: boolean;
	submittedAt: string | null;
	negotiationRounds: NegotiationRound[];
};

type QuotationSummary = {
	id: string;
	rfqId: string;
	supplierWorkspaceId: string | null;
	status: string;
	totalPrice: number | null;
	unitPrice: number | null;
	submittedAt: string | null;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function unwrap<T>(response: any): T {
	let p = response;
	if (p?.data !== undefined) p = p.data;
	if (p?.success !== undefined && p?.data !== undefined) p = p.data;
	return p as T;
}

function unwrapList<T>(response: any): T[] {
	const p = unwrap<any>(response);
	if (Array.isArray(p)) return p as T[];
	if (Array.isArray(p?.items)) return p.items as T[];
	if (Array.isArray(p?.data)) return p.data as T[];
	return [];
}

function formatMoney(value?: number | null) {
	return `₫${Number(value ?? 0).toLocaleString('vi-VN')}`;
}

function formatDate(value?: string | null) {
	if (!value) return '-';
	const d = new Date(value);
	if (isNaN(d.getTime())) return value.slice(0, 10);
	return d.toLocaleString('vi-VN');
}

function supplierLabel(id?: string | null) {
	if (!id) return 'Unknown Supplier';
	return `Supplier ${id.slice(0, 8)}`;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function RoundBubble({
	round,
	index,
	previousRound,
}: {
	round: NegotiationRound;
	index: number;
	previousRound?: NegotiationRound;
}) {
	const isBuyer = round.role === 'BUYER';
	const diff = previousRound
		? round.proposedPrice - previousRound.proposedPrice
		: 0;

	return (
		<div className={`flex ${isBuyer ? 'justify-end' : 'justify-start'}`}>
			<div
				className="max-w-[75%] p-4 rounded-xl"
				style={{
					background: isBuyer ? '#D3E4F5' : '#F2F4F7',
					borderRight: isBuyer ? '3px solid #1A6EC4' : 'none',
					borderLeft: isBuyer ? 'none' : '3px solid #0F4C8A',
				}}
			>
				<div className="flex items-center gap-2 mb-1 flex-wrap">
					<span style={{ fontSize: 11, color: 'rgba(25,28,30,0.55)' }}>
						Round {index + 1} — {isBuyer ? 'You (Buyer)' : 'Supplier'}
					</span>
					{previousRound && (
						<span
							className="flex items-center gap-0.5"
							style={{
								fontSize: 11,
								color: diff < 0 ? '#1B6B3A' : diff > 0 ? '#BA1A1A' : '#7A4F00',
							}}
						>
							{diff < 0 ? (
								<TrendingDown className="w-3 h-3" />
							) : (
								<TrendingUp className="w-3 h-3" />
							)}
							{diff > 0 ? '+' : ''}
							{formatMoney(diff)}
						</span>
					)}
					{round.isAccepted && (
						<span
							className="px-2 py-0.5 rounded-full"
							style={{ background: '#C8F0D8', color: '#1B6B3A', fontSize: 10, fontWeight: 600 }}
						>
							ACCEPTED
						</span>
					)}
				</div>
				<p style={{ fontSize: 22, fontWeight: 700, color: '#191C1E', letterSpacing: '-0.01em' }}>
					{formatMoney(round.proposedPrice)}
				</p>
				{round.proposedDeliveryDays > 0 && (
					<p style={{ fontSize: 12, color: 'rgba(25,28,30,0.6)', marginTop: 2 }}>
						Delivery: {round.proposedDeliveryDays} days
					</p>
				)}
				{round.note && (
					<p style={{ fontSize: 12, color: 'rgba(25,28,30,0.65)', marginTop: 4 }}>
						{round.note}
					</p>
				)}
				<p style={{ fontSize: 11, color: 'rgba(25,28,30,0.4)', marginTop: 4 }}>
					{formatDate(round.submittedAt)}
				</p>
			</div>
		</div>
	);
}

// ─── Detail panel ─────────────────────────────────────────────────────────────

function NegotiationDetail({
	quotationId,
	onBack,
}: {
	quotationId: string;
	onBack: () => void;
}) {
	const [detail, setDetail] = useState<QuotationDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [notice, setNotice] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);

	const [offerPrice, setOfferPrice] = useState('');
	const [offerDays, setOfferDays] = useState('');
	const [offerNote, setOfferNote] = useState('');

	const load = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const res: any = await api.get(`/quotations/${quotationId}`);
			const q = unwrap<QuotationDetail>(res);
			setDetail(q);
		} catch (err: any) {
			setError(err?.message ?? 'Failed to load quotation.');
		} finally {
			setLoading(false);
		}
	}, [quotationId]);

	useEffect(() => {
		load();
	}, [load]);

	const rounds = detail?.negotiationRounds ?? [];
	const latest = rounds[rounds.length - 1];

	// Buyer can counter-offer only if latest round is from SUPPLIER (or no rounds yet)
	const canCounter =
		detail &&
		!detail.isLocked &&
		detail.status === 'submitted' &&
		(!latest || latest.role === 'SUPPLIER');

	// Buyer can accept if latest round is from SUPPLIER
	const canAccept = detail && !detail.isLocked && latest?.role === 'SUPPLIER' && !latest.isAccepted;

	async function submitCounterOffer() {
		if (!offerPrice || !offerDays) return;
		setSubmitting(true);
		setError(null);
		try {
			await api.post(`/quotations/${quotationId}/negotiate`, {
				proposedPrice: Number(offerPrice),
				proposedDeliveryDays: Number(offerDays),
				note: offerNote.trim() || undefined,
			});
			setOfferPrice('');
			setOfferDays('');
			setOfferNote('');
			setNotice('Counter-offer submitted.');
			await load();
		} catch (err: any) {
			setError(err?.message ?? 'Failed to submit counter-offer.');
		} finally {
			setSubmitting(false);
		}
	}

	async function acceptRound() {
		if (!latest) return;
		setSubmitting(true);
		setError(null);
		try {
			await api.patch(`/quotations/${quotationId}/accept-round`, {
				roundId: latest.id,
			});
			setNotice('Round accepted. Terms are now locked in.');
			await load();
		} catch (err: any) {
			setError(err?.message ?? 'Failed to accept round.');
		} finally {
			setSubmitting(false);
		}
	}

	if (loading) {
		return (
			<div className="p-6 max-w-3xl mx-auto">
				<p className="text-sm text-slate-500">Loading negotiation...</p>
			</div>
		);
	}

	if (!detail) {
		return (
			<div className="p-6 max-w-3xl mx-auto">
				<p className="text-sm text-red-600">{error ?? 'Not found.'}</p>
			</div>
		);
	}

	return (
		<div className="p-6 max-w-3xl mx-auto">
			<button
				onClick={onBack}
				className="flex items-center gap-1 mb-4 hover:opacity-80"
				style={{ fontSize: 13, color: 'rgba(25,28,30,0.55)' }}
			>
				<ChevronLeft className="w-4 h-4" /> Back
			</button>

			<div className="rounded-xl p-6 mb-4" style={{ background: '#FFFFFF', boxShadow: SHADOW }}>
				<div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
					<div>
						<h2 style={{ color: '#191C1E' }}>Negotiation</h2>
						<p style={{ fontSize: 13, color: 'rgba(25,28,30,0.55)', marginTop: 2 }}>
							Quotation {detail.id.slice(0, 8)} · {supplierLabel(detail.supplierWorkspaceId)}
						</p>
					</div>
					<div className="flex items-center gap-2">
						<span
							className="px-3 py-1 rounded-full"
							style={{
								background: detail.isLocked ? '#C8F0D8' : '#FFEFC6',
								color: detail.isLocked ? '#1B6B3A' : '#7A4F00',
								fontSize: 11,
								fontWeight: 500,
							}}
						>
							{detail.isLocked ? 'LOCKED' : detail.status.replace(/_/g, ' ').toUpperCase()}
						</span>
						<button
							onClick={load}
							className="p-1.5 rounded-lg hover:bg-slate-100"
							title="Refresh"
						>
							<RefreshCw className="w-4 h-4 text-slate-500" />
						</button>
					</div>
				</div>

				{/* Snapshot */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
					{[
						['Original Price', formatMoney(detail.unitPrice ?? detail.totalPrice)],
						['Total', formatMoney(detail.totalPrice)],
						['Delivery Terms', detail.deliveryTerms ?? '-'],
						['Rounds', String(rounds.length)],
					].map(([label, value]) => (
						<div key={label} className="rounded-lg p-3" style={{ background: '#F2F4F7' }}>
							<p className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">{label}</p>
							<p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
						</div>
					))}
				</div>

				{/* Notices */}
				{notice && (
					<div className="flex items-center gap-2 p-3 rounded-lg mb-4"
						style={{ background: '#C8F0D8', fontSize: 13, color: '#1B6B3A' }}>
						<CheckCircle className="w-4 h-4" /> {notice}
					</div>
				)}
				{error && (
					<div className="flex items-center gap-2 p-3 rounded-lg mb-4"
						style={{ background: '#FFDAD6', fontSize: 13, color: '#BA1A1A' }}>
						<AlertTriangle className="w-4 h-4" /> {error}
					</div>
				)}

				{/* Round history */}
				{rounds.length === 0 ? (
					<div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 mb-4">
						No negotiation rounds yet. Supplier will make the first offer, or you can counter the original quotation.
					</div>
				) : (
					<div className="space-y-3 mb-5">
						{rounds.map((round, i) => (
							<RoundBubble
								key={round.id}
								round={round}
								index={i}
								previousRound={rounds[i - 1]}
							/>
						))}
					</div>
				)}

				{/* Accept latest supplier round */}
				{canAccept && (
					<div className="rounded-xl border border-green-200 bg-green-50 p-4 mb-4">
						<p className="text-sm font-medium text-green-800 mb-1">
							Supplier offered {formatMoney(latest.proposedPrice)} · {latest.proposedDeliveryDays} days
						</p>
						<p className="text-xs text-green-700 mb-3">{latest.note ?? 'No note.'}</p>
						<button
							onClick={acceptRound}
							disabled={submitting}
							className="flex items-center gap-2 px-4 py-2 text-white rounded-[6px] disabled:opacity-50 transition-all hover:brightness-105"
							style={{ background: 'linear-gradient(135deg, #1B6B3A 0%, #0d4a28 100%)', fontWeight: 600, fontSize: 12 }}
						>
							<CheckCircle className="w-4 h-4" /> ACCEPT THIS OFFER
						</button>
					</div>
				)}

				{/* Counter-offer form */}
				{canCounter && (
					<div className="pt-4" style={{ borderTop: '1px solid #E0E4EB' }}>
						<p className="mb-3 text-[11px] font-medium uppercase tracking-[0.05em] text-slate-500">
							Submit Counter-Offer
						</p>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
							<div>
								<label className="block mb-1 text-[11px] font-medium uppercase tracking-[0.05em] text-slate-500">
									Your Proposed Price (₫) *
								</label>
								<input
									type="number"
									value={offerPrice}
									onChange={(e) => setOfferPrice(e.target.value)}
									placeholder="e.g. 11500000"
									className="w-full px-3 h-10 rounded-t-[6px] focus:outline-none"
									style={{ background: '#D5DAE3', borderBottom: '2px solid #00559F', color: '#191C1E', fontSize: 14 }}
								/>
							</div>
							<div>
								<label className="block mb-1 text-[11px] font-medium uppercase tracking-[0.05em] text-slate-500">
									Proposed Delivery Days *
								</label>
								<input
									type="number"
									value={offerDays}
									onChange={(e) => setOfferDays(e.target.value)}
									placeholder="e.g. 14"
									className="w-full px-3 h-10 rounded-t-[6px] focus:outline-none"
									style={{ background: '#D5DAE3', borderBottom: '2px solid #00559F', color: '#191C1E', fontSize: 14 }}
								/>
							</div>
						</div>
						<textarea
							value={offerNote}
							onChange={(e) => setOfferNote(e.target.value)}
							rows={2}
							placeholder="Notes for this round (optional)..."
							className="w-full px-3 py-2 rounded-t-[6px] focus:outline-none resize-none mb-3"
							style={{ background: '#D5DAE3', borderBottom: '2px solid #00559F', color: '#191C1E', fontSize: 14 }}
						/>
						<button
							onClick={submitCounterOffer}
							disabled={!offerPrice || !offerDays || submitting}
							className="flex items-center gap-2 px-5 py-2.5 text-white rounded-[6px] disabled:opacity-40 transition-all hover:brightness-105"
							style={{ background: 'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)', fontWeight: 600, fontSize: 12, letterSpacing: '0.05em' }}
						>
							<Send className="w-4 h-4" /> SUBMIT COUNTER-OFFER
						</button>
					</div>
				)}

				{detail.isLocked && (
					<div className="rounded-lg p-3 mt-4" style={{ background: '#C8F0D8' }}>
						<p className="text-sm font-medium text-green-800">
							✓ Terms agreed — quotation is locked. Proceed to confirm the Purchase Order.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}

// ─── List view ────────────────────────────────────────────────────────────────

export default function BuyerNegotiation() {
	const [quotations, setQuotations] = useState<QuotationSummary[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selected, setSelected] = useState<string | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			// Load all child RFQs then their quotations
			const rfqRes: any = await api.get('/rfqs?limit=50');
			const rfqs = unwrapList<any>(rfqRes);
			const childRfqs = rfqs.filter((r: any) => r.parentRfqId);

			const groups = await Promise.all(
				childRfqs.map(async (rfq: any) => {
					try {
						const qRes: any = await api.get(`/rfqs/${rfq.id}/quotations`);
						return unwrapList<QuotationSummary>(qRes).map((q) => ({
							...q,
							supplierWorkspaceId: q.supplierWorkspaceId ?? rfq.supplierWorkspaceId,
						}));
					} catch {
						return [];
					}
				}),
			);

			const all = groups
				.flat()
				.filter((q) => q.status === 'submitted')
				.sort((a, b) => new Date(b.submittedAt ?? 0).getTime() - new Date(a.submittedAt ?? 0).getTime());

			setQuotations(all);
		} catch (err: any) {
			setError(err?.message ?? 'Failed to load quotations.');
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		load();
	}, [load]);

	if (selected) {
		return <NegotiationDetail quotationId={selected} onBack={() => setSelected(null)} />;
	}

	return (
		<div className="p-6">
			<div className="mb-6 flex items-start justify-between gap-4">
				<div>
					<h1 style={{ color: '#191C1E' }}>Price Negotiation</h1>
					<p className="mt-1 text-sm text-slate-500">
						Counter-offer or accept supplier quotations before confirming a PO.
					</p>
				</div>
				<button
					onClick={load}
					disabled={loading}
					className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 disabled:opacity-50"
				>
					<RefreshCw className="w-4 h-4" /> Refresh
				</button>
			</div>

			{loading && <p className="text-sm text-slate-500">Loading quotations...</p>}
			{error && (
				<div className="flex items-center gap-2 p-3 rounded-lg mb-4"
					style={{ background: '#FFDAD6', fontSize: 13, color: '#BA1A1A' }}>
					<AlertTriangle className="w-4 h-4" /> {error}
				</div>
			)}
			{!loading && quotations.length === 0 && (
				<div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
					No submitted quotations available for negotiation. Submit an RFQ first and wait for supplier responses.
				</div>
			)}

			<div className="space-y-3">
				{quotations.map((q) => (
					<button
						key={q.id}
						onClick={() => setSelected(q.id)}
						className="w-full text-left rounded-xl p-5 transition-all hover:shadow-md"
						style={{ background: '#FFFFFF', boxShadow: SHADOW }}
					>
						<div className="flex items-start justify-between gap-4 mb-3">
							<div>
								<p className="text-sm font-semibold" style={{ color: '#191C1E' }}>
									{supplierLabel(q.supplierWorkspaceId)}
								</p>
								<p className="text-xs text-slate-500 mt-0.5">
									Quotation {q.id.slice(0, 8)} · RFQ {q.rfqId.slice(0, 8)}
								</p>
							</div>
							<span
								className="px-3 py-1 rounded-full shrink-0"
								style={{
									background: '#FFEFC6',
									color: '#7A4F00',
									fontSize: 11,
									fontWeight: 500,
								}}
							>
								{q.status.replace(/_/g, ' ').toUpperCase()}
							</span>
						</div>
						<div className="flex flex-wrap gap-4 text-xs text-slate-500">
							<span className="flex items-center gap-1">
								<span className="font-medium text-slate-900">{formatMoney(q.unitPrice ?? q.totalPrice)}</span> unit price
							</span>
							<span className="flex items-center gap-1">
								<Clock className="w-3 h-3" />
								Submitted {q.submittedAt ? new Date(q.submittedAt).toLocaleDateString('vi-VN') : '-'}
							</span>
						</div>
					</button>
				))}
			</div>
		</div>
	);
}