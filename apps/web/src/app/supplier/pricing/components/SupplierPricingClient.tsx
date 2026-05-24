'use client';
import {
	AlertTriangle,
	CheckCircle,
	DollarSign,
	Edit2,
	Plus,
	Users,
	X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { creditLimits, priceLists } from '@/app/data/mockData';
import { isDemoWorkspaceSession } from '@/lib/workspace-mode';

export default function SupplierPricingClient() {
	const [demoEnabled, setDemoEnabled] = useState(false);
	const [tab, setTab] = useState<'pricing' | 'credit'>('pricing');
	const [lists, setLists] = useState(priceLists);
	const [credits, setCredits] = useState(creditLimits);
	const [bypassModal, setBypassModal] = useState<string | null>(null);
	const [bypassReason, setBypassReason] = useState('');
	const [showAddList, setShowAddList] = useState(false);

	useEffect(() => {
		if (isDemoWorkspaceSession()) {
			setDemoEnabled(true);
		}
	}, []);

	if (!demoEnabled) {
		return (
			<div className="p-6">
				<h1 style={{ color: '#191C1E' }}>Pricing & Credit Management</h1>
				<p className="mt-2 text-sm text-slate-500">
					No sample pricing data is loaded for newly created workspaces.
				</p>
			</div>
		);
	}

	function approveBypass(buyerId: string) {
		setBypassModal(null);
		setBypassReason('');
	}

	const statusColor: Record<string, { bg: string; color: string }> = {
		active: { bg: '#C8F0D8', color: '#1B6B3A' },
		draft: { bg: '#FFEFC6', color: '#7A4F00' },
		expired: { bg: '#E0E4EB', color: '#191C1E' },
	};

	return (
		<div className="p-6">
			<h1 className="mb-6" style={{ color: '#191C1E' }}>
				Pricing & Credit Management
			</h1>

			<div
				className="flex gap-1 p-1 rounded-lg mb-6 w-fit"
				style={{ background: '#E0E4EB' }}
			>
				{[
					{ key: 'pricing', label: 'Price Lists' },
					{ key: 'credit', label: 'Credit Limits' },
				].map((t) => (
					<button
						key={t.key}
						onClick={() => setTab(t.key as any)}
						className="px-5 py-2 rounded-md transition-all"
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

			{tab === 'pricing' && (
				<>
					<div className="flex justify-end mb-4">
						<button
							onClick={() => setShowAddList(true)}
							className="flex items-center gap-2 px-4 py-2.5 text-white rounded-[6px] transition-all hover:brightness-105"
							style={{
								background: 'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)',
								fontWeight: 600,
								fontSize: 12,
								letterSpacing: '0.06em',
							}}
						>
							<Plus className="w-4 h-4" /> CREATE PRICE LIST
						</button>
					</div>
					<div className="space-y-3">
						{lists.map((pl) => {
							const s = statusColor[pl.status] ?? {
								bg: '#E0E4EB',
								color: '#191C1E',
							};
							return (
								<div
									key={pl.id}
									className="rounded-xl p-5"
									style={{
										background: '#FFFFFF',
										boxShadow: '0px 8px 24px rgba(15,76,138,0.08)',
									}}
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
												{pl.name}
											</p>
											<p
												style={{
													fontSize: 12,
													color: 'rgba(25,28,30,0.55)',
													marginTop: 2,
												}}
											>
												Currency: {pl.currency} · {pl.effectiveFrom} →{' '}
												{pl.effectiveTo}
											</p>
										</div>
										<div className="flex items-center gap-2">
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
												{pl.status.toUpperCase()}
											</span>
											<button style={{ color: '#1A6EC4' }}>
												<Edit2 className="w-4 h-4" />
											</button>
										</div>
									</div>
									<div
										className="flex items-center gap-4"
										style={{ fontSize: 13 }}
									>
										<div
											className="flex items-center gap-1.5"
											style={{ color: 'rgba(25,28,30,0.65)' }}
										>
											<Users
												className="w-4 h-4"
												style={{ color: 'rgba(25,28,30,0.4)' }}
											/>
											{pl.assignedBuyers} buyer(s) assigned
										</div>
										<button className="text-blue-600 hover:underline text-sm">
											Manage Assignments
										</button>
									</div>
								</div>
							);
						})}
					</div>
				</>
			)}

			{tab === 'credit' && (
				<div className="space-y-3">
					{credits.map((c) => {
						const usedPct = (c.used / c.limit) * 100;
						const isNearLimit = usedPct > 90;
						return (
							<div
								key={c.buyerId}
								className={`bg-white rounded-xl border shadow-sm p-5 ${isNearLimit ? 'border-red-300' : 'border-gray-200'}`}
							>
								<div className="flex items-start justify-between mb-3">
									<div>
										<div className="flex items-center gap-2">
											<p className="text-gray-900">{c.buyer}</p>
											{isNearLimit && (
												<span className="flex items-center gap-1 text-xs text-red-600">
													<AlertTriangle className="w-3 h-3" />
													Near limit
												</span>
											)}
										</div>
										<p className="text-xs text-gray-500 mt-0.5">
											Last updated: {c.updatedAt}
										</p>
									</div>
									<div className="flex gap-2">
										<button className="text-sm text-blue-600 border border-blue-300 px-3 py-1 rounded-lg hover:bg-blue-50">
											Edit Limit
										</button>
										{isNearLimit && (
											<button
												onClick={() => setBypassModal(c.buyerId)}
												className="text-sm text-orange-600 border border-orange-300 px-3 py-1 rounded-lg hover:bg-orange-50"
											>
												Approve Bypass
											</button>
										)}
									</div>
								</div>
								<div className="flex items-center justify-between text-sm mb-2">
									<span className="text-gray-600">Credit Used</span>
									<span className="text-gray-900">
										₫{c.used.toLocaleString('vi-VN')} / ₫
										{c.limit.toLocaleString('vi-VN')}
									</span>
								</div>
								<div className="w-full bg-gray-200 rounded-full h-2">
									<div
										className={`h-2 rounded-full ${usedPct > 90 ? 'bg-red-500' : usedPct > 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
										style={{ width: `${Math.min(usedPct, 100)}%` }}
									/>
								</div>
								<p className="text-xs text-gray-400 mt-1">
									{usedPct.toFixed(1)}% utilized
								</p>
							</div>
						);
					})}
				</div>
			)}

			{/* Bypass Modal */}
			{bypassModal && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg text-gray-900">Approve Credit Bypass</h3>
							<button onClick={() => setBypassModal(null)}>
								<X className="w-5 h-5 text-gray-400" />
							</button>
						</div>
						<p className="text-sm text-gray-500 mb-3">
							This buyer has exceeded 90% of their credit limit. Provide reason
							for bypass approval:
						</p>
						<textarea
							value={bypassReason}
							onChange={(e) => setBypassReason(e.target.value)}
							rows={3}
							placeholder="Enter justification..."
							className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none resize-none mb-4"
						/>
						<div className="flex gap-2">
							<button
								onClick={() => approveBypass(bypassModal)}
								disabled={!bypassReason}
								className="flex-1 py-2.5 bg-orange-500 text-white rounded-lg text-sm disabled:opacity-40"
							>
								Approve Bypass
							</button>
							<button
								onClick={() => setBypassModal(null)}
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
