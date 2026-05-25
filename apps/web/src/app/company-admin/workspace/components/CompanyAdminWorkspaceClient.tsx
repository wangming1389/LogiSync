'use client';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { getStoredAccessToken, parseJwtClaims } from '@/lib/auth';

const SHADOW = '0px 8px 24px rgba(15,76,138,0.08)';

type Workspace = {
	id: string;
	name: string;
	slug: string;
	type: string;
	status: string;
	taxId?: string;
	adminEmail?: string;
	createdAt?: string;
	registeredAt?: string;
	enabledRoles?: string[];
	roles?: string[];
};

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
	const map: Record<string, { bg: string; color: string; label: string }> = {
		operational: { bg: '#C8F0D8', color: '#1B6B3A', label: 'OPERATIONAL' },
		degraded: { bg: '#FFEFC6', color: '#7A4F00', label: 'DEGRADED' },
		outage: { bg: '#FFDAD6', color: '#BA1A1A', label: 'OUTAGE' },
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

function StatusIcon({ status }: { status: string }) {
	if (status === 'operational')
		return <CheckCircle className="w-4 h-4" style={{ color: '#1B6B3A' }} />;
	if (status === 'degraded')
		return <AlertTriangle className="w-4 h-4" style={{ color: '#7A4F00' }} />;
	return <XCircle className="w-4 h-4" style={{ color: '#BA1A1A' }} />;
}

export default function CompanyAdminWorkspaceClient() {
	const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
	const [loadError, setLoadError] = useState('');
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let mounted = true;
		const token = getStoredAccessToken();
		const claims = token ? parseJwtClaims(token) : null;
		const currentWorkspaceId =
			typeof claims?.workspaceId === 'string' ? claims.workspaceId : undefined;

		(async () => {
			try {
				const response: any = await api.get('/workspaces?limit=100');
				// API returns { success, data: [...] , meta: {...} }
				const payload = response?.data?.data ?? response?.data ?? response;
				const items = Array.isArray(payload) ? payload : (payload?.items ?? []);
				if (!mounted) return;
				setWorkspaces(Array.isArray(items) ? items : []);
				setLoadError('');
			} catch (error) {
				if (!mounted) return;
				setLoadError(
					error instanceof Error ? error.message : 'Không tải được workspace',
				);
			} finally {
				if (mounted) setLoading(false);
			}
		})();

		return () => {
			mounted = false;
		};
	}, []);

	const token =
		typeof window !== 'undefined' ? getStoredAccessToken() : undefined;
	const claims = token ? parseJwtClaims(token) : null;
	const currentWorkspaceId =
		typeof claims?.workspaceId === 'string' ? claims.workspaceId : undefined;
	const currentWorkspaceSlug =
		typeof claims?.workspaceSlug === 'string'
			? claims.workspaceSlug
			: undefined;
	const workspace = useMemo(() => {
		return (
			workspaces.find((item) => item.id === currentWorkspaceId) ??
			workspaces.find((item) => item.slug === currentWorkspaceSlug) ??
			workspaces[0] ??
			null
		);
	}, [currentWorkspaceId, currentWorkspaceSlug, workspaces]);

	const activeRoles = workspace?.enabledRoles ?? workspace?.roles ?? [];
	const status = workspace?.status ?? 'unknown';
	const registeredAt = workspace?.registeredAt ?? workspace?.createdAt ?? '';

	return (
		<div className="p-6 space-y-6">
			{/* Page Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 style={{ color: '#191C1E' }}>Workspace Dashboard</h1>
					<p
						style={{ fontSize: 13, color: 'rgba(25,28,30,0.6)', marginTop: 2 }}
					>
						Real-time workspace overview · Last updated:{' '}
						{new Date().toLocaleTimeString('vi-VN')}
					</p>
					{loadError ? (
						<p style={{ fontSize: 13, color: '#BA1A1A', marginTop: 4 }}>
							{loadError}
						</p>
					) : null}
				</div>
				<span
					className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
					style={{
						background: status === 'active' ? '#C8F0D8' : '#FFEFC6',
						fontSize: 12,
						color: status === 'active' ? '#1B6B3A' : '#7A4F00',
						fontWeight: 500,
					}}
				>
					<span
						className="w-2 h-2 rounded-full animate-pulse"
						style={{
							background: status === 'active' ? '#1B6B3A' : '#7A4F00',
						}}
					/>
					{status.toUpperCase()}
				</span>
			</div>

			<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
				{[
					{
						label: 'Workspace ID',
						value: workspace?.id ?? '—',
						trend: 'Current tenant',
						up: true,
					},
					{
						label: 'Workspace Type',
						value: workspace?.type?.toUpperCase() ?? '—',
						trend: 'Registered type',
						up: true,
					},
					{
						label: 'Enabled Roles',
						value: String(activeRoles.length),
						trend: activeRoles.join(', ') || 'None',
						up: activeRoles.length > 0,
					},
					{
						label: 'Registered At',
						value: registeredAt
							? new Date(registeredAt).toLocaleDateString('vi-VN')
							: '—',
						trend: 'From /workspaces',
						up: true,
					},
				].map((card) => (
					<div
						key={card.label}
						className="rounded-xl p-6"
						style={{ background: '#FFFFFF', boxShadow: SHADOW }}
					>
						<p
							style={{
								fontSize: 11,
								fontWeight: 500,
								letterSpacing: '0.05em',
								textTransform: 'uppercase',
								color: 'rgba(25,28,30,0.6)',
							}}
						>
							{card.label}
						</p>
						<p
							style={{
								fontSize: card.label === 'Enabled Roles' ? 20 : 28,
								fontWeight: 700,
								letterSpacing: '-0.02em',
								color: '#191C1E',
								marginTop: 4,
							}}
						>
							{card.value}
						</p>
						<p
							style={{
								fontSize: 12,
								color: card.up ? '#1B6B3A' : '#BA1A1A',
								marginTop: 4,
							}}
						>
							{card.trend}
						</p>
					</div>
				))}
			</div>

			<div
				className="rounded-xl p-5"
				style={{ background: '#FFFFFF', boxShadow: SHADOW }}
			>
				<div className="flex items-center justify-between mb-3">
					<div>
						<h4 style={{ color: '#191C1E' }}>Workspace Summary</h4>
						<p
							style={{
								fontSize: 13,
								color: 'rgba(25,28,30,0.6)',
								marginTop: 2,
							}}
						>
							Workspace detail is loaded from the Workspace API and matched by
							the JWT workspaceId.
						</p>
					</div>
					<TypeChip type={workspace?.type ?? 'unknown'} />
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					{[
						['Name', workspace?.name ?? '—'],
						['Slug', workspace?.slug ?? '—'],
						['Tax ID', workspace?.taxId ?? '—'],
						['Admin Email', workspace?.adminEmail ?? '—'],
					].map(([label, value]) => (
						<div
							key={label}
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
								{label}
							</p>
							<p style={{ fontSize: 14, color: '#191C1E', marginTop: 4 }}>
								{String(value)}
							</p>
						</div>
					))}
				</div>
				{loading ? (
					<p className="mt-4 text-sm text-slate-500">
						Loading workspace data...
					</p>
				) : null}
			</div>

			<div
				className="rounded-xl p-5"
				style={{ background: '#FFFFFF', boxShadow: SHADOW }}
			>
				<h4 className="mb-4" style={{ color: '#191C1E' }}>
					Enabled Roles
				</h4>
				<div className="flex flex-wrap gap-2">
					{activeRoles.length > 0 ? (
						activeRoles.map((role) => (
							<span
								key={role}
								className="px-3 py-1 rounded-full"
								style={{
									background: '#D3E4F5',
									color: '#0F4C8A',
									fontSize: 12,
									fontWeight: 500,
								}}
							>
								{role}
							</span>
						))
					) : (
						<p className="text-sm text-slate-500">
							No enabled roles found for this workspace.
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
