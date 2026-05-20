'use client';

import { AlertTriangle, PauseCircle, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const SHADOW = '0px 8px 24px rgba(15,76,138,0.08)';

type Workspace = {
	id: string;
	name: string;
	company?: string;
	slug: string;
	type: string;
	status: string;
	taxId: string;
	adminEmail?: string;
	createdAt?: string;
	registeredAt?: string;
	enabledRoles?: string[];
	roles?: string[];
	activeShipments?: number;
	approvedAt?: string;
};

function StatusChip({ status }: { status: string }) {
	const map: Record<string, { bg: string; color: string }> = {
		active: { bg: '#C8F0D8', color: '#1B6B3A' },
		suspended: { bg: '#FFEFC6', color: '#7A4F00' },
		revoked: { bg: '#FFDAD6', color: '#BA1A1A' },
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

export default function WorkspaceManagement() {
	const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
	const [search, setSearch] = useState('');
	const [suspendModal, setSuspendModal] = useState<Workspace | null>(null);
	const [revokeModal, setRevokeModal] = useState<Workspace | null>(null);
	const [confirmName, setConfirmName] = useState('');
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let active = true;
		async function loadWorkspaces() {
			setLoading(true);
			try {
				const response: any = await api.get('/workspaces?limit=100');
				const payload = response?.data?.data ?? response?.data ?? response;
				const items = Array.isArray(payload) ? payload : payload?.items ?? [];
				if (active && Array.isArray(items)) {
					setWorkspaces(items);
				}
			} catch (error) {
				console.error('Error loading workspaces', error);
			} finally {
				if (active) setLoading(false);
			}
		}

		loadWorkspaces();
		return () => {
			active = false;
		};
	}, []);

	const filtered = workspaces.filter((w) =>
		(w.name ?? w.company ?? '').toLowerCase().includes(search.toLowerCase()),
	);

	function suspend(id: string) {
		setWorkspaces((ws) =>
			ws.map((w) =>
				w.id === id
					? { ...w, status: w.status === 'suspended' ? 'active' : 'suspended' }
					: w,
			),
		);
		setSuspendModal(null);
	}

	function revoke(id: string) {
		setWorkspaces((ws) => ws.filter((w) => w.id !== id));
		setRevokeModal(null);
		setConfirmName('');
	}

	return (
		<div className="p-6">
			<div className="flex items-center justify-between mb-6">
				<div>
					<h1 style={{ color: '#191C1E' }}>Workspace Management</h1>
					<p
						style={{ fontSize: 13, color: 'rgba(25,28,30,0.55)', marginTop: 2 }}
					>
						{workspaces.length} workspaces
					</p>
				</div>
				<div className="relative">
					<Search
						className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
						style={{ color: 'rgba(25,28,30,0.4)' }}
					/>
					<input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search company..."
						className="pl-9 pr-4 h-10 rounded-t-[6px] focus:outline-none"
						style={{
							background: '#D5DAE3',
							borderBottom: '2px solid #00559F',
							color: '#191C1E',
							fontSize: 14,
							width: 220,
						}}
					/>
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
								'STATUS',
								'ACTIVE SHIPMENTS',
								'APPROVED AT',
								'ACTIONS',
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
						{loading ? (
							<tr>
								<td className="px-5 py-6 text-sm text-slate-500" colSpan={6}>
									Loading workspaces...
								</td>
							</tr>
						) : null}
						{filtered.map((w, i) => (
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
								<td
									className="px-5 py-3"
									style={{ fontSize: 14, color: '#191C1E', fontWeight: 500 }}
								>
									{w.name ?? w.company}
								</td>
								<td className="px-5 py-3">
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
										{w.type.toUpperCase()}
									</span>
								</td>
								<td className="px-5 py-3">
									<StatusChip status={w.status} />
								</td>
								<td
									className="px-5 py-3"
									style={{ fontSize: 14, color: 'rgba(25,28,30,0.7)' }}
								>
									{w.activeShipments}
								</td>
								<td
									className="px-5 py-3"
									style={{ fontSize: 13, color: 'rgba(25,28,30,0.5)' }}
								>
									{w.approvedAt}
								</td>
								<td className="px-5 py-3">
									<div className="flex items-center gap-2">
										<button
											onClick={() => setSuspendModal(w)}
											className="flex items-center gap-1 px-3 py-1.5 rounded-[6px] transition-colors"
											style={{
												background: '#FFEFC6',
												color: '#7A4F00',
												fontSize: 11,
												fontWeight: 500,
												letterSpacing: '0.04em',
											}}
										>
											<PauseCircle className="w-3.5 h-3.5" />
											{w.status === 'suspended' ? 'UNSUSPEND' : 'SUSPEND'}
										</button>
										<button
											onClick={() => setRevokeModal(w)}
											className="flex items-center gap-1 px-3 py-1.5 rounded-[6px] transition-colors"
											style={{
												background: '#FFDAD6',
												color: '#BA1A1A',
												fontSize: 11,
												fontWeight: 500,
												letterSpacing: '0.04em',
											}}
										>
											<Trash2 className="w-3.5 h-3.5" /> REVOKE
										</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Suspend Modal */}
			{suspendModal && (
				<div
					className="fixed inset-0 flex items-center justify-center z-50"
					style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
				>
					<div
						className="rounded-xl p-6 w-full max-w-sm"
						style={{
							background: 'rgba(255,255,255,0.92)',
							backdropFilter: 'blur(20px)',
							boxShadow: SHADOW,
						}}
					>
						<div className="flex items-center gap-3 mb-4">
							<div
								className="w-10 h-10 rounded-full flex items-center justify-center"
								style={{ background: '#FFEFC6' }}
							>
								<PauseCircle className="w-5 h-5" style={{ color: '#7A4F00' }} />
							</div>
							<h3 style={{ color: '#191C1E' }}>
								{suspendModal.status === 'suspended' ? 'Unsuspend' : 'Suspend'}{' '}
								Workspace
							</h3>
						</div>
						<p
							className="mb-6"
							style={{ fontSize: 14, color: 'rgba(25,28,30,0.6)' }}
						>
							Are you sure you want to{' '}
							{suspendModal.status === 'suspended' ? 'unsuspend' : 'suspend'}{' '}
							<strong style={{ color: '#191C1E' }}>
								{suspendModal.name ?? suspendModal.company}
							</strong>
							?
							{suspendModal.status !== 'suspended' &&
								' This will disable all users under this workspace.'}
						</p>
						<div className="flex gap-2">
							<button
								onClick={() => suspend(suspendModal.id)}
								className="flex-1 py-2.5 rounded-[6px] transition-all"
								style={{
									background: '#FFEFC6',
									color: '#7A4F00',
									fontWeight: 600,
									fontSize: 13,
								}}
							>
								Confirm
							</button>
							<button
								onClick={() => setSuspendModal(null)}
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

			{/* Revoke Modal */}
			{revokeModal && (
				<div
					className="fixed inset-0 flex items-center justify-center z-50"
					style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
				>
					<div
						className="rounded-xl p-6 w-full max-w-md"
						style={{
							background: 'rgba(255,255,255,0.92)',
							backdropFilter: 'blur(20px)',
							boxShadow: SHADOW,
						}}
					>
						<div className="flex items-center gap-3 mb-4">
							<div
								className="w-10 h-10 rounded-full flex items-center justify-center"
								style={{ background: '#FFDAD6' }}
							>
								<AlertTriangle
									className="w-5 h-5"
									style={{ color: '#BA1A1A' }}
								/>
							</div>
							<h3 style={{ color: '#191C1E' }}>Revoke Workspace</h3>
						</div>
						{(revokeModal.activeShipments ?? 0) > 0 && (
							<div
								className="flex items-start gap-2 p-3 rounded-lg mb-4"
								style={{ background: '#FFDAD6' }}
							>
								<AlertTriangle
									className="w-4 h-4 shrink-0 mt-0.5"
									style={{ color: '#BA1A1A' }}
								/>
								<p style={{ fontSize: 13, color: '#BA1A1A' }}>
									Warning: <strong>{revokeModal.name ?? revokeModal.company}</strong> has{' '}
									<strong>
										{revokeModal.activeShipments} active shipment(s)
									</strong>
									. Revoking will affect ongoing operations.
								</p>
							</div>
						)}
						<p
							className="mb-4"
							style={{ fontSize: 14, color: 'rgba(25,28,30,0.6)' }}
						>
							To confirm, type the company name:{' '}
							<strong style={{ color: '#191C1E' }}>
								{revokeModal.name ?? revokeModal.company}
							</strong>
						</p>
						<input
							value={confirmName}
							onChange={(e) => setConfirmName(e.target.value)}
							placeholder="Type company name to confirm"
							className="w-full px-3 h-10 rounded-t-[6px] mb-4 focus:outline-none"
							style={{
								background: '#D5DAE3',
								borderBottom: '2px solid #BA1A1A',
								color: '#191C1E',
								fontSize: 14,
							}}
						/>
						<div className="flex gap-2">
							<button
								onClick={() => revoke(revokeModal.id)}
								disabled={confirmName !== (revokeModal.name ?? revokeModal.company)}
								className="flex-1 py-2.5 text-white rounded-[6px] transition-all disabled:opacity-40"
								style={{ background: '#BA1A1A', fontWeight: 600, fontSize: 13 }}
							>
								Revoke
							</button>
							<button
								onClick={() => {
									setRevokeModal(null);
									setConfirmName('');
								}}
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
