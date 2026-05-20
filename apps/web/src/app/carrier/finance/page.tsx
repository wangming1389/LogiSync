'use client';
import {
	AlertTriangle,
	BarChart2,
	CheckCircle,
	Download,
	FileText,
	TrendingUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import { freightInvoices } from '@/app/data/mockData';
import { isDemoWorkspaceSession } from '@/lib/workspace-mode';

const revenueData = [
	{ month: 'Jan', revenue: 420, onTime: 93, utilization: 78 },
	{ month: 'Feb', revenue: 380, onTime: 91, utilization: 74 },
	{ month: 'Mar', revenue: 510, onTime: 95, utilization: 82 },
	{ month: 'Apr', revenue: 485, onTime: 94, utilization: 80 },
];

export default function CarrierFinanceReports() {
	const [demoEnabled, setDemoEnabled] = useState(false);
	const [tab, setTab] = useState<'invoices' | 'reports'>('invoices');
	const [invoices, setInvoices] = useState(freightInvoices);
	const [confirmModal, setConfirmModal] = useState<string | null>(null);
	const [finalizedId, setFinalizedId] = useState<string | null>(null);

	useEffect(() => {
		if (isDemoWorkspaceSession()) setDemoEnabled(true);
	}, []);

	if (!demoEnabled) {
		return (
			<div className="p-6">
				<h1 style={{ color: '#191C1E' }}>Finance & Reports</h1>
				<p className="mt-2 text-sm text-slate-500">
					No sample finance data is loaded for newly created workspaces.
				</p>
			</div>
		);
	}

	function finalizeInvoice(id: string) {
		setInvoices((invs) =>
			invs.map((inv) =>
				inv.id === id ? { ...inv, status: 'finalized' } : inv,
			),
		);
		setFinalizedId(id);
		setConfirmModal(null);
	}

	return (
		<div className="p-6">
			<h1 className="mb-6" style={{ color: '#191C1E' }}>
				Finance & Reports
			</h1>

			<div
				className="flex gap-1 p-1 rounded-lg mb-6 w-fit"
				style={{ background: '#E0E4EB' }}
			>
				{[
					{ key: 'invoices', label: 'Freight Invoices' },
					{ key: 'reports', label: 'Executive Reports' },
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

			{tab === 'invoices' && (
				<div className="space-y-4 max-w-2xl mx-auto">
					{finalizedId && (
						<div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
							<CheckCircle className="w-4 h-4" /> Invoice {finalizedId}{' '}
							finalized and sent to buyer.
						</div>
					)}
					{invoices.map((inv) => (
						<div
							key={inv.id}
							className="bg-white rounded-xl border border-gray-200 shadow-sm p-5"
						>
							<div className="flex items-start justify-between mb-3">
								<div className="flex items-start gap-3">
									<div
										className={`w-9 h-9 rounded-lg flex items-center justify-center ${inv.status === 'finalized' ? 'bg-green-100' : 'bg-yellow-100'}`}
									>
										<FileText
											className={`w-5 h-5 ${inv.status === 'finalized' ? 'text-green-600' : 'text-yellow-600'}`}
										/>
									</div>
									<div>
										<p className="text-gray-900">{inv.id}</p>
										<p className="text-xs text-gray-500">
											Buyer: {inv.buyer} · Shipment: {inv.shipmentId}
										</p>
									</div>
								</div>
								<span
									className={`text-xs px-2 py-0.5 rounded-full ${inv.status === 'finalized' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
								>
									{inv.status}
								</span>
							</div>
							<div className="grid grid-cols-3 gap-3 mb-3 text-xs">
								<div className="bg-gray-50 rounded-lg p-2">
									<p className="text-gray-400">Amount</p>
									<p className="text-gray-900">
										₫{inv.amount.toLocaleString('vi-VN')}
									</p>
								</div>
								<div className="bg-gray-50 rounded-lg p-2">
									<p className="text-gray-400">Issued</p>
									<p className="text-gray-900">{inv.issuedAt}</p>
								</div>
								<div className="bg-gray-50 rounded-lg p-2">
									<p className="text-gray-400">Due Date</p>
									<p className="text-gray-900">{inv.dueDate}</p>
								</div>
							</div>
							{inv.status === 'draft' && (
								<div>
									<div className="flex items-start gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg mb-3 text-xs text-yellow-700">
										<AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
										Draft invoice — review before finalizing. Cannot be edited
										after finalization.
									</div>
									<button
										onClick={() => setConfirmModal(inv.id)}
										className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm"
									>
										Finalize Invoice
									</button>
								</div>
							)}
							{inv.status === 'finalized' && (
								<button className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
									<Download className="w-4 h-4" /> Download PDF
								</button>
							)}
						</div>
					))}
				</div>
			)}

			{tab === 'reports' && (
				<div className="space-y-5">
					{/* KPI Cards */}
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
						{[
							{
								label: 'Revenue (Apr)',
								value: '₫485M',
								change: '+12%',
								color: 'text-green-600',
							},
							{
								label: 'On-time Rate',
								value: '94%',
								change: '+1%',
								color: 'text-green-600',
							},
							{
								label: 'Fleet Utilization',
								value: '80%',
								change: '-2%',
								color: 'text-red-500',
							},
							{
								label: 'Active Shipments',
								value: '12',
								change: '+3',
								color: 'text-blue-600',
							},
						].map((k) => (
							<div
								key={k.label}
								className="bg-white rounded-xl border border-gray-200 shadow-sm p-4"
							>
								<p className="text-xs text-gray-500">{k.label}</p>
								<p className="text-2xl text-gray-900 mt-1">{k.value}</p>
								<p
									className={`text-xs mt-1 flex items-center gap-1 ${k.color}`}
								>
									<TrendingUp className="w-3 h-3" />
									{k.change} vs last month
								</p>
							</div>
						))}
					</div>

					{/* Revenue Chart */}
					<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-gray-900">Revenue Trend (₫M)</h2>
							<div className="flex gap-2">
								<button className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-600 hover:bg-gray-50 flex items-center gap-1">
									<Download className="w-3.5 h-3.5" /> Export XLSX
								</button>
								<button className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-600 hover:bg-gray-50 flex items-center gap-1">
									<Download className="w-3.5 h-3.5" /> Export PDF
								</button>
							</div>
						</div>
						<ResponsiveContainer width="100%" height={220}>
							<AreaChart data={revenueData}>
								<defs>
									<linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor="#F97316" stopOpacity={0.2} />
										<stop offset="95%" stopColor="#F97316" stopOpacity={0} />
									</linearGradient>
								</defs>
								<CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
								<XAxis dataKey="month" tick={{ fontSize: 11 }} />
								<YAxis tick={{ fontSize: 11 }} />
								<Tooltip />
								<Area
									type="monotone"
									dataKey="revenue"
									stroke="#F97316"
									fill="url(#rev)"
									name="Revenue (₫M)"
								/>
							</AreaChart>
						</ResponsiveContainer>
					</div>

					{/* On-time & Utilization */}
					<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
						<h2 className="text-gray-900 mb-4">
							On-time Rate & Fleet Utilization (%)
						</h2>
						<ResponsiveContainer width="100%" height={200}>
							<BarChart data={revenueData} barSize={25}>
								<CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
								<XAxis dataKey="month" tick={{ fontSize: 11 }} />
								<YAxis tick={{ fontSize: 11 }} domain={[60, 100]} />
								<Tooltip />
								<Bar
									dataKey="onTime"
									fill="#22C55E"
									name="On-time %"
									radius={[3, 3, 0, 0]}
								/>
								<Bar
									dataKey="utilization"
									fill="#3B82F6"
									name="Utilization %"
									radius={[3, 3, 0, 0]}
								/>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>
			)}

			{/* Finalize Confirm Modal */}
			{confirmModal && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
						<h3 className="text-lg text-gray-900 mb-3">Finalize Invoice</h3>
						<p className="text-sm text-gray-500 mb-6">
							Once finalized, the invoice cannot be edited. The buyer will be
							notified. If corrections are needed, an Adjustment Invoice must be
							issued.
						</p>
						<div className="flex gap-2">
							<button
								onClick={() => finalizeInvoice(confirmModal)}
								className="flex-1 py-2.5 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600"
							>
								Confirm Finalize
							</button>
							<button
								onClick={() => setConfirmModal(null)}
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
