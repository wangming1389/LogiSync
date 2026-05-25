'use client';
import {
	AlertTriangle,
	CheckCircle,
	FileCheck,
	Plus,
	Receipt,
	X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
	threeWayMatchingSupplier,
	warehouseReceipts,
} from '@/app/data/mockData';
import { isDemoWorkspaceSession } from '@/lib/workspace-mode';

export default function SupplierFinanceClient() {
	const [demoEnabled, setDemoEnabled] = useState(false);
	const [tab, setTab] = useState<'3way' | 'receipts' | 'payments'>('3way');
	const [matching, setMatching] = useState(threeWayMatchingSupplier);
	const [receipts, setReceipts] = useState(warehouseReceipts);
	const [discrepancyModal, setDiscrepancyModal] = useState<string | null>(null);
	const [justification, setJustification] = useState('');
	const [showReceiptForm, setShowReceiptForm] = useState(false);

	useEffect(() => {
		if (isDemoWorkspaceSession()) setDemoEnabled(true);
	}, []);

	if (!demoEnabled) {
		return (
			<div className="p-6">
				<h1 style={{ color: '#191C1E' }}>Finance Management</h1>
				<p className="mt-2 text-sm text-slate-500">
					No sample finance data is loaded for newly created workspaces.
				</p>
			</div>
		);
	}

	function confirmMatching(id: string) {
		setMatching((ms) =>
			ms.map((m) => (m.id === id ? { ...m, status: 'matched' } : m)),
		);
		setDiscrepancyModal(null);
		setJustification('');
	}

	return (
		<div className="p-6">
			<h1 className="mb-6" style={{ color: '#191C1E' }}>
				Finance Management
			</h1>

			<div
				className="flex gap-1 p-1 rounded-lg mb-6 w-fit"
				style={{ background: '#E0E4EB' }}
			>
				{[
					{ key: '3way', label: '3-Way Matching' },
					{ key: 'receipts', label: 'Warehouse Receipts' },
					{ key: 'payments', label: 'Payment Records' },
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

			{tab === '3way' && (
				<div className="space-y-4">
					<div
						className="flex items-center gap-2 p-3 rounded-lg"
						style={{ background: '#D3E4F5', fontSize: 13, color: '#0F4C8A' }}
					>
						<FileCheck className="w-4 h-4" />
						Compare PO · Goods Receipt · Invoice side-by-side. Highlight
						discrepancies and confirm matching.
					</div>
					{matching.map((m) => (
						<div
							key={m.id}
							className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
						>
							<div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
								<div>
									<p className="text-gray-900">
										Order: {m.orderId} — {m.buyer}
									</p>
								</div>
								<div className="flex items-center gap-2">
									{m.status === 'matched' ? (
										<span className="flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
											<CheckCircle className="w-3 h-3" />
											Matched
										</span>
									) : (
										<span className="flex items-center gap-1 text-xs text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
											<AlertTriangle className="w-3 h-3" />
											Discrepancy
										</span>
									)}
								</div>
							</div>
							<div className="grid grid-cols-3 divide-x divide-gray-200">
								{[
									{
										label: 'Purchase Order',
										id: m.po.id,
										items: [
											['Qty', `${m.po.qty} MT`],
											[
												'Unit Price',
												`₫${m.po.unitPrice.toLocaleString('vi-VN')}`,
											],
											['Total', `₫${m.po.total.toLocaleString('vi-VN')}`],
										],
									},
									{
										label: 'Goods Receipt',
										id: m.receipt.id,
										items: [
											['Qty Received', `${m.receipt.qty} MT`],
											['Date', m.receipt.receivedDate],
											[
												'Status',
												m.receipt.qty === m.po.qty ? '✓ Match' : '⚠ Short',
											],
										],
									},
									{
										label: 'Invoice',
										id: m.invoice.id,
										items: [
											[
												'Invoice Total',
												`₫${m.invoice.total.toLocaleString('vi-VN')}`,
											],
											['Due Date', m.invoice.dueDate],
											[
												'Match',
												m.invoice.total === m.po.total
													? '✓ Match'
													: '⚠ Differs',
											],
										],
									},
								].map((col) => (
									<div
										key={col.label}
										className={`p-4 ${col.label === 'Goods Receipt' && m.receipt.qty !== m.po.qty ? 'bg-red-50' : ''}`}
									>
										<p className="text-xs text-gray-500 mb-2">{col.label}</p>
										<p className="text-xs font-mono text-blue-700 mb-2">
											{col.id}
										</p>
										{col.items.map(([k, v]) => (
											<div
												key={k}
												className="flex justify-between text-xs mb-1"
											>
												<span className="text-gray-500">{k}</span>
												<span
													className={`${v?.toString().includes('⚠') ? 'text-red-600' : v?.toString().includes('✓') ? 'text-green-600' : 'text-gray-900'}`}
												>
													{v}
												</span>
											</div>
										))}
									</div>
								))}
							</div>
							{m.status === 'discrepancy' && (
								<div className="px-5 py-3 bg-red-50 border-t border-red-200 flex items-center justify-between">
									<p className="text-sm text-red-600">
										Quantity discrepancy detected: PO {m.po.qty} MT vs Received{' '}
										{m.receipt.qty} MT
									</p>
									<button
										onClick={() => setDiscrepancyModal(m.id)}
										className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700"
									>
										Submit Justification & Confirm
									</button>
								</div>
							)}
							{m.status === 'matched' && (
								<div className="px-5 py-3 bg-green-50 border-t border-green-200 flex items-center justify-between">
									<p className="text-sm text-green-600">
										All documents match. Ready for payment processing.
									</p>
									<button className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700">
										Confirm Matching
									</button>
								</div>
							)}
						</div>
					))}
				</div>
			)}

			{tab === 'receipts' && (
				<div>
					<div className="flex justify-end mb-4">
						<button
							onClick={() => setShowReceiptForm(true)}
							className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
						>
							<Plus className="w-4 h-4" /> Issue Receipt
						</button>
					</div>
					<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
						<table className="w-full text-sm">
							<thead className="bg-gray-50 border-b border-gray-200">
								<tr>
									{[
										'Receipt ID',
										'Product',
										'Qty',
										'Warehouse',
										'Issued',
										'Expiry',
										'Status',
										'Linked Order',
									].map((h) => (
										<th
											key={h}
											className="text-left px-4 py-3 text-xs text-gray-500 uppercase"
										>
											{h}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{receipts.map((r, i) => (
									<tr
										key={r.id}
										className={`border-b border-gray-100 hover:bg-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}
									>
										<td className="px-4 py-3 font-mono text-xs text-blue-700">
											{r.id}
										</td>
										<td className="px-4 py-3 text-gray-900">{r.product}</td>
										<td className="px-4 py-3 text-gray-600">
											{r.qty} {r.unit}
										</td>
										<td className="px-4 py-3 text-gray-600">{r.warehouse}</td>
										<td className="px-4 py-3 text-gray-500 text-xs">
											{r.issueDate}
										</td>
										<td className="px-4 py-3 text-gray-500 text-xs">
											{r.expiryDate}
										</td>
										<td className="px-4 py-3">
											<span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
												{r.status}
											</span>
										</td>
										<td className="px-4 py-3 text-xs text-blue-600">
											{r.linkedOrder}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{tab === 'payments' && (
				<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-gray-900">Payment Receipts</h2>
						<button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
							<Receipt className="w-4 h-4" /> Record Payment
						</button>
					</div>
					<div className="space-y-3">
						{[
							{
								id: 'PAY001',
								from: 'Blue Ocean Trading',
								amount: 1120000000,
								orderId: 'ORD002',
								date: '2026-04-13',
								method: 'Bank Transfer',
								status: 'received',
							},
							{
								id: 'PAY002',
								from: 'Northern Buyers Corp',
								amount: 312500000,
								orderId: 'ORD001',
								date: '2026-04-10',
								method: 'Bank Transfer',
								status: 'received',
							},
						].map((p) => (
							<div
								key={p.id}
								className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
							>
								<div>
									<p className="text-sm text-gray-900">
										{p.id} — {p.from}
									</p>
									<p className="text-xs text-gray-500">
										Order: {p.orderId} · {p.date} · {p.method}
									</p>
								</div>
								<div className="text-right">
									<p className="text-gray-900">
										₫{p.amount.toLocaleString('vi-VN')}
									</p>
									<span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
										{p.status}
									</span>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Discrepancy Modal */}
			{discrepancyModal && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg text-gray-900">
								Discrepancy Justification
							</h3>
							<button onClick={() => setDiscrepancyModal(null)}>
								<X className="w-5 h-5 text-gray-400" />
							</button>
						</div>
						<p className="text-sm text-gray-500 mb-3">
							Explain the reason for the discrepancy between documents:
						</p>
						<textarea
							value={justification}
							onChange={(e) => setJustification(e.target.value)}
							rows={4}
							placeholder="e.g. 2 MT lost due to transit spillage, accepted by buyer at delivery..."
							className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
						/>
						<div className="flex gap-2 mt-4">
							<button
								onClick={() => confirmMatching(discrepancyModal)}
								disabled={!justification}
								className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-40"
							>
								Confirm Matching with Exception
							</button>
							<button
								onClick={() => setDiscrepancyModal(null)}
								className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-600 text-sm"
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
