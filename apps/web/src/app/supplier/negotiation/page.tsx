'use client';
import { Lock, Send, TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { negotiations } from '@/app/data/mockData';

const SHADOW = '0px 8px 24px rgba(15,76,138,0.08)';

export default function SupplierNegotiation() {
	const [negs, setNegs] = useState(negotiations);
	const [selected, setSelected] = useState(negotiations[0].id);
	const [newPrice, setNewPrice] = useState('');
	const [newNote, setNewNote] = useState('');
	const [finalized, setFinalized] = useState(false);
	const [showFinalize, setShowFinalize] = useState(false);

	const neg = negs.find((n) => n.id === selected)!;

	function submitRound() {
		if (!newPrice) return;
		setNegs((ns) =>
			ns.map((n) =>
				n.id === selected
					? {
							...n,
							rounds: [
								...n.rounds,
								{
									round: n.rounds.length + 1,
									by: 'Supplier',
									price: +newPrice,
									notes: newNote,
									timestamp: new Date().toLocaleString('vi-VN'),
								},
							],
						}
					: n,
			),
		);
		setNewPrice('');
		setNewNote('');
	}

	function finalizeOrder() {
		setNegs((ns) =>
			ns.map((n) => (n.id === selected ? { ...n, status: 'finalized' } : n)),
		);
		setShowFinalize(false);
		setFinalized(true);
	}

	const lastPrice = neg.rounds[neg.rounds.length - 1]?.price;

	return (
		<div className="p-6">
			<h1 className="mb-6" style={{ color: '#191C1E' }}>
				Price Negotiation
			</h1>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
				{/* Negotiation list */}
				<div
					className="rounded-xl p-4 lg:col-span-1"
					style={{ background: '#FFFFFF', boxShadow: SHADOW }}
				>
					<p
						style={{
							fontSize: 11,
							fontWeight: 500,
							letterSpacing: '0.05em',
							textTransform: 'uppercase',
							color: 'rgba(25,28,30,0.6)',
							marginBottom: 12,
						}}
					>
						ACTIVE NEGOTIATIONS
					</p>
					{negs.map((n) => (
						<button
							key={n.id}
							onClick={() => setSelected(n.id)}
							className="w-full text-left px-3 py-3 rounded-lg mb-2 transition-all"
							style={{
								background: selected === n.id ? '#D3E4F5' : '#F2F4F7',
								borderLeft:
									selected === n.id
										? '3px solid #0F4C8A'
										: '3px solid transparent',
							}}
						>
							<p style={{ fontSize: 14, fontWeight: 600, color: '#191C1E' }}>
								{n.id} — {n.product}
							</p>
							<p
								style={{
									fontSize: 12,
									color: 'rgba(25,28,30,0.55)',
									marginTop: 2,
								}}
							>
								Buyer: {n.buyer}
							</p>
							<span
								className="mt-1 inline-block px-2 py-0.5 rounded-full"
								style={{
									background: n.status === 'finalized' ? '#C8F0D8' : '#FFEFC6',
									color: n.status === 'finalized' ? '#1B6B3A' : '#7A4F00',
									fontSize: 11,
									fontWeight: 500,
									letterSpacing: '0.04em',
								}}
							>
								{n.status.toUpperCase()}
							</span>
						</button>
					))}
				</div>

				{/* Negotiation thread */}
				<div className="lg:col-span-2 space-y-4">
					<div
						className="rounded-xl p-5"
						style={{ background: '#FFFFFF', boxShadow: SHADOW }}
					>
						<div className="flex items-center justify-between mb-4">
							<div>
								<h4 style={{ color: '#191C1E' }}>{neg.product}</h4>
								<p
									style={{
										fontSize: 12,
										color: 'rgba(25,28,30,0.55)',
										marginTop: 2,
									}}
								>
									Buyer: {neg.buyer} · Order: {neg.orderId}
								</p>
							</div>
							{neg.status === 'open' && (
								<button
									onClick={() => setShowFinalize(true)}
									className="flex items-center gap-2 px-3 py-1.5 text-white rounded-[6px] transition-all hover:brightness-105"
									style={{
										background: '#191C1E',
										fontWeight: 500,
										fontSize: 12,
									}}
								>
									<Lock className="w-3.5 h-3.5" /> Finalize Order
								</button>
							)}
							{finalized && (
								<span
									className="px-3 py-1.5 rounded-full"
									style={{
										background: '#C8F0D8',
										color: '#1B6B3A',
										fontSize: 12,
									}}
								>
									Order Locked ✓
								</span>
							)}
						</div>

						{/* Rounds */}
						<div className="space-y-3 mb-5">
							{neg.rounds.map((r) => {
								const isSupplier = r.by === 'Supplier';
								const prevPrice = neg.rounds[r.round - 2]?.price;
								const diff = prevPrice ? r.price - prevPrice : 0;
								return (
									<div
										key={r.round}
										className={`flex ${isSupplier ? 'justify-end' : 'justify-start'}`}
									>
										<div
											className="max-w-[75%] p-4 rounded-xl"
											style={{
												background: isSupplier ? '#D3E4F5' : '#F2F4F7',
												borderLeft: isSupplier ? 'none' : '3px solid #0F4C8A',
												borderRight: isSupplier ? '3px solid #1A6EC4' : 'none',
											}}
										>
											<div className="flex items-center gap-2 mb-1">
												<span
													style={{ fontSize: 11, color: 'rgba(25,28,30,0.55)' }}
												>
													Round {r.round} — {r.by}
												</span>
												{prevPrice && (
													<span
														className="flex items-center gap-0.5"
														style={{
															fontSize: 11,
															color: diff > 0 ? '#1B6B3A' : '#BA1A1A',
														}}
													>
														{diff > 0 ? (
															<TrendingUp className="w-3 h-3" />
														) : (
															<TrendingDown className="w-3 h-3" />
														)}
														{diff > 0 ? '+' : ''}
														{(diff / 1000000).toFixed(1)}M
													</span>
												)}
											</div>
											<p
												style={{
													fontSize: 20,
													fontWeight: 700,
													color: '#191C1E',
													letterSpacing: '-0.01em',
												}}
											>
												₫{r.price.toLocaleString('vi-VN')}/MT
											</p>
											{r.notes && (
												<p
													style={{
														fontSize: 12,
														color: 'rgba(25,28,30,0.65)',
														marginTop: 4,
													}}
												>
													{r.notes}
												</p>
											)}
											<p
												style={{
													fontSize: 11,
													color: 'rgba(25,28,30,0.4)',
													marginTop: 4,
												}}
											>
												{r.timestamp}
											</p>
										</div>
									</div>
								);
							})}
						</div>

						{/* New round form */}
						{neg.status === 'open' && !finalized && (
							<div className="pt-4" style={{ borderTop: '1px solid #E0E4EB' }}>
								<p
									style={{
										fontSize: 11,
										fontWeight: 500,
										letterSpacing: '0.05em',
										textTransform: 'uppercase',
										color: 'rgba(25,28,30,0.6)',
										marginBottom: 12,
									}}
								>
									SUBMIT NEW PRICE OFFER
								</p>
								<div className="flex gap-3 mb-3">
									<div className="flex-1">
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
											NEW PRICE (₫/MT)
										</label>
										<input
											type="number"
											value={newPrice}
											onChange={(e) => setNewPrice(e.target.value)}
											placeholder="e.g. 75000000"
											className="w-full px-3 h-10 rounded-t-[6px] focus:outline-none"
											style={{
												background: '#D5DAE3',
												borderBottom: '2px solid #00559F',
												color: '#191C1E',
												fontSize: 14,
											}}
										/>
									</div>
								</div>
								<textarea
									value={newNote}
									onChange={(e) => setNewNote(e.target.value)}
									rows={2}
									placeholder="Notes for this round..."
									className="w-full px-3 py-2 rounded-t-[6px] focus:outline-none resize-none mb-3"
									style={{
										background: '#D5DAE3',
										borderBottom: '2px solid #00559F',
										color: '#191C1E',
										fontSize: 14,
									}}
								/>
								<button
									onClick={submitRound}
									disabled={!newPrice}
									className="flex items-center gap-2 px-4 py-2.5 text-white rounded-[6px] disabled:opacity-40 transition-all hover:brightness-105"
									style={{
										background:
											'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)',
										fontWeight: 600,
										fontSize: 12,
										letterSpacing: '0.05em',
									}}
								>
									<Send className="w-4 h-4" /> SUBMIT ROUND{' '}
									{neg.rounds.length + 1}
								</button>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Finalize confirm */}
			{showFinalize && (
				<div
					className="fixed inset-0 flex items-center justify-center z-50"
					style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
				>
					<div
						className="rounded-xl p-6 w-full max-w-sm"
						style={{
							background: 'rgba(255,255,255,0.92)',
							backdropFilter: 'blur(20px)',
							boxShadow: SHADOW,
						}}
					>
						<div className="flex items-center gap-3 mb-4">
							<div
								className="w-10 h-10 rounded-full flex items-center justify-center"
								style={{ background: '#E0E4EB' }}
							>
								<Lock className="w-5 h-5" style={{ color: '#191C1E' }} />
							</div>
							<h3 style={{ color: '#191C1E' }}>Finalize & Lock Order</h3>
						</div>
						<p
							className="mb-2"
							style={{ fontSize: 14, color: 'rgba(25,28,30,0.6)' }}
						>
							This will lock the order at the current agreed price:
						</p>
						<p
							className="mb-4"
							style={{
								fontSize: 24,
								fontWeight: 700,
								color: '#191C1E',
								letterSpacing: '-0.02em',
							}}
						>
							₫{lastPrice?.toLocaleString('vi-VN')}/MT
						</p>
						<p
							className="p-3 rounded-lg mb-4"
							style={{ fontSize: 12, color: '#7A4F00', background: '#FFEFC6' }}
						>
							Once finalized, no further price changes can be made. Both parties
							will be notified.
						</p>
						<div className="flex gap-2">
							<button
								onClick={finalizeOrder}
								className="flex-1 py-2.5 text-white rounded-[6px] transition-all hover:brightness-105"
								style={{
									background:
										'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)',
									fontWeight: 600,
									fontSize: 13,
								}}
							>
								Confirm & Lock
							</button>
							<button
								onClick={() => setShowFinalize(false)}
								className="flex-1 py-2.5 rounded-[6px]"
								style={{
									background: '#D5DAE3',
									color: '#191C1E',
									fontWeight: 500,
									fontSize: 13,
								}}
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
