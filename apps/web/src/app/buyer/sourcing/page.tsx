'use client';
import {
	ArrowRight,
	CheckCircle,
	Filter,
	Plus,
	Search,
	Send,
	ShoppingCart,
	SortAsc,
	Star,
	X,
} from 'lucide-react';
import { useState } from 'react';
import {
	buyerProducts,
	buyerRFQList,
	quotationComparisons,
} from '@/app/data/mockData';

export default function BuyerSourcing() {
	const [tab, setTab] = useState<'search' | 'rfq' | 'compare'>('search');
	const [search, setSearch] = useState('');
	const [filterCat, setFilterCat] = useState('All');
	const [cart, setCart] = useState<string[]>([]);
	const [rfqDraft, setRfqDraft] = useState(buyerRFQList[1]); // draft RFQ
	const [sortBy, setSortBy] = useState<'price' | 'score'>('score');
	const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
	const [submitted, setSubmitted] = useState(false);

	const cats = ['All', 'Rice', 'Grain', 'Legume', 'Nut'];
	const filtered = buyerProducts
		.filter(
			(p) =>
				(filterCat === 'All' || p.category === filterCat) &&
				(p.name.toLowerCase().includes(search.toLowerCase()) ||
					p.supplier.toLowerCase().includes(search.toLowerCase())),
		)
		.sort((a, b) =>
			sortBy === 'score'
				? b.supplierScore - a.supplierScore
				: a.basePrice - b.basePrice,
		);

	const comparison = quotationComparisons[0].quotations;

	function addToRFQ(id: string) {
		if (!cart.includes(id)) setCart([...cart, id]);
	}

	function submitRFQ() {
		setSubmitted(true);
		setTimeout(() => {
			setSubmitted(false);
			setTab('compare');
		}, 1500);
	}

	function confirmSupplier() {
		setSelectedSupplier(null);
	}

	return (
		<div className="p-6">
			<h1 className="mb-6" style={{ color: '#191C1E' }}>
				Sourcing
			</h1>

			<div
				className="flex gap-1 p-1 rounded-lg mb-6 flex-wrap"
				style={{ background: '#E0E4EB' }}
			>
				{[
					{
						key: 'search',
						label: `Product Search ${cart.length > 0 ? `(${cart.length} in RFQ)` : ''}`,
					},
					{ key: 'rfq', label: 'Draft RFQ' },
					{ key: 'compare', label: 'Compare Quotations' },
				].map((t) => (
					<button
						key={t.key}
						onClick={() => setTab(t.key as any)}
						className="px-4 py-2 rounded-md transition-all"
						style={{
							background: tab === t.key ? '#0F4C8A' : 'transparent',
							color: tab === t.key ? '#FFFFFF' : 'rgba(25,28,30,0.6)',
							fontWeight: tab === t.key ? 600 : 400,
							fontSize: 13,
						}}
					>
						{t.label}
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
						{cats.map((c) => (
							<button
								key={c}
								onClick={() => setFilterCat(c)}
								className="px-3 py-2 rounded-[6px] transition-all"
								style={{
									background: filterCat === c ? '#0F4C8A' : '#E0E4EB',
									color: filterCat === c ? '#FFFFFF' : 'rgba(25,28,30,0.65)',
									fontSize: 13,
									fontWeight: filterCat === c ? 600 : 400,
								}}
							>
								{c}
							</button>
						))}
						<select
							value={sortBy}
							onChange={(e) => setSortBy(e.target.value as any)}
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
						{filtered.map((p) => (
							<div
								key={p.id}
								className="rounded-xl p-5 transition-all"
								style={{
									background: '#FFFFFF',
									boxShadow: '0px 8px 24px rgba(15,76,138,0.08)',
								}}
								onMouseEnter={(e) =>
									((e.currentTarget as HTMLDivElement).style.boxShadow =
										'0px 12px 32px rgba(15,76,138,0.14)')
								}
								onMouseLeave={(e) =>
									((e.currentTarget as HTMLDivElement).style.boxShadow =
										'0px 8px 24px rgba(15,76,138,0.08)')
								}
							>
								<div className="flex items-start justify-between mb-3">
									<div>
										<p
											style={{
												fontSize: 15,
												fontWeight: 600,
												color: '#191C1E',
											}}
										>
											{p.name}
										</p>
										<p
											style={{
												fontSize: 12,
												color: 'rgba(25,28,30,0.55)',
												marginTop: 2,
											}}
										>
											{p.supplier}
										</p>
									</div>
									<div
										className="flex items-center gap-1 px-2 py-0.5 rounded-full"
										style={{ background: '#FFEFC6' }}
									>
										<Star className="w-3 h-3" style={{ color: '#7A4F00' }} />
										<span
											style={{
												fontSize: 12,
												color: '#7A4F00',
												fontWeight: 500,
											}}
										>
											{p.supplierScore}
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
									{p.category.toUpperCase()}
								</span>
								<div className="mt-3 flex items-center justify-between">
									<div>
										<p
											style={{
												fontSize: 15,
												fontWeight: 600,
												color: '#0F4C8A',
											}}
										>
											₫{p.basePrice.toLocaleString('vi-VN')}
										</p>
										<p style={{ fontSize: 12, color: 'rgba(25,28,30,0.5)' }}>
											/{p.unit} · Min {p.minQty} {p.unit}
										</p>
									</div>
									<button
										onClick={() => addToRFQ(p.id)}
										className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-white transition-all"
										style={{
											background: cart.includes(p.id)
												? '#C8F0D8'
												: 'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)',
											color: cart.includes(p.id) ? '#1B6B3A' : '#FFFFFF',
											fontSize: 12,
											fontWeight: 500,
										}}
									>
										{cart.includes(p.id) ? (
											<>
												<CheckCircle className="w-3.5 h-3.5" />
												Added
											</>
										) : (
											<>
												<Plus className="w-3.5 h-3.5" />
												ADD TO RFQ
											</>
										)}
									</button>
								</div>
							</div>
						))}
					</div>
					{cart.length > 0 && (
						<div
							className="fixed bottom-6 right-6 px-5 py-3 rounded-xl text-white flex items-center gap-2 cursor-pointer transition-all hover:brightness-105"
							style={{
								background: 'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)',
								boxShadow: '0px 8px 24px rgba(15,76,138,0.25)',
							}}
							onClick={() => setTab('rfq')}
						>
							<ShoppingCart className="w-5 h-5" />
							{cart.length} item(s) in RFQ draft
							<ArrowRight className="w-4 h-4" />
						</div>
					)}
				</>
			)}

			{tab === 'rfq' && (
				<div
					className="max-w-2xl mx-auto rounded-xl p-6"
					style={{
						background: '#FFFFFF',
						boxShadow: '0px 8px 24px rgba(15,76,138,0.08)',
					}}
				>
					<h4 className="mb-5" style={{ color: '#191C1E' }}>
						Draft RFQ
					</h4>
					{submitted && (
						<div
							className="flex items-center gap-2 p-3 rounded-lg mb-4"
							style={{ background: '#C8F0D8', fontSize: 13, color: '#1B6B3A' }}
						>
							<CheckCircle className="w-4 h-4" /> RFQ submitted to suppliers!
						</div>
					)}
					<div className="space-y-3 mb-5">
						{buyerProducts
							.filter((p) => cart.includes(p.id))
							.map((p) => (
								<div
									key={p.id}
									className="flex items-center gap-3 p-3 rounded-lg"
									style={{ background: '#F2F4F7' }}
								>
									<div className="flex-1">
										<p
											style={{
												fontSize: 14,
												fontWeight: 500,
												color: '#191C1E',
											}}
										>
											{p.name}
										</p>
										<p style={{ fontSize: 12, color: 'rgba(25,28,30,0.5)' }}>
											{p.supplier}
										</p>
									</div>
									<input
										type="number"
										placeholder="Qty"
										defaultValue={p.minQty}
										className="w-20 px-2 h-8 rounded-t-[6px] focus:outline-none"
										style={{
											background: '#D5DAE3',
											borderBottom: '2px solid #00559F',
											color: '#191C1E',
											fontSize: 13,
										}}
									/>
									<span style={{ fontSize: 12, color: 'rgba(25,28,30,0.55)' }}>
										{p.unit}
									</span>
									<button
										onClick={() => setCart(cart.filter((id) => id !== p.id))}
										style={{ color: 'rgba(25,28,30,0.4)' }}
									>
										<X className="w-4 h-4" />
									</button>
								</div>
							))}
						{cart.length === 0 && (
							<p
								className="text-center py-4"
								style={{ fontSize: 14, color: 'rgba(25,28,30,0.4)' }}
							>
								No items added. Go to Product Search.
							</p>
						)}
					</div>
					{cart.length > 0 && (
						<>
							<div className="mb-4">
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
									REQUIRED DELIVERY DATE
								</label>
								<input
									type="date"
									defaultValue="2026-05-01"
									className="px-3 h-10 rounded-t-[6px] focus:outline-none"
									style={{
										background: '#D5DAE3',
										borderBottom: '2px solid #00559F',
										color: '#191C1E',
										fontSize: 13,
									}}
								/>
							</div>
							<div className="mb-4">
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
									DELIVERY NOTES
								</label>
								<textarea
									rows={2}
									placeholder="Spec, packaging, incoterms..."
									className="w-full px-3 py-2 rounded-t-[6px] focus:outline-none resize-none"
									style={{
										background: '#D5DAE3',
										borderBottom: '2px solid #00559F',
										color: '#191C1E',
										fontSize: 14,
									}}
								/>
							</div>
							<div className="flex gap-3">
								<button
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
									onClick={submitRFQ}
									className="flex items-center gap-2 px-5 py-2.5 text-white rounded-[6px] transition-all hover:brightness-105"
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
				</div>
			)}

			{tab === 'compare' && (
				<div>
					<h4 className="mb-4" style={{ color: '#191C1E' }}>
						Quotation Comparison — RFQ001 (ST25 Rice, 100 MT)
					</h4>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
						{comparison.map((q) => (
							<div
								key={q.id}
								className="rounded-xl p-5 cursor-pointer transition-all"
								style={{
									background: selectedSupplier === q.id ? '#D3E4F5' : '#FFFFFF',
									boxShadow: '0px 8px 24px rgba(15,76,138,0.08)',
									borderLeft:
										selectedSupplier === q.id
											? '4px solid #0F4C8A'
											: '4px solid transparent',
								}}
								onClick={() => setSelectedSupplier(q.id)}
							>
								<div className="flex items-start justify-between mb-3">
									<div>
										<p
											style={{
												fontSize: 15,
												fontWeight: 600,
												color: '#191C1E',
											}}
										>
											{q.supplier}
										</p>
										<div className="flex items-center gap-1 mt-1">
											<Star
												className="w-3.5 h-3.5"
												style={{ color: '#7A4F00' }}
											/>
											<span
												style={{
													fontSize: 13,
													color: q.score >= 90 ? '#1B6B3A' : '#1A6EC4',
													fontWeight: 500,
												}}
											>
												Score: {q.score}
											</span>
										</div>
									</div>
									{selectedSupplier === q.id && (
										<CheckCircle
											className="w-5 h-5"
											style={{ color: '#0F4C8A' }}
										/>
									)}
								</div>
								<div className="grid grid-cols-2 gap-2">
									{[
										['UNIT PRICE', `₫${q.unitPrice.toLocaleString('vi-VN')}`],
										['TOTAL', `₫${q.total.toLocaleString('vi-VN')}`],
										['DELIVERY', `${q.deliveryDays} days`],
										['PAYMENT', q.terms],
										['VALID UNTIL', q.validity],
										['NOTES', q.notes],
									].map(([k, v]) => (
										<div
											key={k}
											className="p-2 rounded-lg"
											style={{ background: '#F2F4F7' }}
										>
											<p
												style={{
													fontSize: 10,
													fontWeight: 500,
													letterSpacing: '0.05em',
													textTransform: 'uppercase',
													color: 'rgba(25,28,30,0.55)',
												}}
											>
												{k}
											</p>
											<p
												style={{ fontSize: 13, color: '#191C1E', marginTop: 2 }}
											>
												{v}
											</p>
										</div>
									))}
								</div>
							</div>
						))}
					</div>
					<button
						disabled={!selectedSupplier}
						onClick={confirmSupplier}
						className="flex items-center gap-2 px-5 py-2.5 text-white rounded-[6px] disabled:opacity-40 transition-all hover:brightness-105"
						style={{
							background: 'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)',
							fontWeight: 600,
							fontSize: 12,
							letterSpacing: '0.05em',
						}}
					>
						<CheckCircle className="w-4 h-4" /> CONFIRM SUPPLIER SELECTION
					</button>
				</div>
			)}
		</div>
	);
}
