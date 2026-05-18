'use client';
import {
	CheckCircle,
	ChevronLeft,
	ClipboardList,
	UserPlus,
	XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { supplierOrders } from '@/app/data/mockData';
import { isDemoWorkspaceSession } from '@/lib/workspace-mode';

const SHADOW = '0px 8px 24px rgba(15,76,138,0.08)';
const TEAM = ['Nguyen Van B', 'Tran Thi C', 'Le Minh D', 'Pham Thi E'];

function StatusChip({ status }: { status: string }) {
	const map: Record<string, { bg: string; color: string }> = {
		pending_approval: { bg: '#FFEFC6', color: '#7A4F00' },
		approved: { bg: '#C8F0D8', color: '#1B6B3A' },
		denied: { bg: '#FFDAD6', color: '#BA1A1A' },
		in_negotiation: { bg: '#D3E4F5', color: '#0F4C8A' },
		completed: { bg: '#E0E4EB', color: '#191C1E' },
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
			{status.replace(/_/g, ' ').toUpperCase()}
		</span>
	);
}

export default function SupplierOrderManagement() {
	const [demoEnabled, setDemoEnabled] = useState(false);
	const [orders, setOrders] = useState(supplierOrders);
	const [selected, setSelected] = useState<string | null>(null);
	const [denyModal, setDenyModal] = useState<string | null>(null);
	const [denyReason, setDenyReason] = useState('');
	const [assignModal, setAssignModal] = useState<string | null>(null);
	const [assignee, setAssignee] = useState('');

	useEffect(() => {
		if (isDemoWorkspaceSession()) {
			setDemoEnabled(true);
		}
	}, []);

	if (!demoEnabled) {
		return (
			<div className="p-6">
				<h1 style={{ color: '#191C1E' }}>Supplier Orders</h1>
				<p className="mt-2 text-sm text-slate-500">
					No sample orders are loaded for newly created workspaces.
				</p>
			</div>
		);
	}

	const detail = orders.find((o) => o.id === selected);

	function approve(id: string) {
		setOrders((os) =>
			os.map((o) => (o.id === id ? { ...o, status: 'approved' } : o)),
		);
		setSelected(null);
	}
	function deny(id: string) {
		setOrders((os) =>
			os.map((o) => (o.id === id ? { ...o, status: 'denied' } : o)),
		);
		setDenyModal(null);
		setDenyReason('');
		setSelected(null);
	}
	function assign(id: string) {
		setOrders((os) =>
			os.map((o) => (o.id === id ? { ...o, assignedTo: assignee } : o)),
		);
		setAssignModal(null);
		setAssignee('');
	}

	if (selected && detail) {
		return (
			<div className="p-6 max-w-3xl mx-auto">
				<button
					onClick={() => setSelected(null)}
					className="flex items-center gap-1 mb-4 hover:opacity-80"
					style={{ fontSize: 13, color: 'rgba(25,28,30,0.55)' }}
				>
					<ChevronLeft className="w-4 h-4" /> Back
				</button>
				<div
					className="rounded-xl p-6"
					style={{ background: '#FFFFFF', boxShadow: SHADOW }}
				>
					<div className="flex items-start justify-between mb-5">
						<div>
							<h2 style={{ color: '#191C1E' }}>Order {detail.id}</h2>
							<p
								style={{
									fontSize: 13,
									color: 'rgba(25,28,30,0.55)',
									marginTop: 2,
								}}
							>
								Created: {detail.createdAt} · Deadline: {detail.deadline}
							</p>
						</div>
						<StatusChip status={detail.status} />
					</div>
					<div className="grid grid-cols-2 gap-3 mb-5">
						{[
							['BUYER', detail.buyer],
							['PRODUCT', detail.product],
							['QUANTITY', `${detail.qty} ${detail.unit}`],
							['TOTAL VALUE', `₫${detail.totalValue.toLocaleString('vi-VN')}`],
							['ASSIGNED TO', detail.assignedTo ?? '(unassigned)'],
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
					{detail.status === 'pending_approval' && (
						<div className="flex gap-3">
							<button
								onClick={() => approve(detail.id)}
								className="flex items-center gap-2 px-4 py-2.5 text-white rounded-[6px] transition-all hover:brightness-105"
								style={{
									background:
										'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)',
									fontWeight: 600,
									fontSize: 12,
									letterSpacing: '0.05em',
								}}
							>
								<CheckCircle className="w-4 h-4" /> APPROVE
							</button>
							<button
								onClick={() => setDenyModal(detail.id)}
								className="flex items-center gap-2 px-4 py-2.5 rounded-[6px]"
								style={{
									background: '#FFDAD6',
									color: '#BA1A1A',
									fontWeight: 600,
									fontSize: 12,
									letterSpacing: '0.05em',
								}}
							>
								<XCircle className="w-4 h-4" /> DENY
							</button>
							<button
								onClick={() => setAssignModal(detail.id)}
								className="flex items-center gap-2 px-4 py-2.5 rounded-[6px]"
								style={{
									background: '#D5DAE3',
									color: '#191C1E',
									fontWeight: 500,
									fontSize: 13,
								}}
							>
								<UserPlus className="w-4 h-4" /> Assign
							</button>
						</div>
					)}
					{detail.status !== 'pending_approval' &&
						detail.status !== 'completed' && (
							<button
								onClick={() => setAssignModal(detail.id)}
								className="flex items-center gap-2 px-4 py-2.5 rounded-[6px]"
								style={{
									background: '#D5DAE3',
									color: '#191C1E',
									fontWeight: 500,
									fontSize: 13,
								}}
							>
								<UserPlus className="w-4 h-4" /> Reassign
							</button>
						)}
				</div>

				{denyModal && (
					<div
						className="fixed inset-0 flex items-center justify-center z-50"
						style={{
							background: 'rgba(0,0,0,0.4)',
							backdropFilter: 'blur(4px)',
						}}
					>
						<div
							className="rounded-xl p-6 w-full max-w-sm"
							style={{
								background: 'rgba(255,255,255,0.92)',
								backdropFilter: 'blur(20px)',
								boxShadow: SHADOW,
							}}
						>
							<h3 className="mb-3" style={{ color: '#191C1E' }}>
								Deny Order
							</h3>
							<p
								className="mb-3"
								style={{ fontSize: 14, color: 'rgba(25,28,30,0.6)' }}
							>
								Please provide a reason for denial.
							</p>
							<textarea
								value={denyReason}
								onChange={(e) => setDenyReason(e.target.value)}
								rows={3}
								placeholder="Enter reason..."
								className="w-full px-3 py-2 rounded-t-[6px] focus:outline-none resize-none mb-3"
								style={{
									background: '#D5DAE3',
									borderBottom: '2px solid #BA1A1A',
									color: '#191C1E',
									fontSize: 14,
								}}
							/>
							<div className="flex gap-2">
								<button
									onClick={() => deny(denyModal)}
									disabled={!denyReason}
									className="flex-1 py-2.5 text-white rounded-[6px] disabled:opacity-40"
									style={{
										background: '#BA1A1A',
										fontWeight: 600,
										fontSize: 13,
									}}
								>
									Confirm Deny
								</button>
								<button
									onClick={() => setDenyModal(null)}
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

				{assignModal && (
					<div
						className="fixed inset-0 flex items-center justify-center z-50"
						style={{
							background: 'rgba(0,0,0,0.4)',
							backdropFilter: 'blur(4px)',
						}}
					>
						<div
							className="rounded-xl p-6 w-full max-w-sm"
							style={{
								background: 'rgba(255,255,255,0.92)',
								backdropFilter: 'blur(20px)',
								boxShadow: SHADOW,
							}}
						>
							<h3 className="mb-4" style={{ color: '#191C1E' }}>
								Assign Task
							</h3>
							<p
								className="mb-3"
								style={{ fontSize: 13, color: 'rgba(25,28,30,0.6)' }}
							>
								Select an active team member:
							</p>
							<div className="space-y-2">
								{TEAM.map((name) => (
									<button
										key={name}
										onClick={() => setAssignee(name)}
										className="w-full text-left px-4 py-2.5 rounded-lg transition-all"
										style={{
											border: `2px solid ${assignee === name ? '#1A6EC4' : '#E0E4EB'}`,
											background: assignee === name ? '#D3E4F5' : 'transparent',
											color: assignee === name ? '#0F4C8A' : '#191C1E',
											fontSize: 14,
										}}
									>
										{name}
									</button>
								))}
							</div>
							<div className="flex gap-2 mt-4">
								<button
									onClick={() => assign(assignModal)}
									disabled={!assignee}
									className="flex-1 py-2.5 text-white rounded-[6px] disabled:opacity-40 transition-all hover:brightness-105"
									style={{
										background:
											'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)',
										fontWeight: 600,
										fontSize: 13,
									}}
								>
									Assign
								</button>
								<button
									onClick={() => setAssignModal(null)}
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

	return (
		<div className="p-6">
			<div className="mb-6">
				<h1 style={{ color: '#191C1E' }}>Order Management</h1>
				<p style={{ fontSize: 13, color: 'rgba(25,28,30,0.55)', marginTop: 2 }}>
					My Tasks View —{' '}
					{orders.filter((o) => o.status === 'pending_approval').length} pending
					approval
				</p>
			</div>
			<div className="space-y-3">
				{orders.map((o) => (
					<div
						key={o.id}
						onClick={() => setSelected(o.id)}
						className="rounded-xl p-5 cursor-pointer transition-all"
						style={{ background: '#FFFFFF', boxShadow: SHADOW }}
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
									className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
									style={{ background: '#D3E4F5' }}
								>
									<ClipboardList
										className="w-5 h-5"
										style={{ color: '#0F4C8A' }}
									/>
								</div>
								<div>
									<p
										style={{ fontSize: 15, fontWeight: 600, color: '#191C1E' }}
									>
										{o.id} — {o.product}
									</p>
									<p
										style={{
											fontSize: 12,
											color: 'rgba(25,28,30,0.5)',
											marginTop: 2,
										}}
									>
										Buyer: {o.buyer} · {o.qty} {o.unit}
									</p>
								</div>
							</div>
							<StatusChip status={o.status} />
						</div>
						<div
							className="flex items-center justify-between"
							style={{ fontSize: 12, color: 'rgba(25,28,30,0.55)' }}
						>
							<span>Value: ₫{o.totalValue.toLocaleString('vi-VN')}</span>
							<span>Assigned: {o.assignedTo ?? 'Unassigned'}</span>
							<span>Deadline: {o.deadline}</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
