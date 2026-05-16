'use client';

import {
	ArrowRight,
	CheckCircle,
	FileText,
	Plus,
	Search,
	ShoppingCart,
	SortAsc,
	Star,
	X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
	buyerProducts,
	quotationComparisons,
} from '@/app/data/mockData';
import {
	BuyerRfqItem,
	getWorkflowClone,
	makeWorkflowId,
	updateWorkflowState,
} from '@/lib/workflow-store';

type SortBy = 'score' | 'price';
type Tab = 'search' | 'rfq' | 'compare';

function formatCurrency(value: number) {
	return `₫${value.toLocaleString('vi-VN')}`;
}

export default function BuyerSourcing() {
	const [tab, setTab] = useState<Tab>('search');
	const [search, setSearch] = useState('');
	const [filterCat, setFilterCat] = useState('All');
	const [sortBy, setSortBy] = useState<SortBy>('score');
	const [workflow, setWorkflow] = useState(() => getWorkflowClone());
	const [cart, setCart] = useState<string[]>([]);
	const [deliveryDate, setDeliveryDate] = useState('2026-05-01');
	const [notes, setNotes] = useState('');
	const [submittedMessage, setSubmittedMessage] = useState('');
	const [selectedQuotation, setSelectedQuotation] = useState<string | null>(null);
	const [selectedRfqId, setSelectedRfqId] = useState<string | null>(null);

	const categories = ['All', 'Rice', 'Grain', 'Legume', 'Nut'];
	useEffect(() => {
		const currentDraft = workflow.buyerRfqs.find((rfq) => rfq.status === 'draft');
		if (currentDraft?.items?.length) {
			setCart(currentDraft.items.map((item) => item.productId ?? item.product));
			setNotes(currentDraft.note ?? '');
			setDeliveryDate(currentDraft.deliveryDate ?? '2026-05-01');
			setSelectedRfqId(currentDraft.id);
		}
	}, [workflow.buyerRfqs]);

	const filteredProducts = useMemo(
		() =>
			buyerProducts
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
		[search, filterCat, sortBy],
	);

	const activeComparison = quotationComparisons[0];
	const activeDraft =
		workflow.buyerRfqs.find((rfq) => rfq.id === selectedRfqId) ??
		workflow.buyerRfqs.find((rfq) => rfq.status === 'draft') ??
		workflow.buyerRfqs.find((rfq) => rfq.status === 'submitted') ??
		null;

	function addToCart(productId: string) {
		setCart((current) =>
			current.includes(productId) ? current : [...current, productId],
		);
	}

	function removeFromCart(productId: string) {
		setCart((current) => current.filter((item) => item !== productId));
	}

	function persistDraft(status: 'draft' | 'submitted') {
		const items: BuyerRfqItem[] = cart.map((productId) => {
			const product = buyerProducts.find((entry) => entry.id === productId);
			return {
				product: product?.name ?? productId,
				qty: product?.minQty ?? 1,
				unit: product?.unit ?? 'MT',
				productId,
			};
		});

		const nextRfqId =
			selectedRfqId ?? makeWorkflowId('BRFQ', workflow.buyerRfqs.map((rfq) => rfq.id));
		const primaryProduct = items[0]?.product ?? 'Mixed Basket';
		const summary = items.length > 1 ? `${primaryProduct} + ${items.length - 1} more` : primaryProduct;

		updateWorkflowState((currentState) => {
			const existingIndex = currentState.buyerRfqs.findIndex((rfq) => rfq.id === nextRfqId);
			const nextRfq = {
				id: nextRfqId,
				buyer: 'Current Workspace',
				product: summary,
				qty: items.reduce((total, item) => total + item.qty, 0),
				unit: 'MT',
				deliveryDate,
				status,
				receivedAt: new Date().toISOString().slice(0, 10),
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
		setSubmittedMessage(
			status === 'submitted'
				? 'RFQ submitted to suppliers.'
				: 'Draft saved locally.',
		);
		if (status === 'submitted') {
			setTab('compare');
		}
	}

	const cartItems = cart
		.map((productId) => buyerProducts.find((product) => product.id === productId))
		.filter((item): item is (typeof buyerProducts)[number] => Boolean(item));

	return (
		<div className="p-6">
			<div className="mb-6">
				<h1 style={{ color: '#191C1E' }}>Sourcing</h1>
				<p className="mt-1 text-sm text-slate-500">
					Draft RFQs, compare quotations, and move selected items into workflow.
				</p>
			</div>

			<div className="flex gap-1 p-1 rounded-lg mb-6 flex-wrap" style={{ background: '#E0E4EB' }}>
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
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(25,28,30,0.4)' }} />
							<input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search product or supplier..." className="w-full pl-9 pr-4 h-10 rounded-t-[6px] focus:outline-none" style={{ background: '#D5DAE3', borderBottom: '2px solid #00559F', color: '#191C1E', fontSize: 14 }} />
						</div>
						{categories.map((category) => (
							<button key={category} onClick={() => setFilterCat(category)} className="px-3 py-2 rounded-[6px] transition-all" style={{ background: filterCat === category ? '#0F4C8A' : '#E0E4EB', color: filterCat === category ? '#FFFFFF' : 'rgba(25,28,30,0.65)', fontSize: 13, fontWeight: filterCat === category ? 600 : 400 }}>
								{category}
							</button>
						))}
						<select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)} className="px-3 h-10 rounded-t-[6px] focus:outline-none" style={{ background: '#D5DAE3', borderBottom: '2px solid transparent', color: '#191C1E', fontSize: 13 }}>
							<option value="score">Sort: Reputation ↓</option>
							<option value="price">Sort: Price ↑</option>
						</select>
					</div>
					<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
						{filteredProducts.map((product) => (
							<div key={product.id} className="rounded-xl p-5 transition-all" style={{ background: '#FFFFFF', boxShadow: '0px 8px 24px rgba(15,76,138,0.08)' }}>
								<div className="flex items-start justify-between mb-3">
									<div>
										<p className="text-[15px] font-semibold" style={{ color: '#191C1E' }}>{product.name}</p>
										<p className="text-xs mt-0.5 text-slate-500">{product.supplier}</p>
									</div>
									<div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: '#FFEFC6' }}>
										<Star className="w-3 h-3" style={{ color: '#7A4F00' }} />
										<span className="text-xs font-medium" style={{ color: '#7A4F00' }}>{product.supplierScore}</span>
									</div>
								</div>
								<span className="px-3 py-1 rounded-full" style={{ background: '#D3E4F5', color: '#0F4C8A', fontSize: 11, fontWeight: 500, letterSpacing: '0.05em' }}>
									{product.category.toUpperCase()}
								</span>
								<div className="mt-3 flex items-center justify-between gap-3">
									<div>
										<p className="text-[15px] font-semibold" style={{ color: '#0F4C8A' }}>{formatCurrency(product.basePrice)}</p>
										<p className="text-xs text-slate-500">/{product.unit} · Min {product.minQty} {product.unit}</p>
									</div>
									<button onClick={() => addToCart(product.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-white transition-all" style={{ background: cart.includes(product.id) ? '#C8F0D8' : 'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)', color: cart.includes(product.id) ? '#1B6B3A' : '#FFFFFF', fontSize: 12, fontWeight: 500 }}>
										{cart.includes(product.id) ? <><CheckCircle className="w-3.5 h-3.5" /> Added</> : <><Plus className="w-3.5 h-3.5" /> ADD TO RFQ</>}
									</button>
								</div>
							</div>
						))}
					</div>
					{cart.length > 0 && (
						<button onClick={() => setTab('rfq')} className="fixed bottom-6 right-6 px-5 py-3 rounded-xl text-white flex items-center gap-2 cursor-pointer transition-all hover:brightness-105" style={{ background: 'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)', boxShadow: '0px 8px 24px rgba(15,76,138,0.25)' }}>
							<ShoppingCart className="w-5 h-5" />
							{cart.length} item(s) in RFQ draft
							<ArrowRight className="w-4 h-4" />
						</button>
					)}
				</>
			)}

			{tab === 'rfq' && (
				<div className="max-w-3xl mx-auto rounded-xl p-6" style={{ background: '#FFFFFF', boxShadow: '0px 8px 24px rgba(15,76,138,0.08)' }}>
					<div className="flex items-center justify-between mb-5">
						<div>
							<h4 style={{ color: '#191C1E' }}>Draft RFQ</h4>
							<p className="text-sm text-slate-500 mt-1">{workflow.buyerRfqs.filter((rfq) => rfq.status === 'submitted').length} RFQ(s) submitted</p>
						</div>
						{submittedMessage && <div className="rounded-full px-3 py-1 text-sm" style={{ background: '#C8F0D8', color: '#1B6B3A' }}>{submittedMessage}</div>}
					</div>
					<div className="space-y-3 mb-5">
						{cartItems.map((product) => (
							<div key={product.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: '#F2F4F7' }}>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium" style={{ color: '#191C1E' }}>{product.name}</p>
									<p className="text-xs text-slate-500">{product.supplier}</p>
								</div>
								<div className="text-xs text-slate-500 whitespace-nowrap">Min {product.minQty} {product.unit}</div>
								<button onClick={() => removeFromCart(product.id)} className="text-slate-500"><X className="w-4 h-4" /></button>
							</div>
						))}
						{cartItems.length === 0 && <p className="py-8 text-center text-sm text-slate-400">No items added. Go to Product Search.</p>}
					</div>
					{cartItems.length > 0 && (
						<>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
								<div>
									<label className="block mb-1 text-[11px] font-medium uppercase tracking-[0.05em] text-slate-500">Required Delivery Date</label>
									<input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} className="w-full px-3 h-10 rounded-t-[6px] focus:outline-none" style={{ background: '#D5DAE3', borderBottom: '2px solid #00559F', color: '#191C1E', fontSize: 13 }} />
								</div>
								<div>
									<label className="block mb-1 text-[11px] font-medium uppercase tracking-[0.05em] text-slate-500">RFQ Note</label>
									<input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Spec, packaging, incoterms..." className="w-full px-3 h-10 rounded-t-[6px] focus:outline-none" style={{ background: '#D5DAE3', borderBottom: '2px solid #00559F', color: '#191C1E', fontSize: 13 }} />
								</div>
							</div>
							<div className="flex gap-3">
								<button onClick={() => persistDraft('draft')} className="px-4 py-2.5 rounded-[6px]" style={{ background: '#D5DAE3', color: '#191C1E', fontWeight: 500, fontSize: 13 }}>
									Save Draft
								</button>
								<button onClick={() => persistDraft('submitted')} className="flex items-center gap-2 px-5 py-2.5 text-white rounded-[6px] transition-all hover:brightness-105" style={{ background: 'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)', fontWeight: 600, fontSize: 12, letterSpacing: '0.05em' }}>
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
									<button key={rfq.id} onClick={() => setSelectedRfqId(rfq.id)} className="w-full text-left rounded-lg border px-3 py-2 transition-colors" style={{ borderColor: selectedRfqId === rfq.id ? '#0F4C8A' : '#E0E4EB', background: selectedRfqId === rfq.id ? '#F2F4F7' : '#FFFFFF' }}>
										<div className="flex items-center justify-between gap-3">
											<div>
												<p className="text-sm font-medium" style={{ color: '#191C1E' }}>{rfq.id} — {rfq.product}</p>
												<p className="text-xs text-slate-500">{rfq.status.replace('_', ' ')} · {rfq.deliveryDate}</p>
											</div>
											<span className="text-xs px-2 py-1 rounded-full" style={{ background: rfq.status === 'submitted' ? '#C8F0D8' : '#D3E4F5', color: rfq.status === 'submitted' ? '#1B6B3A' : '#0F4C8A' }}>
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
				<div className="max-w-4xl mx-auto rounded-xl p-6" style={{ background: '#FFFFFF', boxShadow: '0px 8px 24px rgba(15,76,138,0.08)' }}>
					<div className="flex items-center justify-between mb-5 flex-wrap gap-2">
						<div>
							<h4 style={{ color: '#191C1E' }}>Compare Quotations</h4>
							<p className="text-sm text-slate-500 mt-1">
								RFQ {activeDraft?.id ?? selectedRfqId ?? activeComparison.rfqId} is ready for review.
							</p>
						</div>
						<div className="flex items-center gap-2 text-sm text-slate-500">
							<SortAsc className="w-4 h-4" /> Sorted by score
						</div>
					</div>
					<div className="space-y-3">
						{activeComparison.quotations.map((quotation) => {
							const isSelected = selectedQuotation === quotation.id;
							return (
								<div key={quotation.id} className="rounded-xl border p-5 transition-all" style={{ borderColor: isSelected ? '#0F4C8A' : '#E0E4EB', background: isSelected ? '#F8FAFC' : '#FFFFFF' }}>
									<div className="flex items-start justify-between gap-4 mb-3">
										<div>
											<p className="text-sm font-medium" style={{ color: '#191C1E' }}>{quotation.supplier}</p>
											<p className="text-xs text-slate-500 mt-0.5">{quotation.deliveryDays} days · {quotation.terms}</p>
										</div>
										<div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: '#FFEFC6' }}>
											<Star className="w-3.5 h-3.5" style={{ color: '#7A4F00' }} />
											<span className="text-xs font-medium" style={{ color: '#7A4F00' }}>{quotation.score}</span>
										</div>
									</div>
									<div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
										<div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Unit price</p><p className="font-medium">{formatCurrency(quotation.unitPrice)}</p></div>
										<div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Total</p><p className="font-medium">{formatCurrency(quotation.total)}</p></div>
										<div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Validity</p><p className="font-medium">{quotation.validity}</p></div>
										<div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Notes</p><p className="font-medium">{quotation.notes}</p></div>
									</div>
									<div className="mt-4 flex items-center justify-end gap-3">
										{isSelected && <span className="text-sm text-green-700">Confirmed for award</span>}
										<button onClick={() => setSelectedQuotation(quotation.id)} className="px-4 py-2 rounded-[6px]" style={{ background: '#D5DAE3', color: '#191C1E', fontWeight: 500, fontSize: 13 }}>Review</button>
										<button onClick={() => setSelectedQuotation(quotation.id)} className="px-4 py-2 rounded-[6px] text-white font-semibold" style={{ background: 'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)', fontSize: 13 }}>Select Supplier</button>
									</div>
								</div>
							);
						})}
					</div>
					<div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
						Selected supplier: {selectedQuotation ?? 'none'}
					</div>
				</div>
			)}
		</div>
	);
}