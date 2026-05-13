'use client';
import {
	AlertTriangle,
	CheckCircle,
	DollarSign,
	Download,
	FileText,
	MapPin,
	Package,
	Send,
	Star,
	X,
} from 'lucide-react';
import { useState } from 'react';
import {
	buyerComplaints,
	buyerOrders,
	buyerThreeWayMatching,
	ePODData,
	freightQuotesBuyer,
} from '@/app/data/mockData';

const orderStatusColor: Record<string, string> = {
	confirmed: 'bg-blue-100 text-blue-700',
	in_transit: 'bg-orange-100 text-orange-700',
	delivered: 'bg-green-100 text-green-700',
	cancelled: 'bg-red-100 text-red-700',
};

export default function BuyerOrdersTracking() {
	const [tab, setTab] = useState<
		'orders' | 'logistics' | 'delivery' | 'finance' | 'disputes'
	>('orders');
	const [selectedFreight, setSelectedFreight] = useState<string | null>(null);
	const [confirmedCarrier, setConfirmedCarrier] = useState<string | null>(null);
	const [ePODAction, setEPODAction] = useState<'accepted' | 'disputed' | null>(
		null,
	);
	const [disputeModal, setDisputeModal] = useState<'escalate' | null>(null);
	const [escalateReason, setEscalateReason] = useState('');
	const [complaints, setComplaints] = useState(buyerComplaints);
	const [matching, setMatching] = useState(buyerThreeWayMatching);
	const [justification, setJustification] = useState('');
	const [showComplaintForm, setShowComplaintForm] = useState(false);
	const [compForm, setCompForm] = useState({
		type: 'Quality Issue',
		description: '',
		orderId: '',
	});
	const [filter, setFilter] = useState('All');

	const statusOptions = ['All', 'confirmed', 'in_transit', 'delivered'];
	const filteredOrders =
		filter === 'All'
			? buyerOrders
			: buyerOrders.filter((o) => o.status === filter);

	function confirmCarrier(id: string) {
		setConfirmedCarrier(id);
		setSelectedFreight(null);
	}

	function escalate(id: string) {
		setComplaints((cs) =>
			cs.map((c) => (c.id === id ? { ...c, status: 'escalated' } : c)),
		);
		setDisputeModal(null);
		setEscalateReason('');
	}

	function confirmPayment(id: string) {
		setMatching((ms) =>
			ms.map((m) => (m.id === id ? { ...m, status: 'matched' } : m)),
		);
	}

	return (
		<div className="p-6">
			<h1 className="text-2xl text-gray-900 mb-6">
				Orders, Tracking & Finance
			</h1>

			<div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-6 flex-wrap">
				{[
					{ key: 'orders', label: 'Orders' },
					{ key: 'logistics', label: 'Freight Quotes' },
					{ key: 'delivery', label: 'Delivery & e-POD' },
					{ key: 'finance', label: 'Finance & Payment' },
					{ key: 'disputes', label: 'Disputes' },
				].map((t) => (
					<button
						key={t.key}
						onClick={() => setTab(t.key as any)}
						className={`px-3 py-2 rounded-md text-sm transition-all ${tab === t.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
					>
						{t.label}
					</button>
				))}
			</div>

			{tab === 'orders' && (
				<>
					<div className="flex gap-2 mb-4 flex-wrap">
						{statusOptions.map((s) => (
							<button
								key={s}
								onClick={() => setFilter(s)}
								className={`px-3 py-1.5 rounded-full text-sm capitalize ${filter === s ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
							>
								{s}
							</button>
						))}
						<button className="ml-auto flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
							<Download className="w-4 h-4" /> Export
						</button>
					</div>
					<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
						<table className="w-full text-sm">
							<thead className="bg-gray-50 border-b border-gray-200">
								<tr>
									{[
										'Order ID',
										'Supplier',
										'Product',
										'Qty',
										'Value',
										'Status',
										'Delivery Date',
										'Tracking',
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
								{filteredOrders.map((o, i) => (
									<tr
										key={o.id}
										className={`border-b border-gray-100 hover:bg-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}
									>
										<td className="px-4 py-3 text-blue-600 font-mono text-xs">
											{o.id}
										</td>
										<td className="px-4 py-3 text-gray-900">{o.supplier}</td>
										<td className="px-4 py-3 text-gray-600">{o.product}</td>
										<td className="px-4 py-3 text-gray-600">
											{o.qty} {o.unit}
										</td>
										<td className="px-4 py-3 text-gray-900">
											₫{o.totalValue.toLocaleString('vi-VN')}
										</td>
										<td className="px-4 py-3">
											<span
												className={`text-xs px-2 py-0.5 rounded-full ${orderStatusColor[o.status]}`}
											>
												{o.status.replace('_', ' ')}
											</span>
										</td>
										<td className="px-4 py-3 text-gray-500 text-xs">
											{o.deliveryDate}
										</td>
										<td className="px-4 py-3 text-xs text-blue-600 font-mono">
											{o.tracking}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</>
			)}

			{tab === 'logistics' && (
				<div>
					{confirmedCarrier && (
						<div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg mb-4 text-sm text-green-700">
							<CheckCircle className="w-4 h-4" /> Carrier confirmed:{' '}
							{
								freightQuotesBuyer.find((q) => q.id === confirmedCarrier)
									?.carrier
							}
						</div>
					)}
					<h2 className="text-gray-900 mb-4">
						Freight Quotations — Shipment SHIP001
					</h2>
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
						{freightQuotesBuyer.map((q) => (
							<div
								key={q.id}
								className={`bg-white rounded-xl border-2 shadow-sm p-5 cursor-pointer transition-all ${selectedFreight === q.id ? 'border-red-500' : 'border-gray-200 hover:border-red-300'}`}
								onClick={() => setSelectedFreight(q.id)}
							>
								<div className="flex items-start justify-between mb-3">
									<p className="text-gray-900">{q.carrier}</p>
									<div className="flex items-center gap-1">
										<Star className="w-3.5 h-3.5 text-yellow-500" />
										<span className="text-sm text-gray-600">
											{q.carrierScore}
										</span>
									</div>
								</div>
								<div className="space-y-1 text-xs text-gray-600 mb-3">
									<div className="flex items-center gap-1">
										<MapPin className="w-3 h-3" />
										{q.route}
									</div>
									<div>{q.vehicleType}</div>
									<div>ETA: {q.eta}</div>
								</div>
								<p className="text-gray-900 mb-1">
									₫{q.price.toLocaleString('vi-VN')}
								</p>
								<p className="text-xs text-gray-500">{q.notes}</p>
								{selectedFreight === q.id && (
									<CheckCircle className="w-4 h-4 text-red-500 mt-2" />
								)}
							</div>
						))}
					</div>
					<button
						disabled={!selectedFreight}
						onClick={() => confirmCarrier(selectedFreight!)}
						className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm disabled:opacity-40"
					>
						<CheckCircle className="w-4 h-4" /> Confirm Carrier Selection
					</button>
				</div>
			)}

			{tab === 'delivery' && (
				<div className="max-w-2xl mx-auto space-y-5">
					<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
						<h2 className="text-gray-900 mb-4">Review e-POD — SHIP002</h2>
						<div className="grid grid-cols-2 gap-3 mb-4">
							{[
								['Driver', ePODData.driver],
								['Vehicle', ePODData.vehicle],
								['Cargo', ePODData.cargo],
								['Shipment', ePODData.shipmentId],
							].map(([k, v]) => (
								<div key={k} className="bg-gray-50 rounded-lg p-2">
									<p className="text-xs text-gray-400">{k}</p>
									<p className="text-sm text-gray-900">{v}</p>
								</div>
							))}
						</div>
						<div className="space-y-2 mb-5">
							{ePODData.steps.map((s, i) => (
								<div
									key={i}
									className={`flex items-center gap-3 p-3 rounded-lg ${s.completed ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}
								>
									<CheckCircle
										className={`w-4 h-4 ${s.completed ? 'text-green-500' : 'text-gray-300'}`}
									/>
									<div>
										<p className="text-sm text-gray-900">{s.name}</p>
										{s.timestamp && (
											<p className="text-xs text-gray-500">{s.timestamp}</p>
										)}
									</div>
								</div>
							))}
						</div>
						{!ePODAction && (
							<div className="flex gap-3">
								<button
									onClick={() => setEPODAction('accepted')}
									className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
								>
									<CheckCircle className="w-4 h-4" /> Accept & Confirm Goods
									Receipt
								</button>
								<button
									onClick={() => setEPODAction('disputed')}
									className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
								>
									<AlertTriangle className="w-4 h-4" /> Raise Dispute
								</button>
							</div>
						)}
						{ePODAction === 'accepted' && (
							<div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
								<CheckCircle className="w-4 h-4" /> Goods Receipt confirmed.
								Supplier and carrier notified.
							</div>
						)}
						{ePODAction === 'disputed' && (
							<div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
								<AlertTriangle className="w-4 h-4" /> Dispute raised. Go to
								Disputes tab to file complaint.
							</div>
						)}
					</div>
				</div>
			)}

			{tab === 'finance' && (
				<div className="space-y-4">
					<div className="text-sm text-gray-500 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2 mb-2">
						<FileText className="w-4 h-4 text-blue-600" /> Only matched or
						approved-with-exception orders are eligible for payment.
					</div>
					{matching.map((m) => {
						const isDiscrepancy = m.status === 'discrepancy';
						return (
							<div
								key={m.id}
								className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
							>
								<div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
									<p className="text-gray-900">Order {m.orderId}</p>
									<span
										className={`text-xs px-2 py-0.5 rounded-full ${m.status === 'matched' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
									>
										{m.status}
									</span>
								</div>
								<div className="grid grid-cols-4 divide-x divide-gray-200">
									{[
										{
											label: 'Purchase Order',
											items: [
												['PO ID', m.po.id],
												['Qty', `${m.po.qty} MT`],
												['Total', `₫${m.po.total.toLocaleString('vi-VN')}`],
											],
										},
										{
											label: 'Goods Receipt',
											items: [
												['GR ID', m.goodsReceipt.id],
												['Qty', `${m.goodsReceipt.qty} MT`],
												['Date', m.goodsReceipt.receivedDate],
											],
										},
										{
											label: 'Supplier Invoice',
											items: [
												['INV ID', m.invoice.id],
												[
													'Total',
													`₫${m.invoice.total.toLocaleString('vi-VN')}`,
												],
												['Due', m.invoice.dueDate],
											],
										},
										{
											label: 'Freight Invoice',
											items: [
												['FI ID', m.freightInvoice.id],
												[
													'Amount',
													`₫${m.freightInvoice.amount.toLocaleString('vi-VN')}`,
												],
												['Due', m.freightInvoice.dueDate],
											],
										},
									].map((col) => (
										<div
											key={col.label}
											className={`p-4 ${col.label === 'Goods Receipt' && isDiscrepancy ? 'bg-red-50' : ''}`}
										>
											<p className="text-xs text-gray-500 mb-2">{col.label}</p>
											{col.items.map(([k, v]) => (
												<div
													key={k}
													className="flex justify-between text-xs mb-1"
												>
													<span className="text-gray-400">{k}</span>
													<span className="text-gray-900 truncate">{v}</span>
												</div>
											))}
										</div>
									))}
								</div>
								<div className="px-5 py-3 border-t border-gray-200 flex items-center justify-between">
									{m.status === 'matched' ? (
										<>
											<p className="text-sm text-green-600">
												All documents matched. Ready for payment.
											</p>
											<button
												onClick={() => confirmPayment(m.id)}
												className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
											>
												<DollarSign className="w-4 h-4" /> Execute Payment
											</button>
										</>
									) : (
										<>
											<p className="text-sm text-red-600">
												Quantity discrepancy — submit justification to proceed.
											</p>
											<div className="flex gap-2">
												<input
													value={justification}
													onChange={(e) => setJustification(e.target.value)}
													placeholder="Justification..."
													className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
												/>
												<button
													disabled={!justification}
													onClick={() => confirmPayment(m.id)}
													className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm disabled:opacity-40"
												>
													Confirm with Exception
												</button>
											</div>
										</>
									)}
								</div>
							</div>
						);
					})}
				</div>
			)}

			{tab === 'disputes' && (
				<div className="max-w-2xl mx-auto space-y-4">
					<div className="flex justify-end">
						<button
							onClick={() => setShowComplaintForm(true)}
							className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
						>
							<FileText className="w-4 h-4" /> File Complaint
						</button>
					</div>
					{complaints.map((c) => (
						<div
							key={c.id}
							className="bg-white rounded-xl border border-gray-200 shadow-sm p-5"
						>
							<div className="flex items-start justify-between mb-3">
								<div>
									<p className="text-gray-900">{c.type}</p>
									<p className="text-xs text-gray-500 mt-0.5">
										Order: {c.orderId} · Filed: {c.filedAt}
									</p>
								</div>
								<span
									className={`text-xs px-2 py-0.5 rounded-full ${c.status === 'escalated' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}
								>
									{c.status}
								</span>
							</div>
							<p className="text-sm text-gray-600 mb-3">{c.description}</p>
							{c.evidence.length > 0 && (
								<div className="flex flex-wrap gap-2 mb-3">
									{c.evidence.map((e) => (
										<span
											key={e}
											className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded flex items-center gap-1"
										>
											<FileText className="w-3 h-3" /> {e}
										</span>
									))}
								</div>
							)}
							{c.status === 'in_progress' && (
								<button
									onClick={() => setDisputeModal('escalate')}
									className="flex items-center gap-1.5 text-sm text-red-600 border border-red-300 px-3 py-1.5 rounded-lg hover:bg-red-50"
								>
									<Send className="w-3.5 h-3.5" /> Escalate to Platform
								</button>
							)}
						</div>
					))}

					{/* File Complaint Modal */}
					{showComplaintForm && (
						<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
							<div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
								<div className="flex items-center justify-between mb-4">
									<h3 className="text-lg text-gray-900">File Complaint</h3>
									<button onClick={() => setShowComplaintForm(false)}>
										<X className="w-5 h-5 text-gray-400" />
									</button>
								</div>
								<div className="space-y-3">
									<div>
										<label className="block text-sm text-gray-700 mb-1">
											Order ID
										</label>
										<input
											value={compForm.orderId}
											onChange={(e) =>
												setCompForm({ ...compForm, orderId: e.target.value })
											}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
										/>
									</div>
									<div>
										<label className="block text-sm text-gray-700 mb-1">
											Complaint Type
										</label>
										<select
											value={compForm.type}
											onChange={(e) =>
												setCompForm({ ...compForm, type: e.target.value })
											}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none bg-white"
										>
											{[
												'Quality Issue',
												'Quantity Short',
												'Late Delivery',
												'Damaged Goods',
												'Invoice Error',
											].map((t) => (
												<option key={t}>{t}</option>
											))}
										</select>
									</div>
									<div>
										<label className="block text-sm text-gray-700 mb-1">
											Description
										</label>
										<textarea
											value={compForm.description}
											onChange={(e) =>
												setCompForm({
													...compForm,
													description: e.target.value,
												})
											}
											rows={3}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none resize-none"
										/>
									</div>
									<div>
										<label className="block text-sm text-gray-700 mb-1">
											Evidence (documents, photos)
										</label>
										<div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center text-sm text-gray-400 cursor-pointer hover:border-red-400">
											Upload files (≤10MB each)
										</div>
									</div>
								</div>
								<div className="flex gap-2 mt-4">
									<button
										onClick={() => {
											setComplaints([
												...complaints,
												{
												id: 'COMP' + crypto.randomUUID().slice(0, 8),
													orderId: compForm.orderId,
													type: compForm.type,
													description: compForm.description,
													evidence: [],
													status: 'in_progress',
													filedAt: '2026-04-13',
												},
											]);
											setShowComplaintForm(false);
										}}
										className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm"
									>
										Submit
									</button>
									<button
										onClick={() => setShowComplaintForm(false)}
										className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-600 text-sm"
									>
										Cancel
									</button>
								</div>
							</div>
						</div>
					)}

					{/* Escalate Modal */}
					{disputeModal === 'escalate' && (
						<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
							<div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
								<h3 className="text-lg text-gray-900 mb-3">Escalate Dispute</h3>
								<p className="text-sm text-gray-500 mb-3">
									Provide reason for escalation to Platform Admin:
								</p>
								<textarea
									value={escalateReason}
									onChange={(e) => setEscalateReason(e.target.value)}
									rows={3}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none resize-none"
								/>
								<div className="flex gap-2 mt-3">
									<button
										onClick={() => escalate(complaints[0].id)}
										disabled={!escalateReason}
										className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm disabled:opacity-40"
									>
										Escalate
									</button>
									<button
										onClick={() => setDisputeModal(null)}
										className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-600 text-sm"
									>
										Cancel
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
