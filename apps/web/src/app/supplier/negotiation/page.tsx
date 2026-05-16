'use client';

import { Lock, Send, TrendingDown, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { getWorkflowClone, updateWorkflowState } from '@/lib/workflow-store';

const SHADOW = '0px 8px 24px rgba(15,76,138,0.08)';

export default function SupplierNegotiation() {
	const [workflow, setWorkflow] = useState(() => getWorkflowClone());
	const [selected, setSelected] = useState(workflow.negotiations[0]?.id ?? '');
	const [newPrice, setNewPrice] = useState('');
	const [newNote, setNewNote] = useState('');
	const [showFinalize, setShowFinalize] = useState(false);
	const [finalizedMessage, setFinalizedMessage] = useState('');

	const neg = useMemo(
		() => workflow.negotiations.find((item) => item.id === selected) ?? workflow.negotiations[0],
		[workflow.negotiations, selected],
	);

	function submitRound() {
		if (!neg || !newPrice) return;
		const nextState = updateWorkflowState((currentState) => {
			const negotiations = currentState.negotiations.map((item) => {
				if (item.id !== neg.id) return item;
				return {
					...item,
					rounds: [
						...item.rounds,
						{
							round: item.rounds.length + 1,
							by: 'Supplier',
							price: Number(newPrice),
							notes: newNote,
							timestamp: new Date().toLocaleString('vi-VN'),
						},
					],
				};
			});

			return {
				...currentState,
				negotiations,
			};
		});

		setWorkflow(nextState);
		setNewPrice('');
		setNewNote('');
	}

	function finalizeOrder() {
		if (!neg) return;
		const nextState = updateWorkflowState((currentState) => ({
			...currentState,
			negotiations: currentState.negotiations.map((item) =>
				item.id === neg.id ? { ...item, status: 'finalized' } : item,
			),
			finalizedNegotiationIds: currentState.finalizedNegotiationIds.includes(neg.id)
				? currentState.finalizedNegotiationIds
				: [...currentState.finalizedNegotiationIds, neg.id],
		}));

		setWorkflow(nextState);
		setShowFinalize(false);
		setFinalizedMessage('Order locked at the agreed price.');
	}

	if (!neg) {
		return <div className="p-6 text-slate-500">No active negotiations.</div>;
	}

	const lastPrice = neg.rounds[neg.rounds.length - 1]?.price;

	return (
		<div className="p-6">
			<h1 className="mb-6" style={{ color: '#191C1E' }}>Price Negotiation</h1>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
				<div className="rounded-xl p-4 lg:col-span-1" style={{ background: '#FFFFFF', boxShadow: SHADOW }}>
					<p className="mb-3 text-[11px] font-medium uppercase tracking-[0.05em] text-slate-500">Active Negotiations</p>
					{workflow.negotiations.map((item) => (
						<button key={item.id} onClick={() => setSelected(item.id)} className="w-full text-left px-3 py-3 rounded-lg mb-2 transition-all" style={{ background: selected === item.id ? '#D3E4F5' : '#F2F4F7', borderLeft: selected === item.id ? '3px solid #0F4C8A' : '3px solid transparent' }}>
							<p style={{ fontSize: 14, fontWeight: 600, color: '#191C1E' }}>{item.id} — {item.product}</p>
							<p style={{ fontSize: 12, color: 'rgba(25,28,30,0.55)', marginTop: 2 }}>Buyer: {item.buyer}</p>
							<span className="mt-1 inline-block px-2 py-0.5 rounded-full" style={{ background: item.status === 'finalized' ? '#C8F0D8' : '#FFEFC6', color: item.status === 'finalized' ? '#1B6B3A' : '#7A4F00', fontSize: 11, fontWeight: 500, letterSpacing: '0.04em' }}>{item.status.toUpperCase()}</span>
						</button>
					))}
				</div>

				<div className="lg:col-span-2 space-y-4">
					<div className="rounded-xl p-5" style={{ background: '#FFFFFF', boxShadow: SHADOW }}>
						<div className="flex items-center justify-between mb-4 flex-wrap gap-2">
							<div>
								<h4 style={{ color: '#191C1E' }}>{neg.product}</h4>
								<p style={{ fontSize: 12, color: 'rgba(25,28,30,0.55)', marginTop: 2 }}>Buyer: {neg.buyer} · Order: {neg.orderId}</p>
							</div>
							{neg.status === 'open' && (
								<button onClick={() => setShowFinalize(true)} className="flex items-center gap-2 px-3 py-1.5 text-white rounded-[6px] transition-all hover:brightness-105" style={{ background: '#191C1E', fontWeight: 500, fontSize: 12 }}>
									<Lock className="w-3.5 h-3.5" /> Finalize Order
								</button>
							)}
							{neg.status === 'finalized' && <span className="px-3 py-1.5 rounded-full" style={{ background: '#C8F0D8', color: '#1B6B3A', fontSize: 12 }}>Order Locked ✓</span>}
						</div>

						{finalizedMessage && <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{finalizedMessage}</div>}

						<div className="space-y-3 mb-5">
							{neg.rounds.map((round) => {
								const isSupplier = round.by === 'Supplier';
								const previousPrice = neg.rounds[round.round - 2]?.price;
								const diff = previousPrice ? round.price - previousPrice : 0;
								return (
									<div key={round.round} className={`flex ${isSupplier ? 'justify-end' : 'justify-start'}`}>
										<div className="max-w-[75%] p-4 rounded-xl" style={{ background: isSupplier ? '#D3E4F5' : '#F2F4F7', borderLeft: isSupplier ? 'none' : '3px solid #0F4C8A', borderRight: isSupplier ? '3px solid #1A6EC4' : 'none' }}>
											<div className="flex items-center gap-2 mb-1">
												<span style={{ fontSize: 11, color: 'rgba(25,28,30,0.55)' }}>Round {round.round} — {round.by}</span>
												{previousPrice && <span className="flex items-center gap-0.5" style={{ fontSize: 11, color: diff > 0 ? '#1B6B3A' : '#BA1A1A' }}>{diff > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}{diff > 0 ? '+' : ''}{(diff / 1000000).toFixed(1)}M</span>}
											</div>
											<p style={{ fontSize: 20, fontWeight: 700, color: '#191C1E', letterSpacing: '-0.01em' }}>₫{round.price.toLocaleString('vi-VN')}/MT</p>
											{round.notes && <p style={{ fontSize: 12, color: 'rgba(25,28,30,0.65)', marginTop: 4 }}>{round.notes}</p>}
											<p style={{ fontSize: 11, color: 'rgba(25,28,30,0.4)', marginTop: 4 }}>{round.timestamp}</p>
										</div>
									</div>
								);
							})}
						</div>

						{neg.status === 'open' && !workflow.finalizedNegotiationIds.includes(neg.id) && (
							<div className="pt-4" style={{ borderTop: '1px solid #E0E4EB' }}>
								<p className="mb-3 text-[11px] font-medium uppercase tracking-[0.05em] text-slate-500">Submit New Price Offer</p>
								<div className="flex gap-3 mb-3">
									<div className="flex-1">
										<label className="block mb-1 text-[11px] font-medium uppercase tracking-[0.05em] text-slate-500">New Price (₫/MT)</label>
										<input type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder="e.g. 75000000" className="w-full px-3 h-10 rounded-t-[6px] focus:outline-none" style={{ background: '#D5DAE3', borderBottom: '2px solid #00559F', color: '#191C1E', fontSize: 14 }} />
									</div>
								</div>
								<textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} rows={2} placeholder="Notes for this round..." className="w-full px-3 py-2 rounded-t-[6px] focus:outline-none resize-none mb-3" style={{ background: '#D5DAE3', borderBottom: '2px solid #00559F', color: '#191C1E', fontSize: 14 }} />
								<button onClick={submitRound} disabled={!newPrice} className="flex items-center gap-2 px-4 py-2.5 text-white rounded-[6px] disabled:opacity-40 transition-all hover:brightness-105" style={{ background: 'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)', fontWeight: 600, fontSize: 12, letterSpacing: '0.05em' }}>
									<Send className="w-4 h-4" /> SUBMIT ROUND {neg.rounds.length + 1}
								</button>
							</div>
						)}
					</div>
				</div>
			</div>

			{showFinalize && (
				<div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
					<div className="rounded-xl p-6 w-full max-w-sm" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', boxShadow: SHADOW }}>
						<div className="flex items-center gap-3 mb-4">
							<div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#E0E4EB' }}>
								<Lock className="w-5 h-5" style={{ color: '#191C1E' }} />
							</div>
							<h3 style={{ color: '#191C1E' }}>Finalize & Lock Order</h3>
						</div>
						<p className="mb-2" style={{ fontSize: 14, color: 'rgba(25,28,30,0.6)' }}>This will lock the order at the current agreed price:</p>
						<p className="mb-4" style={{ fontSize: 24, fontWeight: 700, color: '#191C1E', letterSpacing: '-0.02em' }}>₫{lastPrice?.toLocaleString('vi-VN')}/MT</p>
						<p className="p-3 rounded-lg mb-4" style={{ fontSize: 12, color: '#7A4F00', background: '#FFEFC6' }}>Once finalized, no further price changes can be made. Both parties will be notified.</p>
						<div className="flex gap-2">
							<button onClick={finalizeOrder} className="flex-1 py-2.5 text-white rounded-[6px] transition-all hover:brightness-105" style={{ background: 'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)', fontWeight: 600, fontSize: 13 }}>Confirm & Lock</button>
							<button onClick={() => setShowFinalize(false)} className="flex-1 py-2.5 rounded-[6px]" style={{ background: '#D5DAE3', color: '#191C1E', fontWeight: 500, fontSize: 13 }}>Cancel</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}