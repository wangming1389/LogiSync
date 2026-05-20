
'use client';
import { useEffect, useMemo, useState } from 'react';
import {
	AlertTriangle,
	CheckCircle,
	XCircle,
} from 'lucide-react';
import { api } from '@/lib/api';

const SHADOW = '0px 8px 24px rgba(15,76,138,0.08)';

type HealthEnvelope<T> = {
	success: boolean;
	data: T;
	error: string | null;
	meta?: {
		path?: string;
		method?: string;
		timestamp?: string;
	};
};

type HealthDetails = {
	database: boolean;
	redis: boolean;
	objectStorage: boolean;
	messageQueue: boolean;
	timestamp?: number;
	degraded?: boolean;
};

type HealthStatus = {
	status: 'healthy' | 'degraded' | 'unavailable' | string;
	details: HealthDetails;
	timestamp: string;
};

type ReadyStatus = {
	ready: boolean;
	timestamp: string;
};

type LiveStatus = {
	alive: boolean;
	timestamp: string;
};

type ServiceRow = {
	name: string;
	status: 'operational' | 'degraded' | 'outage';
	latency: string;
	uptime: string;
};

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

export default function SystemHealth() {
	const [health, setHealth] = useState<HealthStatus | null>(null);
	const [ready, setReady] = useState<ReadyStatus | null>(null);
	const [live, setLive] = useState<LiveStatus | null>(null);
	const [error, setError] = useState('');
	const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

	useEffect(() => {
		let active = true;

		const refreshHealth = async () => {
			try {
				setError('');
				const [healthRes, readyRes, liveRes] = await Promise.all([
					api.get<HealthEnvelope<HealthStatus>>('/health'),
					api.get<HealthEnvelope<ReadyStatus>>('/health/ready'),
					api.get<HealthEnvelope<LiveStatus>>('/health/live'),
				]);

				if (!active) return;

				// apiFetch wraps response.json() into { data: json }
				// and the server also returns an envelope { success, data, error, meta }
				// so the actual payload is at healthRes.data.data
				setHealth((healthRes as any)?.data?.data ?? (healthRes as any)?.data ?? null);
				setReady((readyRes as any)?.data?.data ?? (readyRes as any)?.data ?? null);
				setLive((liveRes as any)?.data?.data ?? (liveRes as any)?.data ?? null);
				setLastUpdated(new Date());
			} catch (fetchError) {
				if (!active) return;
				setError(
					fetchError instanceof Error
						? fetchError.message
						: 'Không tải được trạng thái hệ thống',
				);
			}
		};

		void refreshHealth();
		const intervalId = window.setInterval(() => {
			void refreshHealth();
		}, 30000);

		return () => window.clearInterval(intervalId);
	}, []);

	const services = useMemo<ServiceRow[]>(() => {
		if (!health) return [];

		const details = health.details;
		const dependencyRows: ServiceRow[] = [
			{
				name: 'Database Primary',
				status: details.database ? 'operational' : 'outage',
				latency: details.database ? 'OK' : 'Down',
				uptime: details.database ? 'Healthy' : 'Unavailable',
			},
			{
				name: 'Redis Session Store',
				status: details.redis ? 'operational' : 'outage',
				latency: details.redis ? 'OK' : 'Down',
				uptime: details.redis ? 'Healthy' : 'Unavailable',
			},
			{
				name: 'Object Storage',
				status: details.objectStorage ? 'operational' : 'outage',
				latency: details.objectStorage ? 'OK' : 'Down',
				uptime: details.objectStorage ? 'Healthy' : 'Unavailable',
			},
			{
				name: 'Message Queue',
				status: details.messageQueue ? 'operational' : 'degraded',
				latency: details.messageQueue ? 'OK' : 'Degraded',
				uptime: details.messageQueue ? 'Healthy' : 'Degraded',
			},
		];

		return dependencyRows;
	}, [health]);

	const healthyDependencies = services.filter((service) => service.status === 'operational').length;
	const degradedDependencies = services.filter((service) => service.status !== 'operational').length;
	const overallStatus = health?.status ?? 'unknown';

	return (
		<div className="p-6 space-y-6">
			{/* Page Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 style={{ color: '#191C1E' }}>System Health Dashboard</h1>
					<p
						style={{ fontSize: 13, color: 'rgba(25,28,30,0.6)', marginTop: 2 }}
					>
						Real-time platform status · Last updated:{' '}
						{lastUpdated ? lastUpdated.toLocaleTimeString('vi-VN') : 'Loading...'}
					</p>
					{error ? (
						<p style={{ fontSize: 13, color: '#BA1A1A', marginTop: 4 }}>
							{error}
						</p>
					) : null}
				</div>
				<span
					className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
					style={{
						background:
							overallStatus === 'healthy' ? '#C8F0D8' : '#FFEFC6',
						fontSize: 12,
						color: overallStatus === 'healthy' ? '#1B6B3A' : '#7A4F00',
						fontWeight: 500,
					}}
				>
					<span
						className="w-2 h-2 rounded-full animate-pulse"
						style={{
							background: overallStatus === 'healthy' ? '#1B6B3A' : '#7A4F00',
						}}
					/>
					{overallStatus.toUpperCase()}
				</span>
			</div>

			<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
				{[
					{ label: 'Dependencies monitored', value: '4', trend: 'Live checks', up: true },
					{ label: 'Healthy dependencies', value: String(healthyDependencies), trend: ready?.ready ? 'Ready' : 'Not ready', up: ready?.ready ?? false },
					{ label: 'Degraded dependencies', value: String(degradedDependencies), trend: live?.alive ? 'Alive' : 'Not alive', up: !(live?.alive === false) },
					{ label: 'Last backend timestamp', value: health?.timestamp ? new Date(health.timestamp).toLocaleTimeString('vi-VN') : '--', trend: 'Polled every 30s', up: true },
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
								fontSize: 28,
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
				<div className="flex items-center justify-between mb-4">
					<h4 style={{ color: '#191C1E' }}>Dependency Status</h4>
					<span style={{ fontSize: 13, color: 'rgba(25,28,30,0.6)' }}>
						Polled from /health, /health/ready, /health/live
					</span>
				</div>
				<table className="w-full">
					<thead style={{ background: '#F2F4F7' }}>
						<tr>
							{['SERVICE', 'STATUS', 'READY', 'ALIVE'].map((h) => (
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
						{services.map((service, index) => (
							<tr
								key={service.name}
								className="transition-colors"
								style={{ background: index % 2 === 1 ? '#F7F9FC' : '#FFFFFF' }}
							>
								<td className="px-5 py-3">
									<div className="flex items-center gap-2">
										<StatusIcon status={service.status} />
										<span style={{ fontSize: 14, color: '#191C1E' }}>
											{service.name}
										</span>
									</div>
								</td>
								<td className="px-5 py-3">
									<StatusChip status={service.status} />
								</td>
								<td className="px-5 py-3" style={{ fontSize: 14, color: 'rgba(25,28,30,0.7)' }}>
									{ready?.ready ? 'YES' : 'NO'}
								</td>
								<td className="px-5 py-3" style={{ fontSize: 14, color: 'rgba(25,28,30,0.7)' }}>
									{live?.alive ? 'YES' : 'NO'}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div
				className="rounded-xl overflow-hidden"
				style={{ background: '#FFFFFF', boxShadow: SHADOW }}
			>
				<div className="px-5 py-4">
					<h4 style={{ color: '#191C1E' }}>Live Health Payload</h4>
				</div>
				<div className="px-5 pb-5">
					<pre
						className="rounded-xl p-4 overflow-auto"
						style={{ background: '#F7F9FC', color: '#191C1E', fontSize: 12 }}
					>
{JSON.stringify(
	health && ready && live
		? {
			health,
			ready,
			live,
		  }
		: { message: 'Waiting for initial health check...' },
	null,
	2,
)}
					</pre>
				</div>
			</div>
		</div>
	);
}
