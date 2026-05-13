'use client';

import {
	Building2,
	CheckCircle,
	ChevronLeft,
	Eye,
	XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { pendingWorkspaces } from '../../data/mockData';

const SHADOW = '0px 8px 24px rgba(15,76,138,0.08)';

function TypeChip({ type }: { type: string }) {
	return (
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
			{type.toUpperCase()}
		</span>
	);
}

function StatusChip({ status }: { status: string }) {
	const map: Record<string, { bg: string; color: string }> = {
		pending: { bg: '#FFEFC6', color: '#7A4F00' },
		approved: { bg: '#C8F0D8', color: '#1B6B3A' },
		rejected: { bg: '#FFDAD6', color: '#BA1A1A' },
	};
	const s = map[status] ?? { bg: '#E0E4EB', color: '#191C1E' };
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
			{status.toUpperCase()}
		</span>
	);
}

export default function WorkspaceApprovals() {
	const [workspaces, setWorkspaces] = useState(
		pendingWorkspaces.map((w) => ({ ...w, status: 'pending' as string })),
	);
	const [selected, setSelected] = useState<string | null>(null);
	const [rejectModal, setRejectModal] = useState<string | null>(null);
	const [rejectReason, setRejectReason] = useState('');

	const detail = workspaces.find((w) => w.id === selected);

	function approve(id: string) {
		setWorkspaces((ws) =>
			ws.map((w) => (w.id === id ? { ...w, status: 'approved' } : w)),
		);
		setSelected(null);
	}
	function reject(id: string) {
		setWorkspaces((ws) =>
			ws.map((w) => (w.id === id ? { ...w, status: 'rejected' } : w)),
		);
		setRejectModal(null);
		setRejectReason('');
		setSelected(null);
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
					<ChevronLeft className="w-4 h-4" /> Back to list
				</button>
				<div
					className="rounded-xl p-6"
					style={{ background: '#FFFFFF', boxShadow: SHADOW }}
				>
					<div className="flex items-start justify-between mb-6">
						<div>
							<div className="flex items-center gap-2 mb-1">
								<h2 style={{ color: '#191C1E' }}>{detail.company}</h2>
								<TypeChip type={detail.type} />
							</div>
							<p style={{ fontSize: 13, color: 'rgba(25,28,30,0.55)' }}>
								Submitted: {detail.submittedAt}
							</p>
						</div>
						<StatusChip status={detail.status} />
					</div>

					<div className="grid grid-cols-2 gap-4 mb-6">
						{[
							['Email', detail.email],
							['Phone', detail.phone],
							['Tax Code', detail.taxCode],
							['City', detail.city],
							['Country', detail.country],
							['Type', detail.type],
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

					{detail.status === 'pending' && (
						<div className="flex gap-3">
							<button
								onClick={() => approve(detail.id)}
								className="flex items-center gap-2 px-5 py-2.5 text-white rounded-[6px] transition-all hover:brightness-105"
								style={{
									background:
										'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)',
									fontWeight: 600,
									letterSpacing: '0.05em',
									fontSize: 13,
								}}
							>
								<CheckCircle className="w-4 h-4" /> APPROVE WORKSPACE
							</button>
							<button
								onClick={() => setRejectModal(detail.id)}
								className="flex items-center gap-2 px-5 py-2.5 rounded-[6px] transition-colors"
								style={{
									background: '#FFDAD6',
									color: '#BA1A1A',
									fontWeight: 600,
									fontSize: 13,
									letterSpacing: '0.05em',
								}}
							>
								<XCircle className="w-4 h-4" /> REJECT WORKSPACE
							</button>
						</div>
					)}
				</div>

				{/* Reject Modal */}
				{rejectModal && (
					<div
						className="fixed inset-0 flex items-center justify-center z-50"
						style={{
							background: 'rgba(0,0,0,0.4)',
							backdropFilter: 'blur(4px)',
						}}
					>
						<div
							className="rounded-xl p-6 w-full max-w-md"
							style={{
								background: 'rgba(255,255,255,0.92)',
								backdropFilter: 'blur(20px)',
								boxShadow: SHADOW,
							}}
						>
							<h3 className="mb-1" style={{ color: '#191C1E' }}>
								Reject Workspace Application
							</h3>
							<p
								className="mb-4"
								style={{ fontSize: 14, color: 'rgba(25,28,30,0.6)' }}
							>
								Please provide a reason for rejection. This will be sent to the
								applicant.
							</p>
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
								REJECTION REASON
							</label>
							<textarea
								value={rejectReason}
								onChange={(e) => setRejectReason(e.target.value)}
								rows={4}
								placeholder="Enter rejection reason..."
								className="w-full px-3 py-2 rounded-t-[6px] focus:outline-none resize-none mb-4"
								style={{
									background: '#D5DAE3',
									borderBottom: '2px solid #00559F',
									color: '#191C1E',
									fontSize: 14,
								}}
							/>
							<div className="flex gap-2">
								<button
									onClick={() => reject(rejectModal)}
									disabled={!rejectReason.trim()}
									className="flex-1 py-2.5 text-white rounded-[6px] transition-all disabled:opacity-40"
									style={{
										background: '#BA1A1A',
										fontWeight: 600,
										fontSize: 13,
									}}
								>
									Confirm Reject
								</button>
								<button
									onClick={() => setRejectModal(null)}
									className="flex-1 py-2.5 rounded-[6px] transition-colors"
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

	/* â”€â”€ List View â”€â”€ */
	return (
		<div className="p-6">
			<div className="flex items-center justify-between mb-6">
				<div>
					<h1 style={{ color: '#191C1E' }}>Workspace Approvals</h1>
					<p
						style={{ fontSize: 13, color: 'rgba(25,28,30,0.55)', marginTop: 2 }}
					>
						{workspaces.filter((w) => w.status === 'pending').length} pending
						application(s)
					</p>
				</div>
			</div>

			<div
				className="rounded-xl overflow-hidden"
				style={{ background: '#FFFFFF', boxShadow: SHADOW }}
			>
				<table className="w-full">
					<thead style={{ background: '#F2F4F7' }}>
						<tr>
							{[
								'COMPANY',
								'TYPE',
								'EMAIL',
								'TAX CODE',
								'CITY',
								'SUBMITTED',
								'STATUS',
								'ACTION',
							].map((h) => (
								<th
									key={h}
									className="text-left px-4 py-3"
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
						{workspaces.map((w, i) => (
							<tr
								key={w.id}
								style={{ background: i % 2 === 1 ? '#F7F9FC' : '#FFFFFF' }}
								onMouseEnter={(e) =>
									((e.currentTarget as HTMLTableRowElement).style.background =
										'#E0E4EB')
								}
								onMouseLeave={(e) =>
									((e.currentTarget as HTMLTableRowElement).style.background =
										i % 2 === 1 ? '#F7F9FC' : '#FFFFFF')
								}
							>
								<td className="px-4 py-3">
									<div className="flex items-center gap-2">
										<div
											className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
											style={{ background: '#D3E4F5' }}
										>
											<Building2
												className="w-4 h-4"
												style={{ color: '#0F4C8A' }}
											/>
										</div>
										<span
											style={{
												fontSize: 14,
												color: '#191C1E',
												fontWeight: 500,
											}}
										>
											{w.company}
										</span>
									</div>
								</td>
								<td className="px-4 py-3">
									<TypeChip type={w.type} />
								</td>
								<td
									className="px-4 py-3"
									style={{ fontSize: 13, color: 'rgba(25,28,30,0.7)' }}
								>
									{w.email}
								</td>
								<td
									className="px-4 py-3"
									style={{ fontSize: 13, color: 'rgba(25,28,30,0.7)' }}
								>
									{w.taxCode}
								</td>
								<td
									className="px-4 py-3"
									style={{ fontSize: 13, color: 'rgba(25,28,30,0.7)' }}
								>
									{w.city}
								</td>
								<td
									className="px-4 py-3"
									style={{ fontSize: 13, color: 'rgba(25,28,30,0.5)' }}
								>
									{w.submittedAt}
								</td>
								<td className="px-4 py-3">
									<StatusChip status={w.status} />
								</td>
								<td className="px-4 py-3">
									<button
										onClick={() => setSelected(w.id)}
										className="flex items-center gap-1 hover:opacity-80 transition-opacity"
										style={{
											fontSize: 11,
											fontWeight: 500,
											letterSpacing: '0.05em',
											color: '#1A6EC4',
										}}
									>
										<Eye className="w-3.5 h-3.5" /> VIEW DETAIL
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
