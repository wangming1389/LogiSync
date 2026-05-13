'use client';
import { AlertTriangle, Edit2, Link2, Plus, Unlink, User } from 'lucide-react';
import { useState } from 'react';
import { drivers, vehicles } from '@/app/data/mockData';

type Driver = (typeof drivers)[0] & { assignedVehicle: string | null };

const statusColor: Record<string, string> = {
	available: 'bg-[#C8F0D8] text-[#1B6B3A]',
	on_trip: 'bg-[#D3E4F5] text-[#0F4C8A]',
	incident: 'bg-[#FFDAD6] text-[#BA1A1A]',
};

export default function DriverManagement() {
	const [driverList, setDriverList] = useState<Driver[]>(drivers);
	const [tab, setTab] = useState<'drivers' | 'assignment'>('drivers');
	const [assignModal, setAssignModal] = useState<string | null>(null);
	const [selectedVehicle, setSelectedVehicle] = useState('');

	const availableVehicles = vehicles.filter(
		(v) => v.status === 'active' && !v.driver,
	);
	const availableDrivers = driverList.filter((d) => d.status === 'available');

	function assign(driverId: string) {
		const vehicle = vehicles.find((v) => v.id === selectedVehicle);
		if (!vehicle) return;
		setDriverList((ds) =>
			ds.map((d) =>
				d.id === driverId ? { ...d, assignedVehicle: selectedVehicle } : d,
			),
		);
		setAssignModal(null);
		setSelectedVehicle('');
	}

	function unassign(driverId: string) {
		setDriverList((ds) =>
			ds.map((d) => (d.id === driverId ? { ...d, assignedVehicle: null } : d)),
		);
	}

	return (
		<div className="p-6">
			<div className="flex items-center justify-between mb-6">
				<h1 style={{ color: '#191C1E' }}>Driver Management</h1>
				<button
					className="flex items-center gap-2 px-4 py-2.5 text-white rounded-[6px] transition-all hover:brightness-105"
					style={{
						background: 'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)',
						fontWeight: 600,
						fontSize: 12,
						letterSpacing: '0.06em',
					}}
				>
					<Plus className="w-4 h-4" /> ADD DRIVER
				</button>
			</div>

			<div
				className="flex gap-1 p-1 rounded-lg mb-6 w-fit"
				style={{ background: '#E0E4EB' }}
			>
				{[
					{ key: 'drivers', label: 'Driver List' },
					{ key: 'assignment', label: 'Vehicle Assignment' },
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

			{tab === 'drivers' && (
				<div
					className="rounded-xl overflow-hidden"
					style={{
						background: '#FFFFFF',
						boxShadow: '0px 8px 24px rgba(15,76,138,0.08)',
					}}
				>
					<table className="w-full">
						<thead style={{ background: '#F2F4F7' }}>
							<tr>
								{[
									'DRIVER',
									'PHONE',
									'LICENSE NO',
									'LICENSE EXPIRY',
									'STATUS',
									'ASSIGNED VEHICLE',
									'EDIT',
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
							{driverList.map((d, i) => (
								<tr
									key={d.id}
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
												className="w-8 h-8 rounded-full flex items-center justify-center"
												style={{ background: '#D3E4F5' }}
											>
												<User
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
												{d.name}
											</span>
										</div>
									</td>
									<td
										className="px-4 py-3"
										style={{ fontSize: 13, color: 'rgba(25,28,30,0.7)' }}
									>
										{d.phone}
									</td>
									<td
										className="px-4 py-3"
										style={{
											fontFamily: 'monospace',
											fontSize: 12,
											color: '#1A6EC4',
										}}
									>
										{d.licenseNo}
									</td>
									<td className="px-4 py-3" style={{ fontSize: 12 }}>
										<span
											style={{
												color:
													new Date(d.licenseExpiry) < new Date('2027-01-01')
														? '#BA1A1A'
														: 'rgba(25,28,30,0.6)',
											}}
										>
											{d.licenseExpiry}
										</span>
									</td>
									<td className="px-4 py-3">
										<span
											className={`px-3 py-1 rounded-full ${statusColor[d.status]}`}
											style={{
												fontSize: 11,
												fontWeight: 500,
												letterSpacing: '0.05em',
											}}
										>
											{d.status.replace('_', ' ').toUpperCase()}
										</span>
									</td>
									<td
										className="px-4 py-3"
										style={{
											fontFamily: 'monospace',
											fontSize: 12,
											color: 'rgba(25,28,30,0.6)',
										}}
									>
										{d.assignedVehicle
											? (vehicles.find((v) => v.id === d.assignedVehicle)
													?.plateNumber ?? d.assignedVehicle)
											: '—'}
									</td>
									<td className="px-4 py-3">
										<button style={{ color: '#1A6EC4' }}>
											<Edit2 className="w-4 h-4" />
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{tab === 'assignment' && (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
					<div
						className="rounded-xl p-5"
						style={{
							background: '#FFFFFF',
							boxShadow: '0px 8px 24px rgba(15,76,138,0.08)',
						}}
					>
						<h4 className="mb-4" style={{ color: '#191C1E' }}>
							Available Drivers ({availableDrivers.length})
						</h4>
						<div className="space-y-2">
							{availableDrivers.map((d) => (
								<div
									key={d.id}
									className="flex items-center justify-between p-3 rounded-lg"
									style={{ background: '#F2F4F7', border: '1px solid #C8F0D8' }}
								>
									<div className="flex items-center gap-2">
										<div
											className="w-7 h-7 rounded-full flex items-center justify-center"
											style={{ background: '#C8F0D8' }}
										>
											<User className="w-4 h-4" style={{ color: '#1B6B3A' }} />
										</div>
										<div>
											<p
												style={{
													fontSize: 14,
													color: '#191C1E',
													fontWeight: 500,
												}}
											>
												{d.name}
											</p>
											<p style={{ fontSize: 12, color: 'rgba(25,28,30,0.5)' }}>
												{d.licenseNo}
											</p>
										</div>
									</div>
									<div className="flex gap-2">
										<button
											onClick={() => {
												setAssignModal(d.id);
												setSelectedVehicle('');
											}}
											className="flex items-center gap-1 px-2 py-1 text-white rounded-[6px]"
											style={{
												background:
													'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)',
												fontSize: 11,
												fontWeight: 500,
											}}
										>
											<Link2 className="w-3.5 h-3.5" /> Assign
										</button>
										{d.assignedVehicle && (
											<button
												onClick={() => unassign(d.id)}
												className="flex items-center gap-1 px-2 py-1 rounded-[6px]"
												style={{
													background: '#D5DAE3',
													color: '#191C1E',
													fontSize: 11,
												}}
											>
												<Unlink className="w-3.5 h-3.5" /> Unassign
											</button>
										)}
									</div>
								</div>
							))}
							{availableDrivers.length === 0 && (
								<p
									className="text-center py-4"
									style={{ fontSize: 14, color: 'rgba(25,28,30,0.4)' }}
								>
									No available drivers
								</p>
							)}
						</div>
					</div>
					<div
						className="rounded-xl p-5"
						style={{
							background: '#FFFFFF',
							boxShadow: '0px 8px 24px rgba(15,76,138,0.08)',
						}}
					>
						<h4 className="mb-4" style={{ color: '#191C1E' }}>
							Available Vehicles ({availableVehicles.length})
						</h4>
						<div className="space-y-2">
							{availableVehicles.map((v) => (
								<div
									key={v.id}
									className="flex items-center justify-between p-3 rounded-lg"
									style={{ background: '#F2F4F7' }}
								>
									<div>
										<p
											style={{
												fontFamily: 'monospace',
												fontSize: 14,
												color: '#191C1E',
												fontWeight: 500,
											}}
										>
											{v.plateNumber}
										</p>
										<p style={{ fontSize: 12, color: 'rgba(25,28,30,0.5)' }}>
											{v.type}
										</p>
									</div>
									<span
										className="px-3 py-1 rounded-full"
										style={{
											background: '#C8F0D8',
											color: '#1B6B3A',
											fontSize: 11,
											fontWeight: 500,
											letterSpacing: '0.05em',
										}}
									>
										AVAILABLE
									</span>
								</div>
							))}
							{availableVehicles.length === 0 && (
								<p
									className="text-center py-4"
									style={{ fontSize: 14, color: 'rgba(25,28,30,0.4)' }}
								>
									No available vehicles
								</p>
							)}
						</div>
					</div>
				</div>
			)}

			{assignModal && (
				<div
					className="fixed inset-0 flex items-center justify-center z-50"
					style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
				>
					<div
						className="rounded-xl p-6 w-full max-w-sm"
						style={{
							background: 'rgba(255,255,255,0.92)',
							backdropFilter: 'blur(20px)',
							boxShadow: '0px 8px 24px rgba(15,76,138,0.08)',
						}}
					>
						<h3 className="mb-4" style={{ color: '#191C1E' }}>
							Assign Vehicle to Driver
						</h3>
						<p
							className="mb-1"
							style={{ fontSize: 13, color: 'rgba(25,28,30,0.6)' }}
						>
							Driver:{' '}
							<strong style={{ color: '#191C1E' }}>
								{driverList.find((d) => d.id === assignModal)?.name}
							</strong>
						</p>
						<p
							className="mb-3"
							style={{ fontSize: 13, color: 'rgba(25,28,30,0.6)' }}
						>
							Select an available vehicle:
						</p>
						{availableVehicles.length === 0 && (
							<p
								className="p-2 rounded mb-3"
								style={{
									fontSize: 12,
									color: '#7A4F00',
									background: '#FFEFC6',
								}}
							>
								No available vehicles at this time.
							</p>
						)}
						<div className="space-y-2 mb-4">
							{availableVehicles.map((v) => (
								<button
									key={v.id}
									onClick={() => setSelectedVehicle(v.id)}
									className="w-full text-left px-4 py-2.5 rounded-lg transition-all"
									style={{
										border: `2px solid ${selectedVehicle === v.id ? '#1A6EC4' : '#E0E4EB'}`,
										background:
											selectedVehicle === v.id ? '#D3E4F5' : 'transparent',
										color: selectedVehicle === v.id ? '#0F4C8A' : '#191C1E',
										fontSize: 14,
									}}
								>
									{v.plateNumber} — {v.type}
								</button>
							))}
						</div>
						<div className="flex gap-2">
							<button
								onClick={() => assign(assignModal)}
								disabled={!selectedVehicle}
								className="flex-1 py-2.5 text-white rounded-[6px] disabled:opacity-40 transition-all hover:brightness-105"
								style={{
									background:
										'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)',
									fontWeight: 600,
									fontSize: 13,
								}}
							>
								Confirm Assign
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
