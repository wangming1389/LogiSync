'use client';
import { ChevronLeft, Eye, FileText, Save, Send } from 'lucide-react';
import { useState } from 'react';
import { rfqList } from '@/app/data/mockData';

const statusColor: Record<string, { bg: string; color: string }> = {
	pending: { bg: '#FFEFC6', color: '#7A4F00' },
	draft_saved: { bg: '#D3E4F5', color: '#0F4C8A' },
	submitted: { bg: '#C8F0D8', color: '#1B6B3A' },
};

export default function SupplierRFQ() {
	const [rfqs, setRfqs] = useState(rfqList);
	const [selected, setSelected] = useState<string | null>(null);
	const [form, setForm] = useState({ price: '', terms: '', notes: '' });
	const [submitted, setSubmitted] = useState(false);

	const detail = rfqs.find((r) => r.id === selected);

	function saveAsDraft() {
		setRfqs((rs) =>
			rs.map((r) => (r.id === selected ? { ...r, status: 'draft_saved' } : r)),
		);
	}
	function submitRFQ() {
		setRfqs((rs) =>
			rs.map((r) => (r.id === selected ? { ...r, status: 'submitted' } : r)),
		);
		setSubmitted(true);
		setTimeout(() => {
			setSubmitted(false);
			setSelected(null);
		}, 1500);
	}

	if (selected && detail) {
		return (
			<div className="p-6 max-w-2xl mx-auto">
				<button
					onClick={() => setSelected(null)}
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
							<h2 style={{ color: '#191C1E' }}>Respond to {detail.id}</h2>
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
						{(() => {
							const s = statusColor[detail.status] ?? {
								bg: '#E0E4EB',
								color: '#191C1E',
							};
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
									{detail.status.replace('_', ' ').toUpperCase()}
								</span>
							);
						})()}
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
						].map(([k, v]) => (
							<div key={k}>
								<p
									style={{
										fontSize: 11,
										fontWeight: 500,
										letterSpacing: '0.05em',
										textTransform: 'uppercase',
										color: 'rgba(25,28,30,0.55)',
									}}
								>
									{k}
								</p>
								<p style={{ fontSize: 14, color: '#191C1E', marginTop: 2 }}>
									{v}
								</p>
							</div>
						))}
					</div>
					{submitted && (
						<div
							className="flex items-center gap-2 p-3 rounded-lg mb-4"
							style={{ background: '#C8F0D8', fontSize: 13, color: '#1B6B3A' }}
						>
							<Send className="w-4 h-4" /> Quotation submitted successfully!
						</div>
					)}
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
								QUOTED PRICE (₫/{detail.unit}) *
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
								PAYMENT TERMS
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
								ADDITIONAL NOTES
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
							onClick={saveAsDraft}
							className="flex items-center gap-2 px-4 py-2.5 rounded-[6px]"
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
							onClick={submitRFQ}
							disabled={!form.price}
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
				<p style={{ fontSize: 13, color: 'rgba(25,28,30,0.55)', marginTop: 2 }}>
					{rfqs.filter((r) => r.status === 'pending').length} RFQ(s) awaiting
					response
				</p>
			</div>
			<div className="space-y-3">
				{rfqs.map((r) => {
					const s = statusColor[r.status] ?? {
						bg: '#E0E4EB',
						color: '#191C1E',
					};
					return (
						<div
							key={r.id}
							onClick={() => setSelected(r.id)}
							className="rounded-xl p-5 cursor-pointer transition-all"
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
											{r.id} — {r.product}
										</p>
										<p
											style={{
												fontSize: 12,
												color: 'rgba(25,28,30,0.5)',
												marginTop: 2,
											}}
										>
											Buyer: {r.buyer} · {r.qty} {r.unit}
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
									{r.status.replace('_', ' ').toUpperCase()}
								</span>
							</div>
							<div
								className="flex items-center gap-4 mt-2"
								style={{ fontSize: 12, color: 'rgba(25,28,30,0.55)' }}
							>
								<span>Received: {r.receivedAt}</span>
								<span>·</span>
								<span>Delivery: {r.deliveryDate}</span>
								{r.notes && (
									<>
										<span>·</span>
										<span className="truncate">{r.notes}</span>
									</>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
