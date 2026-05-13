'use client';
import {
	Activity,
	AlertTriangle,
	CheckCircle,
	Database,
	HardDrive,
	Server,
	Wifi,
	XCircle,
} from 'lucide-react';
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';

const SHADOW = '0px 8px 24px rgba(15,76,138,0.08)';

const uptime = [
	{ time: '00:00', cpu: 32, memory: 45, api: 20 },
	{ time: '04:00', cpu: 28, memory: 44, api: 18 },
	{ time: '08:00', cpu: 65, memory: 62, api: 85 },
	{ time: '10:00', cpu: 78, memory: 68, api: 120 },
	{ time: '12:00', cpu: 82, memory: 71, api: 145 },
	{ time: '14:00', cpu: 75, memory: 69, api: 130 },
	{ time: '16:00', cpu: 70, memory: 67, api: 110 },
	{ time: '18:00', cpu: 55, memory: 60, api: 90 },
	{ time: '20:00', cpu: 40, memory: 52, api: 60 },
	{ time: '22:00', cpu: 35, memory: 48, api: 35 },
];

const services = [
	{
		name: 'API Gateway',
		status: 'operational',
		latency: '24ms',
		uptime: '99.99%',
	},
	{
		name: 'Auth Service',
		status: 'operational',
		latency: '18ms',
		uptime: '99.97%',
	},
	{
		name: 'Order Service',
		status: 'operational',
		latency: '31ms',
		uptime: '99.95%',
	},
	{
		name: 'Notification Service',
		status: 'degraded',
		latency: '234ms',
		uptime: '98.21%',
	},
	{
		name: 'GPS Tracking',
		status: 'operational',
		latency: '45ms',
		uptime: '99.82%',
	},
	{
		name: 'File Storage',
		status: 'operational',
		latency: '67ms',
		uptime: '99.99%',
	},
	{ name: 'Email Service', status: 'outage', latency: 'N/A', uptime: '94.10%' },
	{
		name: 'Database Primary',
		status: 'operational',
		latency: '8ms',
		uptime: '100%',
	},
];

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
	const storage = { used: 284, total: 500, unit: 'GB' };
	const storagePercent = (storage.used / storage.total) * 100;

	const kpis = [
		{
			icon: <Activity className="w-5 h-5" style={{ color: '#0F4C8A' }} />,
			label: 'API REQUESTS/MIN',
			value: '1,247',
			trend: '+12%',
			up: true,
		},
		{
			icon: <Server className="w-5 h-5" style={{ color: '#0F4C8A' }} />,
			label: 'CPU USAGE',
			value: '70%',
			trend: '+5%',
			up: false,
		},
		{
			icon: <Database className="w-5 h-5" style={{ color: '#0F4C8A' }} />,
			label: 'MEMORY USAGE',
			value: '67%',
			trend: '-2%',
			up: true,
		},
		{
			icon: <Wifi className="w-5 h-5" style={{ color: '#0F4C8A' }} />,
			label: 'ACTIVE CONNECTIONS',
			value: '3,482',
			trend: '+8%',
			up: true,
		},
	];

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
						{new Date().toLocaleTimeString('vi-VN')}
					</p>
				</div>
				<span
					className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
					style={{
						background: '#C8F0D8',
						fontSize: 12,
						color: '#1B6B3A',
						fontWeight: 500,
					}}
				>
					<span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
					MOSTLY OPERATIONAL
				</span>
			</div>

			{/* KPI Cards */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
				{kpis.map((card) => (
					<div
						key={card.label}
						className="rounded-xl p-6"
						style={{ background: '#FFFFFF', boxShadow: SHADOW }}
					>
						<div
							className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
							style={{ background: '#F2F4F7' }}
						>
							{card.icon}
						</div>
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

			{/* Storage Quota */}
			<div
				className="rounded-xl p-5"
				style={{ background: '#FFFFFF', boxShadow: SHADOW }}
			>
				<div className="flex items-center justify-between mb-3">
					<div className="flex items-center gap-2">
						<HardDrive className="w-5 h-5" style={{ color: '#0F4C8A' }} />
						<h4 style={{ color: '#191C1E' }}>Storage Quota</h4>
					</div>
					<span style={{ fontSize: 13, color: 'rgba(25,28,30,0.6)' }}>
						{storage.used} / {storage.total} {storage.unit}
					</span>
				</div>
				<div
					className="w-full h-3 rounded-full mb-2"
					style={{ background: '#E0E4EB' }}
				>
					<div
						className="h-3 rounded-full transition-all"
						style={{
							width: `${storagePercent}%`,
							background:
								storagePercent > 80
									? 'linear-gradient(90deg, #BA1A1A, #FF6B6B)'
									: storagePercent > 60
										? 'linear-gradient(90deg, #7A4F00, #F5A623)'
										: 'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)',
						}}
					/>
				</div>
				<p style={{ fontSize: 12, color: 'rgba(25,28,30,0.5)' }}>
					{storagePercent.toFixed(1)}% used · {storage.total - storage.used} GB
					available
				</p>
			</div>

			{/* Performance Chart */}
			<div
				className="rounded-xl p-5"
				style={{ background: '#FFFFFF', boxShadow: SHADOW }}
			>
				<h4 className="mb-4" style={{ color: '#191C1E' }}>
					24h Performance Metrics
				</h4>
				<ResponsiveContainer width="100%" height={220}>
					<AreaChart data={uptime}>
						<defs>
							<linearGradient id="cpu" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#1A6EC4" stopOpacity={0.25} />
								<stop offset="95%" stopColor="#1A6EC4" stopOpacity={0} />
							</linearGradient>
							<linearGradient id="mem" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#00559F" stopOpacity={0.2} />
								<stop offset="95%" stopColor="#00559F" stopOpacity={0} />
							</linearGradient>
						</defs>
						<CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" />
						<XAxis
							dataKey="time"
							tick={{ fontSize: 11, fill: 'rgba(25,28,30,0.5)' }}
						/>
						<YAxis tick={{ fontSize: 11, fill: 'rgba(25,28,30,0.5)' }} />
						<Tooltip
							contentStyle={{
								background: '#fff',
								border: 'none',
								boxShadow: SHADOW,
								borderRadius: 8,
							}}
						/>
						<Area
							type="monotone"
							dataKey="cpu"
							stroke="#1A6EC4"
							fill="url(#cpu)"
							name="CPU %"
						/>
						<Area
							type="monotone"
							dataKey="memory"
							stroke="#00559F"
							fill="url(#mem)"
							name="Memory %"
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>

			{/* Service Status Table */}
			<div
				className="rounded-xl overflow-hidden"
				style={{ background: '#FFFFFF', boxShadow: SHADOW }}
			>
				<div className="px-5 py-4">
					<h4 style={{ color: '#191C1E' }}>Service Status</h4>
				</div>
				<table className="w-full">
					<thead style={{ background: '#F2F4F7' }}>
						<tr>
							{['SERVICE', 'STATUS', 'LATENCY', 'UPTIME (30D)'].map((h) => (
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
						{services.map((s, i) => (
							<tr
								key={s.name}
								className="transition-colors"
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
								<td className="px-5 py-3">
									<div className="flex items-center gap-2">
										<StatusIcon status={s.status} />
										<span style={{ fontSize: 14, color: '#191C1E' }}>
											{s.name}
										</span>
									</div>
								</td>
								<td className="px-5 py-3">
									<StatusChip status={s.status} />
								</td>
								<td
									className="px-5 py-3"
									style={{
										fontFamily: 'monospace',
										fontSize: 13,
										color: 'rgba(25,28,30,0.6)',
									}}
								>
									{s.latency}
								</td>
								<td
									className="px-5 py-3"
									style={{ fontSize: 14, color: 'rgba(25,28,30,0.7)' }}
								>
									{s.uptime}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
