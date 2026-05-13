'use client';

import { Plus, ToggleLeft, ToggleRight, X } from 'lucide-react';
import { useState } from 'react';
import { commodities, uomList, vehicleTypes } from '../../data/mockData';

const SHADOW = '0px 8px 24px rgba(15,76,138,0.08)';
type Tab = 'commodities' | 'uom' | 'vehicles' | 'boundaries';

function StatusChip({ status }: { status: string }) {
	const active = status === 'active';
	return (
		<span
			className="px-3 py-1 rounded-full"
			style={{
				background: active ? '#C8F0D8' : '#E0E4EB',
				color: active ? '#1B6B3A' : '#191C1E',
				fontSize: 11,
				fontWeight: 500,
				letterSpacing: '0.05em',
			}}
		>
			{status.toUpperCase()}
		</span>
	);
}

export default function DataCatalog() {
	const [tab, setTab] = useState<Tab>('commodities');
	const [items, setItems] = useState({
		commodities,
		uom: uomList,
		vehicles: vehicleTypes,
	});
	const [showAdd, setShowAdd] = useState(false);
	const [newName, setNewName] = useState('');
	const [newCode, setNewCode] = useState('');

	const TABS: { key: Tab; label: string }[] = [
		{ key: 'commodities', label: 'Commodities' },
		{ key: 'uom', label: 'Units of Measure' },
		{ key: 'vehicles', label: 'Vehicle Types' },
		{ key: 'boundaries', label: 'Boundaries' },
	];

	function toggleStatus(
		listKey: 'commodities' | 'uom' | 'vehicles',
		id: string,
	) {
		setItems((prev) => ({
			...prev,
			[listKey]: (prev[listKey] as any[]).map((x: any) =>
				x.id === id
					? { ...x, status: x.status === 'active' ? 'disabled' : 'active' }
					: x,
			),
		}));
	}

	return (
		<div className="p-6">
			<div className="flex items-center justify-between mb-6">
				<div>
					<h1 style={{ color: '#191C1E' }}>Shared Data Catalog</h1>
					<p
						style={{ fontSize: 13, color: 'rgba(25,28,30,0.55)', marginTop: 2 }}
					>
						Manage platform-wide reference data
					</p>
				</div>
				<button
					onClick={() => setShowAdd(true)}
					className="flex items-center gap-2 px-4 py-2.5 text-white rounded-[6px] transition-all hover:brightness-105"
					style={{
						background: 'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)',
						fontWeight: 600,
						fontSize: 12,
						letterSpacing: '0.06em',
					}}
				>
					<Plus className="w-4 h-4" /> ADD ITEM
				</button>
			</div>

			{/* Tabs */}
			<div
				className="flex gap-1 p-1 rounded-lg mb-6 w-fit"
				style={{ background: '#E0E4EB' }}
			>
				{TABS.map((t) => (
					<button
						key={t.key}
						onClick={() => setTab(t.key)}
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

			{/* Commodities */}
			{tab === 'commodities' && (
				<div
					className="rounded-xl overflow-hidden"
					style={{ background: '#FFFFFF', boxShadow: SHADOW }}
				>
					<table className="w-full">
						<thead style={{ background: '#F2F4F7' }}>
							<tr>
								{['CODE', 'NAME', 'CATEGORY', 'ADDED', 'STATUS', 'TOGGLE'].map(
									(h) => (
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
									),
								)}
							</tr>
						</thead>
						<tbody>
							{items.commodities.map((c, i) => (
								<tr
									key={c.id}
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
										style={{
											fontFamily: 'monospace',
											fontSize: 12,
											color: '#1A6EC4',
										}}
									>
										{c.code}
									</td>
									<td
										className="px-5 py-3"
										style={{ fontSize: 14, color: '#191C1E', fontWeight: 500 }}
									>
										{c.name}
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
											{c.category.toUpperCase()}
										</span>
									</td>
									<td
										className="px-5 py-3"
										style={{ fontSize: 12, color: 'rgba(25,28,30,0.5)' }}
									>
										{c.addedAt}
									</td>
									<td className="px-5 py-3">
										<StatusChip status={c.status} />
									</td>
									<td className="px-5 py-3">
										<button onClick={() => toggleStatus('commodities', c.id)}>
											{c.status === 'active' ? (
												<ToggleRight
													className="w-5 h-5"
													style={{ color: '#1B6B3A' }}
												/>
											) : (
												<ToggleLeft
													className="w-5 h-5"
													style={{ color: 'rgba(25,28,30,0.3)' }}
												/>
											)}
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{/* UoM */}
			{tab === 'uom' && (
				<div
					className="rounded-xl overflow-hidden"
					style={{ background: '#FFFFFF', boxShadow: SHADOW }}
				>
					<table className="w-full">
						<thead style={{ background: '#F2F4F7' }}>
							<tr>
								{['CODE', 'NAME', 'STATUS', 'TOGGLE'].map((h) => (
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
							{items.uom.map((u, i) => (
								<tr
									key={u.id}
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
										style={{
											fontFamily: 'monospace',
											fontSize: 12,
											color: '#1A6EC4',
										}}
									>
										{u.code}
									</td>
									<td
										className="px-5 py-3"
										style={{ fontSize: 14, color: '#191C1E', fontWeight: 500 }}
									>
										{u.name}
									</td>
									<td className="px-5 py-3">
										<StatusChip status={u.status} />
									</td>
									<td className="px-5 py-3">
										<button onClick={() => toggleStatus('uom', u.id)}>
											{u.status === 'active' ? (
												<ToggleRight
													className="w-5 h-5"
													style={{ color: '#1B6B3A' }}
												/>
											) : (
												<ToggleLeft
													className="w-5 h-5"
													style={{ color: 'rgba(25,28,30,0.3)' }}
												/>
											)}
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{/* Vehicle Types */}
			{tab === 'vehicles' && (
				<div
					className="rounded-xl overflow-hidden"
					style={{ background: '#FFFFFF', boxShadow: SHADOW }}
				>
					<table className="w-full">
						<thead style={{ background: '#F2F4F7' }}>
							<tr>
								{['CODE', 'NAME', 'CAPACITY', 'STATUS', 'TOGGLE'].map((h) => (
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
							{items.vehicles.map((v, i) => (
								<tr
									key={v.id}
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
										style={{
											fontFamily: 'monospace',
											fontSize: 12,
											color: '#1A6EC4',
										}}
									>
										{v.code}
									</td>
									<td
										className="px-5 py-3"
										style={{ fontSize: 14, color: '#191C1E', fontWeight: 500 }}
									>
										{v.name}
									</td>
									<td
										className="px-5 py-3"
										style={{ fontSize: 14, color: 'rgba(25,28,30,0.7)' }}
									>
										{v.capacity} {v.unit}
									</td>
									<td className="px-5 py-3">
										<StatusChip status={v.status} />
									</td>
									<td className="px-5 py-3">
										<button onClick={() => toggleStatus('vehicles', v.id)}>
											{v.status === 'active' ? (
												<ToggleRight
													className="w-5 h-5"
													style={{ color: '#1B6B3A' }}
												/>
											) : (
												<ToggleLeft
													className="w-5 h-5"
													style={{ color: 'rgba(25,28,30,0.3)' }}
												/>
											)}
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{/* Boundaries */}
			{tab === 'boundaries' && (
				<div
					className="rounded-xl p-8 text-center"
					style={{ background: '#FFFFFF', boxShadow: SHADOW }}
				>
					<p style={{ fontSize: 14, color: 'rgba(25,28,30,0.5)' }}>
						Geographic boundary management (provinces, districts) â€” region
						data loaded from shapefile
					</p>
					<div
						className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg"
						style={{
							background: '#F2F4F7',
							fontSize: 13,
							color: 'rgba(25,28,30,0.6)',
						}}
					>
						63 provinces Â· 705 districts Â· active
					</div>
				</div>
			)}

			{/* Add Modal */}
			{showAdd && (
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
						<div className="flex items-center justify-between mb-4">
							<h3 style={{ color: '#191C1E' }}>Add New Item</h3>
							<button onClick={() => setShowAdd(false)}>
								<X
									className="w-5 h-5"
									style={{ color: 'rgba(25,28,30,0.4)' }}
								/>
							</button>
						</div>
						<div className="space-y-3">
							<div>
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
									NAME
								</label>
								<input
									value={newName}
									onChange={(e) => setNewName(e.target.value)}
									className="w-full px-3 h-10 rounded-t-[6px] focus:outline-none"
									style={{
										background: '#D5DAE3',
										borderBottom: '2px solid #00559F',
										color: '#191C1E',
										fontSize: 14,
									}}
								/>
							</div>
							<div>
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
									CODE
								</label>
								<input
									value={newCode}
									onChange={(e) => setNewCode(e.target.value.toUpperCase())}
									className="w-full px-3 h-10 rounded-t-[6px] focus:outline-none font-mono"
									style={{
										background: '#D5DAE3',
										borderBottom: '2px solid #00559F',
										color: '#191C1E',
										fontSize: 14,
									}}
								/>
							</div>
						</div>
						<div className="flex gap-2 mt-4">
							<button
								onClick={() => {
									setShowAdd(false);
									setNewName('');
									setNewCode('');
								}}
								className="flex-1 py-2.5 text-white rounded-[6px] transition-all hover:brightness-105"
								style={{
									background:
										'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)',
									fontWeight: 600,
									fontSize: 13,
								}}
							>
								Add
							</button>
							<button
								onClick={() => setShowAdd(false)}
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
