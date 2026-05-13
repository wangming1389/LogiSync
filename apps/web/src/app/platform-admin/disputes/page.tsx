'use client';

import {
	AlertTriangle,
	CheckCircle,
	ChevronLeft,
	FileText,
} from 'lucide-react';
import { useState } from 'react';
import { disputes as initialDisputes } from '../../data/mockData';

const SHADOW = '0px 8px 24px rgba(15,76,138,0.08)';

function StatusChip({ status }: { status: string }) {
	const map: Record<string, { bg: string; color: string; label: string }> = {
		escalated: { bg: '#FFDAD6', color: '#BA1A1A', label: 'ESCALATED' },
		in_progress: { bg: '#FFEFC6', color: '#7A4F00', label: 'IN PROGRESS' },
		resolved: { bg: '#C8F0D8', color: '#1B6B3A', label: 'RESOLVED' },
	};
	const s = map[status] ?? {
		bg: '#E0E4EB',
		color: '#191C1E',
		label: status.toUpperCase(),
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
			{s.label}
		</span>
	);
}

export default function DisputeManagement() {
	const [disputes, setDisputes] = useState(initialDisputes);
	const [selected, setSelected] = useState<string | null>(null);
	const [resolution, setResolution] = useState('');
	const [resolved, setResolved] = useState(false);

	const detail = disputes.find((d) => d.id === selected);

	function resolve(id: string) {
		setDisputes((ds) =>
			ds.map((d) => (d.id === id ? { ...d, status: 'resolved' } : d)),
		);
		setResolved(true);
		setTimeout(() => {
			setResolved(false);
			setSelected(null);
			setResolution('');
		}, 1500);
	}

	/* â”€â”€ Detail View â”€â”€ */
	if (selected && detail) {
		return (
			<div className="p-6 max-w-3xl mx-auto">
				<button
					onClick={() => setSelected(null)}
					className="flex items-center gap-1 mb-4 hover:opacity-80"
					style={{ fontSize: 13, color: 'rgba(25,28,30,0.55)' }}
				>
					<ChevronLeft className="w-4 h-4" /> Back to disputes
				</button>
				<div
					className="rounded-xl p-6 space-y-5"
					style={{ background: '#FFFFFF', boxShadow: SHADOW }}
				>
					<div className="flex items-start justify-between">
						<div>
							<h2 style={{ color: '#191C1E' }}>{detail.type}</h2>
							<p
								style={{
									fontSize: 13,
									color: 'rgba(25,28,30,0.55)',
									marginTop: 2,
								}}
							>
								Order: {detail.orderId} Â· Filed: {detail.filedAt}
							</p>
						</div>
						<StatusChip status={detail.status} />
					</div>

					<div className="grid grid-cols-3 gap-3">
						{[
							['BUYER', detail.buyer],
							['SUPPLIER', detail.supplier],
							['CARRIER', detail.carrier],
						].map(([k, v]) => (
							<div
								key={k}
								className="rounded-lg p-3"
								style={{ background: '#F2F4F7' }}
							>
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
								<p style={{ fontSize: 14, color: '#191C1E', marginTop: 4 }}>
									{v}
								</p>
							</div>
						))}
					</div>

					<div>
						<p
							style={{
								fontSize: 11,
								fontWeight: 500,
								letterSpacing: '0.05em',
								textTransform: 'uppercase',
								color: 'rgba(25,28,30,0.55)',
								marginBottom: 6,
							}}
						>
							DESCRIPTION
						</p>
						<p
							className="rounded-lg p-3"
							style={{ fontSize: 14, color: '#191C1E', background: '#F2F4F7' }}
						>
							{detail.description}
						</p>
					</div>

					{detail.evidence.length > 0 && (
						<div>
							<p
								style={{
									fontSize: 11,
									fontWeight: 500,
									letterSpacing: '0.05em',
									textTransform: 'uppercase',
									color: 'rgba(25,28,30,0.55)',
									marginBottom: 8,
								}}
							>
								EVIDENCE
							</p>
							<div className="flex flex-wrap gap-2">
								{detail.evidence.map((e) => (
									<div
										key={e}
										className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
										style={{
											background: '#D3E4F5',
											fontSize: 12,
											color: '#0F4C8A',
										}}
									>
										<FileText className="w-3.5 h-3.5" /> {e}
									</div>
								))}
							</div>
						</div>
					)}

					{detail.status !== 'resolved' && (
						<div>
							<p
								style={{
									fontSize: 11,
									fontWeight: 500,
									letterSpacing: '0.05em',
									textTransform: 'uppercase',
									color: 'rgba(25,28,30,0.6)',
									marginBottom: 8,
								}}
							>
								RESOLUTION NOTE
							</p>
							<textarea
								value={resolution}
								onChange={(e) => setResolution(e.target.value)}
								rows={4}
								placeholder="Enter resolution details, actions taken, and outcome..."
								className="w-full px-3 py-2 rounded-t-[6px] focus:outline-none resize-none"
								style={{
									background: '#D5DAE3',
									borderBottom: '2px solid #00559F',
									color: '#191C1E',
									fontSize: 14,
								}}
							/>
							{resolved && (
								<div
									className="flex items-center gap-2 mt-2"
									style={{ fontSize: 13, color: '#1B6B3A' }}
								>
									<CheckCircle className="w-4 h-4" /> Dispute resolved and
									parties notified.
								</div>
							)}
							<button
								onClick={() => resolve(detail.id)}
								disabled={!resolution.trim()}
								className="mt-3 px-5 py-2.5 text-white rounded-[6px] transition-all disabled:opacity-40 hover:brightness-105"
								style={{
									background:
										'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)',
									fontWeight: 600,
									fontSize: 13,
									letterSpacing: '0.05em',
								}}
							>
								SUBMIT RESOLUTION
							</button>
						</div>
					)}

					{detail.status === 'resolved' && (
						<div
							className="flex items-center gap-2 p-3 rounded-lg"
							style={{ background: '#C8F0D8' }}
						>
							<CheckCircle className="w-4 h-4" style={{ color: '#1B6B3A' }} />
							<span style={{ fontSize: 13, color: '#1B6B3A' }}>
								This dispute has been resolved.
							</span>
						</div>
					)}
				</div>
			</div>
		);
	}

	/* â”€â”€ List View â”€â”€ */
	return (
		<div className="p-6">
			<div className="mb-6">
				<h1 style={{ color: '#191C1E' }}>Dispute Management</h1>
				<p style={{ fontSize: 13, color: 'rgba(25,28,30,0.55)', marginTop: 2 }}>
					Escalated & in-progress disputes requiring platform intervention
				</p>
			</div>

			<div className="space-y-3">
				{disputes.map((d) => (
					<div
						key={d.id}
						className="rounded-xl p-5 cursor-pointer transition-all"
						style={{ background: '#FFFFFF', boxShadow: SHADOW }}
						onClick={() => setSelected(d.id)}
						onMouseEnter={(e) =>
							((e.currentTarget as HTMLDivElement).style.boxShadow =
								'0px 12px 32px rgba(15,76,138,0.14)')
						}
						onMouseLeave={(e) =>
							((e.currentTarget as HTMLDivElement).style.boxShadow = SHADOW)
						}
					>
						<div className="flex items-start justify-between mb-3">
							<div className="flex items-start gap-3">
								<div
									className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
									style={{
										background:
											d.status === 'escalated' ? '#FFDAD6' : '#FFEFC6',
									}}
								>
									<AlertTriangle
										className="w-5 h-5"
										style={{
											color: d.status === 'escalated' ? '#BA1A1A' : '#7A4F00',
										}}
									/>
								</div>
								<div>
									<p
										style={{ fontSize: 15, fontWeight: 600, color: '#191C1E' }}
									>
										{d.type}
									</p>
									<p
										style={{
											fontSize: 12,
											color: 'rgba(25,28,30,0.5)',
											marginTop: 2,
										}}
									>
										Order: {d.orderId} Â· Filed: {d.filedAt}
									</p>
								</div>
							</div>
							<StatusChip status={d.status} />
						</div>
						<div
							className="flex items-center gap-4"
							style={{ fontSize: 12, color: 'rgba(25,28,30,0.55)' }}
						>
							<span>Buyer: {d.buyer}</span>
							<span>Â·</span>
							<span>Supplier: {d.supplier}</span>
							<span>Â·</span>
							<span>Carrier: {d.carrier}</span>
						</div>
						<p
							className="mt-2 line-clamp-2"
							style={{ fontSize: 13, color: 'rgba(25,28,30,0.65)' }}
						>
							{d.description}
						</p>
					</div>
				))}
			</div>
		</div>
	);
}
