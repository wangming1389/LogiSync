'use client';

import { Star, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { carrierReputations, supplierReputations } from '@/app/data/mockData';
import { isDemoWorkspaceSession } from '@/lib/workspace-mode';

const SHADOW = '0px 8px 24px rgba(15,76,138,0.08)';

function ScoreBar({ score }: { score: number }) {
	const color =
		score >= 90
			? '#1B6B3A'
			: score >= 80
				? '#1A6EC4'
				: score >= 70
					? '#7A4F00'
					: '#BA1A1A';
	const bg =
		score >= 90
			? '#C8F0D8'
			: score >= 80
				? '#D3E4F5'
				: score >= 70
					? '#FFEFC6'
					: '#FFDAD6';
	return (
		<div className="flex items-center gap-2">
			<div
				className="flex-1 rounded-full h-2"
				style={{ background: '#E0E4EB' }}
			>
				<div
					className="h-2 rounded-full transition-all"
					style={{ width: `${score}%`, background: color }}
				/>
			</div>
			<span
				className="min-w-8 text-right"
				style={{ fontSize: 13, fontWeight: 600, color }}
			>
				{score}
			</span>
		</div>
	);
}

export default function PlatformAdminReputationClient() {
	const [demoEnabled, setDemoEnabled] = useState(false);
	const [tab, setTab] = useState<'supplier' | 'carrier'>('supplier');

	useEffect(() => {
		if (isDemoWorkspaceSession()) setDemoEnabled(true);
	}, []);

	if (!demoEnabled) {
		return (
			<div className="p-6">
				<h1 style={{ color: '#191C1E' }}>Reputation Score Viewer</h1>
				<p className="mt-2 text-sm text-slate-500">
					No sample reputation data is loaded for newly created workspaces.
				</p>
			</div>
		);
	}

	const TABS = [
		{ key: 'supplier' as const, label: 'Supplier Reputation' },
		{ key: 'carrier' as const, label: 'Carrier Reputation' },
	];

	return (
		<div className="p-6">
			<div className="mb-6">
				<h1 style={{ color: '#191C1E' }}>Reputation Score Viewer</h1>
				<p style={{ fontSize: 13, color: 'rgba(25,28,30,0.55)', marginTop: 2 }}>
					Platform-wide performance scores for all verified partners
				</p>
			</div>

			<div
				className="flex gap-1 p-1 rounded-lg mb-6 w-fit"
				style={{ background: '#E0E4EB' }}
			>
				{TABS.map((t) => (
					<button
						key={t.key}
						onClick={() => setTab(t.key)}
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

			{tab === 'supplier' && (
				<div
					className="rounded-xl overflow-hidden"
					style={{ background: '#FFFFFF', boxShadow: SHADOW }}
				>
					<div
						className="px-5 py-4 flex items-center gap-2"
						style={{ background: '#F2F4F7' }}
					>
						<Star className="w-5 h-5" style={{ color: '#7A4F00' }} />
						<h4 style={{ color: '#191C1E' }}>Supplier Reputation Scores</h4>
					</div>
					<table className="w-full">
						<thead style={{ background: '#F2F4F7' }}>
							<tr>
								{[
									'SUPPLIER',
									'SCORE',
									'TOTAL ORDERS',
									'ON-TIME DELIVERY',
									'QUALITY RATING',
									'DISPUTE RATE',
									'LAST UPDATED',
								].map((h) => (
									<th
										key={h}
										className="text-left px-5 py-3"
										style={{
											fontSize: 11,
											fontWeight: 500,
											letterSpacing: '0.05em',
											color: 'rgba(25,28,30,0.6)',
										}}
									>
										{h}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{supplierReputations
								.sort((a, b) => b.score - a.score)
								.map((s, i) => (
									<tr
										key={s.id}
										style={{ background: i % 2 === 1 ? '#F7F9FC' : '#FFFFFF' }}
										onMouseEnter={(e) =>
											((
												e.currentTarget as HTMLTableRowElement
											).style.background = '#E0E4EB')
										}
										onMouseLeave={(e) =>
											((
												e.currentTarget as HTMLTableRowElement
											).style.background = i % 2 === 1 ? '#F7F9FC' : '#FFFFFF')
										}
									>
										<td className="px-5 py-3">
											<div className="flex items-center gap-2">
												{i === 0 && <span>ðŸ†</span>}
												<span
													style={{
														fontSize: 14,
														color: '#191C1E',
														fontWeight: 500,
													}}
												>
													{s.company}
												</span>
											</div>
										</td>
										<td className="px-5 py-3 w-36">
											<ScoreBar score={s.score} />
										</td>
										<td
											className="px-5 py-3"
											style={{ fontSize: 14, color: 'rgba(25,28,30,0.7)' }}
										>
											{s.totalOrders.toLocaleString()}
										</td>
										<td className="px-5 py-3">
											<div
												className="flex items-center gap-1"
												style={{ color: '#1B6B3A', fontSize: 13 }}
											>
												<TrendingUp className="w-3.5 h-3.5" />{' '}
												{s.onTimeDelivery}%
											</div>
										</td>
										<td className="px-5 py-3">
											<div
												className="flex items-center gap-1"
												style={{ color: '#7A4F00', fontSize: 13 }}
											>
												<Star className="w-3.5 h-3.5" /> {s.qualityRating}
											</div>
										</td>
										<td className="px-5 py-3">
											<div
												className="flex items-center gap-1"
												style={{ color: '#BA1A1A', fontSize: 13 }}
											>
												<TrendingDown className="w-3.5 h-3.5" /> {s.disputeRate}
												%
											</div>
										</td>
										<td
											className="px-5 py-3"
											style={{ fontSize: 12, color: 'rgba(25,28,30,0.5)' }}
										>
											{s.lastUpdated}
										</td>
									</tr>
								))}
						</tbody>
					</table>
				</div>
			)}

			{tab === 'carrier' && (
				<div
					className="rounded-xl overflow-hidden"
					style={{ background: '#FFFFFF', boxShadow: SHADOW }}
				>
					<div
						className="px-5 py-4 flex items-center gap-2"
						style={{ background: '#F2F4F7' }}
					>
						<Star className="w-5 h-5" style={{ color: '#7A4F00' }} />
						<h4 style={{ color: '#191C1E' }}>Carrier Reputation Scores</h4>
					</div>
					<table className="w-full">
						<thead style={{ background: '#F2F4F7' }}>
							<tr>
								{[
									'CARRIER',
									'SCORE',
									'TOTAL SHIPMENTS',
									'ON-TIME RATE',
									'INCIDENT RATE',
									'ETA ACCURACY',
									'LAST UPDATED',
								].map((h) => (
									<th
										key={h}
										className="text-left px-5 py-3"
										style={{
											fontSize: 11,
											fontWeight: 500,
											letterSpacing: '0.05em',
											color: 'rgba(25,28,30,0.6)',
										}}
									>
										{h}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{carrierReputations
								.sort((a, b) => b.score - a.score)
								.map((c, i) => (
									<tr
										key={c.id}
										style={{ background: i % 2 === 1 ? '#F7F9FC' : '#FFFFFF' }}
										onMouseEnter={(e) =>
											((
												e.currentTarget as HTMLTableRowElement
											).style.background = '#E0E4EB')
										}
										onMouseLeave={(e) =>
											((
												e.currentTarget as HTMLTableRowElement
											).style.background = i % 2 === 1 ? '#F7F9FC' : '#FFFFFF')
										}
									>
										<td className="px-5 py-3">
											<div className="flex items-center gap-2">
												{i === 0 && <span>ðŸ†</span>}
												<span
													style={{
														fontSize: 14,
														color: '#191C1E',
														fontWeight: 500,
													}}
												>
													{c.company}
												</span>
											</div>
										</td>
										<td className="px-5 py-3 w-36">
											<ScoreBar score={c.score} />
										</td>
										<td
											className="px-5 py-3"
											style={{ fontSize: 14, color: 'rgba(25,28,30,0.7)' }}
										>
											{c.totalShipments.toLocaleString()}
										</td>
										<td
											className="px-5 py-3"
											style={{
												fontSize: 13,
												color: '#1B6B3A',
												fontWeight: 500,
											}}
										>
											{c.onTimeRate}%
										</td>
										<td
											className="px-5 py-3"
											style={{
												fontSize: 13,
												color: '#BA1A1A',
												fontWeight: 500,
											}}
										>
											{c.incidentRate}%
										</td>
										<td
											className="px-5 py-3"
											style={{
												fontSize: 13,
												color: '#1A6EC4',
												fontWeight: 500,
											}}
										>
											{c.avgEtaAccuracy}%
										</td>
										<td
											className="px-5 py-3"
											style={{ fontSize: 12, color: 'rgba(25,28,30,0.5)' }}
										>
											{c.lastUpdated}
										</td>
									</tr>
								))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
