'use client';
import {
	Activity,
	AlertTriangle,
	Edit2,
	Plus,
	ToggleLeft,
	ToggleRight,
	Truck,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
	Bar,
	BarChart,
	Cell,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import { drivers, vehicles } from '@/app/data/mockData';
import { isDemoWorkspaceSession } from '@/lib/workspace-mode';

type Vehicle = (typeof vehicles)[0] & { status: string };

const statusColor: Record<string, string> = {
	active: 'bg-[#C8F0D8] text-[#1B6B3A]',
	on_trip: 'bg-[#D3E4F5] text-[#0F4C8A]',
	maintenance: 'bg-[#FFEFC6] text-[#7A4F00]',
	inactive: 'bg-[#E0E4EB] text-[#191C1E]',
	incident: 'bg-[#FFDAD6] text-[#BA1A1A]',
};

const statusDotColor: Record<string, string> = {
	active: 'bg-[#1B6B3A]',
	on_trip: 'bg-[#0F4C8A]',
	maintenance: 'bg-[#7A4F00]',
	inactive: 'bg-[#C1C6D4]',
	incident: 'bg-[#BA1A1A]',
};

export default function CarrierFleetClient() {
	const [demoEnabled, setDemoEnabled] = useState(false);
	const [fleet, setFleet] = useState<Vehicle[]>(vehicles);
	const [tab, setTab] = useState<'list' | 'dashboard'>('dashboard');
	const [showForm, setShowForm] = useState(false);

	useEffect(() => {
		if (isDemoWorkspaceSession()) {
			setDemoEnabled(true);
		}
	}, []);

	if (!demoEnabled) {
		return (
			<div className="p-6">
				<h1 style={{ color: '#191C1E' }}>Vehicle Fleet Monitor</h1>
				<p className="mt-2 text-sm text-slate-500">
					No sample fleet data is loaded for newly created workspaces.
				</p>
			</div>
		);
	}

	function toggleActive(id: string) {
		setFleet((fs) =>
			fs.map((v) =>
				v.id === id
					? {
							...v,
							status:
								v.status === 'inactive'
									? 'active'
									: v.status === 'active'
										? 'inactive'
										: v.status,
						}
					: v,
			),
		);
	}

	const statusCounts = [
		'active',
		'on_trip',
		'maintenance',
		'inactive',
		'incident',
	].map((s) => ({
		status: s.replace('_', ' '),
		count: fleet.filter((v) => v.status === s).length,
		color:
			s === 'active'
				? '#22C55E'
				: s === 'on_trip'
					? '#3B82F6'
					: s === 'maintenance'
						? '#EAB308'
						: s === 'incident'
							? '#EF4444'
							: '#9CA3AF',
	}));

	return (
		<div className="p-6">
			<div className="flex items-center justify-between mb-6">
				<h1 style={{ color: '#191C1E' }}>Vehicle Fleet Monitor</h1>
				<button
					onClick={() => setShowForm(true)}
					className="flex items-center gap-2 px-4 py-2.5 text-white rounded-[6px] transition-all hover:brightness-105"
					style={{
						background: 'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)',
						fontWeight: 600,
						fontSize: 12,
						letterSpacing: '0.06em',
					}}
				>
					<Plus className="w-4 h-4" /> ADD VEHICLE
				</button>
			</div>

			<div
				className="flex gap-1 p-1 rounded-lg mb-6 w-fit"
				style={{ background: '#E0E4EB' }}
			>
				{[
					{ key: 'dashboard', label: 'Dashboard' },
					{ key: 'list', label: 'Vehicle List' },
				].map((t) => (
					<button
						key={t.key}
						onClick={() => setTab(t.key as any)}
						className="px-4 py-2 rounded-md transition-all"
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

			{tab === 'dashboard' && (
				<div className="space-y-5">
					{/* Status Overview */}
					<div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
						{statusCounts.map((s) => (
							<div
								key={s.status}
								className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center"
							>
								<span
									className={`w-2.5 h-2.5 rounded-full inline-block mb-2 ${statusDotColor[s.status.replace(' ', '_')]}`}
								/>
								<p className="text-2xl text-gray-900">{s.count}</p>
								<p className="text-xs text-gray-500 capitalize mt-0.5">
									{s.status}
								</p>
							</div>
						))}
					</div>

					{/* Bar Chart */}
					<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
						<h2 className="text-gray-900 mb-4">Fleet Status Distribution</h2>
						<ResponsiveContainer width="100%" height={200}>
							<BarChart data={statusCounts} barSize={40}>
								<XAxis
									dataKey="status"
									tick={{ fontSize: 11, fill: '#6B7280' }}
								/>
								<YAxis
									tick={{ fontSize: 11, fill: '#6B7280' }}
									allowDecimals={false}
								/>
								<Tooltip />
								<Bar dataKey="count" radius={[4, 4, 0, 0]}>
									{statusCounts.map((entry, i) => (
										<Cell key={i} fill={entry.color} />
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</div>

					{/* Vehicles list (compact) */}
					<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
						<div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
							<h2 className="text-gray-900">All Vehicles</h2>
						</div>
						<div className="divide-y divide-gray-100">
							{fleet.map((v) => (
								<div
									key={v.id}
									className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50"
								>
									<span
										className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusDotColor[v.status] ?? 'bg-gray-400'}`}
									/>
									<div className="flex items-center gap-2 w-32">
										<Truck className="w-4 h-4 text-gray-400" />
										<span className="text-sm text-gray-900 font-mono">
											{v.plateNumber}
										</span>
									</div>
									<span className="text-xs text-gray-500 flex-1">{v.type}</span>
									<span className="text-xs text-gray-600 flex-1">
										{v.driver ?? 'No driver'}
									</span>
									<span
										className={`text-xs px-2 py-0.5 rounded-full ${statusColor[v.status]}`}
									>
										{v.status.replace('_', ' ')}
									</span>
									{(v.status === 'active' || v.status === 'inactive') && (
										<button
											onClick={() => toggleActive(v.id)}
											className="text-gray-400 hover:text-orange-500 ml-2"
										>
											{v.status === 'active' ? (
												<ToggleRight className="w-5 h-5 text-green-500" />
											) : (
												<ToggleLeft className="w-5 h-5" />
											)}
										</button>
									)}
									{v.status === 'incident' && (
										<AlertTriangle className="w-4 h-4 text-red-500 ml-2" />
									)}
								</div>
							))}
						</div>
					</div>
				</div>
			)}

			{tab === 'list' && (
				<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
					<table className="w-full text-sm">
						<thead className="bg-gray-50 border-b border-gray-200">
							<tr>
								{[
									'Plate',
									'Type',
									'Status',
									'Driver',
									'Last Maintenance',
									'Next Maintenance',
									'GPS',
									'Toggle',
								].map((h) => (
									<th
										key={h}
										className="text-left px-4 py-3 text-xs text-gray-500 uppercase"
									>
										{h}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{fleet.map((v, i) => (
								<tr
									key={v.id}
									className={`border-b border-gray-100 hover:bg-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}
								>
									<td className="px-4 py-3 font-mono text-sm text-gray-900">
										{v.plateNumber}
									</td>
									<td className="px-4 py-3 text-gray-600">{v.type}</td>
									<td className="px-4 py-3">
										<span
											className={`text-xs px-2 py-0.5 rounded-full ${statusColor[v.status]}`}
										>
											{v.status.replace('_', ' ')}
										</span>
									</td>
									<td className="px-4 py-3 text-gray-600">{v.driver ?? '—'}</td>
									<td className="px-4 py-3 text-gray-500 text-xs">
										{v.lastMaintenance}
									</td>
									<td className="px-4 py-3 text-gray-500 text-xs">
										{v.nextMaintenance}
									</td>
									<td className="px-4 py-3">
										{v.gpsEnabled ? (
											<span className="text-green-500 text-xs">✓ GPS</span>
										) : (
											<span className="text-gray-400 text-xs">No GPS</span>
										)}
									</td>
									<td className="px-4 py-3">
										{(v.status === 'active' || v.status === 'inactive') && (
											<button onClick={() => toggleActive(v.id)}>
												{v.status === 'active' ? (
													<ToggleRight className="w-5 h-5 text-green-500" />
												) : (
													<ToggleLeft className="w-5 h-5 text-gray-400" />
												)}
											</button>
										)}
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
