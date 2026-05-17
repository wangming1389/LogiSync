'use client';

import {
	Ban,
	Building2,
	CheckCircle,
	ChevronLeft,
	Eye,
	UserPlus,
	XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const SHADOW = '0px 8px 24px rgba(15,76,138,0.08)';

interface Workspace {
	id: string;
	name: string;
	slug: string;
	type: string;
	status: string;
	taxId: string;
	adminEmail: string;
	createdAt: string;
	registeredAt?: string;
	enabledRoles?: string[];
	roles?: string[];
}

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
			{type?.toUpperCase() || ''}
		</span>
	);
}

function StatusChip({ status }: { status: string }) {
	const map: Record<string, { bg: string; color: string }> = {
		pending: { bg: '#FFEFC6', color: '#7A4F00' },
		active: { bg: '#C8F0D8', color: '#1B6B3A' },
		rejected: { bg: '#FFDAD6', color: '#BA1A1A' },
		revoked: { bg: '#FFDAD6', color: '#BA1A1A' },
		suspended: { bg: '#F2B8B5', color: '#8C1D18' },
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
			{(status === 'revoked' ? 'rejected' : status).toUpperCase()}
		</span>
	);
}

export default function WorkspaceApprovals() {
	const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
	const [selected, setSelected] = useState<string | null>(null);
	const [approveModal, setApproveModal] = useState<string | null>(null);
	const [rejectModal, setRejectModal] = useState<string | null>(null);
	const [rejectReason, setRejectReason] = useState('');
	const [suspendModal, setSuspendModal] = useState<string | null>(null);
	const [suspendReason, setSuspendReason] = useState('');
	const [roleModal, setRoleModal] = useState<string | null>(null);
	const [rolesToEnable, setRolesToEnable] = useState<string[]>([]);

	const [statusFilter, setStatusFilter] = useState('all');

	const fetchWorkspaces = async () => {
		try {
			const query =
				statusFilter !== 'all'
					? `?status=${statusFilter}&limit=100`
					: `?limit=100`;
			const data: any = await api.get('/workspaces' + query);
			if (data?.items) {
				setWorkspaces(data.items);
			}
		} catch (e) {
			console.error('Error fetching workspaces', e);
		}
	};

	useEffect(() => {
		fetchWorkspaces();
	}, [statusFilter]);

	const detail = workspaces.find((w) => w.id === selected);

	async function approve(id: string) {
		const previous = workspaces;
		setWorkspaces((items) =>
			items.map((item) =>
				item.id === id ? { ...item, status: 'active' } : item,
			),
		);
		try {
			await api.patch(`/workspaces/${id}/approve`, {});
			setSelected(null);
			setApproveModal(null);
		} catch (e) {
			console.error(e);
			setWorkspaces(previous);
			alert('Approve failed');
		}
	}

	async function reject(id: string) {
		const previous = workspaces;
		setWorkspaces((items) =>
			items.map((item) =>
				item.id === id ? { ...item, status: 'rejected' } : item,
			),
		);
		try {
			await api.patch(`/workspaces/${id}/reject`, { reason: rejectReason });
			setRejectModal(null);
			setRejectReason('');
			setSelected(null);
		} catch (e) {
			console.error(e);
			setWorkspaces(previous);
			alert('Reject failed');
		}
	}

	async function suspend(id: string) {
		const previous = workspaces;
		setWorkspaces((items) =>
			items.map((item) =>
				item.id === id ? { ...item, status: 'suspended' } : item,
			),
		);
		try {
			await api.patch(`/workspaces/${id}/suspend`, { reason: suspendReason });
			setSuspendModal(null);
			setSuspendReason('');
			setSelected(null);
		} catch (e) {
			console.error(e);
			setWorkspaces(previous);
			alert('Suspend failed');
		}
	}

	async function enableRole(id: string) {
		if (rolesToEnable.length === 0) return;
		try {
			await api.post(`/workspaces/${id}/roles/enable`, { roles: rolesToEnable });
			fetchWorkspaces();
			setRoleModal(null);
			setRolesToEnable([]);
			alert('Role enabled successfully');
		} catch (e) {
			console.error(e);
			alert('Enable role failed');
		}
	}

	return (
		<div className="p-8 max-w-7xl mx-auto min-h-screen">
			{/* Breadcrumb */}
			<div
				className="flex items-center gap-2 mb-6 cursor-pointer"
				style={{ color: '#0F4C8A', fontWeight: 500 }}
			>
				<ChevronLeft size={20} />
				<span>Platform Admin / Workspaces</span>
			</div>

			<div className="mb-6 flex items-center justify-between">
				<h1
					className="text-3xl font-light"
					style={{ color: '#191C1E', letterSpacing: '-0.02em' }}
				>
					Workspace Management
				</h1>
				<select
					className="border rounded p-2 text-sm"
					value={statusFilter}
					onChange={(e) => setStatusFilter(e.target.value)}
				>
					<option value="all">All</option>
					<option value="pending">Pending</option>
					<option value="active">Active</option>
					<option value="suspended">Suspended</option>
					<option value="revoked">Rejected</option>
				</select>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<div className="lg:col-span-2 space-y-4">
					{workspaces.map((w) => (
						<div
							key={w.id}
							className="bg-white rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-shadow"
							onClick={() => setSelected(w.id)}
							style={{
								boxShadow: selected === w.id ? SHADOW : '',
								border:
									selected === w.id
										? '1px solid rgba(15,76,138,0.2)'
										: '1px solid #E0E4EB',
							}}
						>
							<div className="flex gap-4 items-center">
								<div
									className="w-12 h-12 rounded-full flex items-center justify-center"
									style={{ background: '#F8FAFC', color: '#0F4C8A' }}
								>
									<Building2 size={24} />
								</div>
								<div>
									<h3
										className="font-medium text-lg mb-1"
										style={{ color: '#191C1E' }}
									>
										{w.name}
									</h3>
									<div
										className="flex flex-wrap items-center gap-3 text-sm"
										style={{ color: '#40484C' }}
									>
										<span>Tax ID: {w.taxId}</span>
										<span>•</span>
											<span>
												Registered: {new Date(w.registeredAt ?? w.createdAt).toLocaleDateString()}
											</span>
									</div>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<TypeChip type={w.type} />
								<StatusChip status={w.status} />
							</div>
						</div>
					))}
					{workspaces.length === 0 && (
						<div className="text-center p-8 text-gray-500 bg-white border border-gray-200 rounded-xl">
							No workspaces found.
						</div>
					)}
				</div>

				{/* Detail Panel */}
				<div className="lg:col-span-1">
					{detail ? (
						<div
							className="bg-white rounded-xl p-6 sticky top-8"
							style={{ boxShadow: SHADOW, border: '1px solid #E0E4EB' }}
						>
							<div className="flex justify-between items-start mb-6">
								<h2
									className="text-xl font-medium"
									style={{ color: '#191C1E' }}
								>
									Workspace Details
								</h2>
								<StatusChip status={detail.status} />
									<div className="text-xs text-slate-500">
										Enabled roles: {(detail.enabledRoles ?? detail.roles ?? []).join(', ') || 'None'}
									</div>
							</div>

							<div className="space-y-6">
								<div>
									<p className="text-sm mb-1" style={{ color: '#40484C' }}>
										Company Name
									</p>
									<p className="font-medium" style={{ color: '#191C1E' }}>
										{detail.name}
									</p>
								</div>
								<div>
									<p className="text-sm mb-1" style={{ color: '#40484C' }}>
										Slug
									</p>
									<p className="font-medium" style={{ color: '#191C1E' }}>
										{detail.slug}
									</p>
								</div>
								<div>
									<p className="text-sm mb-1" style={{ color: '#40484C' }}>
										Admin Email
									</p>
									<p className="font-medium" style={{ color: '#191C1E' }}>
										{detail.adminEmail}
									</p>
								</div>
								<div>
									<p className="text-sm mb-1" style={{ color: '#40484C' }}>
										Tax ID
									</p>
									<p className="font-medium" style={{ color: '#191C1E' }}>
										{detail.taxId}
									</p>
								</div>
								<div>
									<p className="text-sm mb-1" style={{ color: '#40484C' }}>
										Created At
									</p>
									<p className="font-medium" style={{ color: '#191C1E' }}>
										{new Date(detail.createdAt).toLocaleString()}
									</p>
								</div>

								{detail.status === 'pending' && (
									<div className="pt-6 border-t border-gray-100 flex gap-3">
										<button
											onClick={() => setRejectModal(detail.id)}
											className="flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors"
											style={{
												color: '#BA1A1A',
												border: '1px solid #FFDAD6',
												background: 'transparent',
											}}
										>
											<XCircle size={18} />
											Reject
										</button>
										<button
											onClick={() => setApproveModal(detail.id)}
											className="flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium text-white transition-opacity"
											style={{ background: '#0F4C8A' }}
										>
											<CheckCircle size={18} />
											Approve
										</button>
									</div>
								)}

								{detail.status === 'active' && (
									<div className="pt-6 border-t border-gray-100 flex gap-3 flex-col">
										<button
											onClick={() => setSuspendModal(detail.id)}
											className="w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors"
											style={{
												color: '#BA1A1A',
												border: '1px solid #FFDAD6',
												background: 'transparent',
											}}
										>
											<Ban size={18} />
											Suspend
										</button>
										<button
											onClick={() => setRoleModal(detail.id)}
											className="w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium text-white transition-opacity"
											style={{ background: '#0F4C8A' }}
										>
											<UserPlus size={18} />
											Enable Role
										</button>
									</div>
								)}
							</div>
						</div>
					) : (
						<div
							className="bg-white rounded-xl p-8 text-center flex flex-col items-center justify-center"
							style={{ minHeight: '300px', border: '1px dashed #E0E4EB' }}
						>
							<Eye size={32} color="#72787E" className="mb-4 opacity-50" />
							<p style={{ color: '#40484C' }}>
								Select a workspace to view details
							</p>
						</div>
					)}
				</div>
			</div>

			{/* Approve Modal */}
			{approveModal && (
				<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
					<div
						className="bg-white rounded-2xl p-6 max-w-sm w-full"
						style={{ boxShadow: SHADOW }}
					>
						<h3
							className="text-xl font-medium mb-4"
							style={{ color: '#191C1E' }}
						>
							Approve Workspace
						</h3>
						<p className="text-sm mb-6" style={{ color: '#40484C' }}>
							Confirm this workspace should be activated now.
						</p>
						<div className="flex gap-3 justify-end">
							<button
								onClick={() => setApproveModal(null)}
								className="px-5 py-2 rounded-xl font-medium"
								style={{ color: '#40484C' }}
							>
								Cancel
							</button>
							<button
								onClick={() => approve(approveModal)}
								className="px-5 py-2 rounded-xl text-white font-medium"
								style={{ background: '#0F4C8A' }}
							>
								Confirm
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Reject Modal */}
			{rejectModal && (
				<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
					<div
						className="bg-white rounded-2xl p-6 max-w-md w-full"
						style={{ boxShadow: SHADOW }}
					>
						<h3
							className="text-xl font-medium mb-4"
							style={{ color: '#191C1E' }}
						>
							Reject Workspace Request
						</h3>
						<p className="text-sm mb-4" style={{ color: '#40484C' }}>
							Please provide a reason for rejecting this workspace. This will be
							sent to the applicant.
						</p>
						<textarea
							value={rejectReason}
							onChange={(e) => setRejectReason(e.target.value)}
							className="w-full rounded-xl border p-3 mb-6 min-h-[100px] outline-none"
							style={{ borderColor: '#E0E4EB' }}
							placeholder="Rejection reason..."
						/>
						<div className="flex gap-3 justify-end">
							<button
								onClick={() => {
									setRejectModal(null);
									setRejectReason('');
								}}
								className="px-5 py-2 rounded-xl font-medium"
								style={{ color: '#40484C' }}
							>
								Cancel
							</button>
							<button
								onClick={() => reject(rejectModal)}
								disabled={!rejectReason.trim()}
								className="px-5 py-2 rounded-xl text-white font-medium disabled:opacity-50"
								style={{ background: '#BA1A1A' }}
							>
								Confirm Rejection
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Suspend Modal */}
			{suspendModal && (
				<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
					<div
						className="bg-white rounded-2xl p-6 max-w-md w-full"
						style={{ boxShadow: SHADOW }}
					>
						<h3
							className="text-xl font-medium mb-4"
							style={{ color: '#191C1E' }}
						>
							Suspend Workspace
						</h3>
						<p className="text-sm mb-4" style={{ color: '#40484C' }}>
							Please provide a reason for suspending this workspace.
						</p>
						<textarea
							value={suspendReason}
							onChange={(e) => setSuspendReason(e.target.value)}
							className="w-full rounded-xl border p-3 mb-6 min-h-[100px] outline-none"
							style={{ borderColor: '#E0E4EB' }}
							placeholder="Suspension reason..."
						/>
						<div className="flex gap-3 justify-end">
							<button
								onClick={() => {
									setSuspendModal(null);
									setSuspendReason('');
								}}
								className="px-5 py-2 rounded-xl font-medium"
								style={{ color: '#40484C' }}
							>
								Cancel
							</button>
							<button
								onClick={() => suspend(suspendModal)}
								disabled={!suspendReason.trim()}
								className="px-5 py-2 rounded-xl text-white font-medium disabled:opacity-50"
								style={{ background: '#BA1A1A' }}
							>
								Suspend
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Enable Role Modal */}
			{roleModal && (
				<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
					<div
						className="bg-white rounded-2xl p-6 max-w-md w-full"
						style={{ boxShadow: SHADOW }}
					>
						<h3
							className="text-xl font-medium mb-4"
							style={{ color: '#191C1E' }}
						>
							Enable Additional Role
						</h3>
						<p className="text-sm mb-4" style={{ color: '#40484C' }}>
							Select one or more roles to enable for this workspace.
						</p>
						<div className="space-y-2 mb-4">
							{['carrier_staff', 'hr_staff'].map((role) => (
								<label key={role} className="flex items-center gap-2 rounded-xl border p-3 cursor-pointer" style={{ borderColor: '#E0E4EB' }}>
									<input
										type="checkbox"
										checked={rolesToEnable.includes(role)}
										onChange={(e) =>
											setRolesToEnable((current) =>
												e.target.checked
													? [...current, role]
													: current.filter((item) => item !== role),
											)
										}
									/>
									<span className="text-sm text-slate-700">{role}</span>
								</label>
							))}
						</div>
						<div className="text-sm mb-6" style={{ color: '#40484C' }}>
							Currently enabled: {(detail?.enabledRoles ?? detail?.roles ?? []).join(', ') || 'None'}
						</div>

						<div className="flex gap-3 justify-end">
							<button
								onClick={() => {
									setRoleModal(null);
									setRolesToEnable([]);
								}}
								className="px-5 py-2 rounded-xl font-medium"
								style={{ color: '#40484C' }}
							>
								Cancel
							</button>
							<button
								onClick={() => enableRole(roleModal)}
								disabled={rolesToEnable.length === 0}
								className="px-5 py-2 rounded-xl text-white font-medium disabled:opacity-50"
								style={{ background: '#0F4C8A' }}
							>
								Enable Role
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
