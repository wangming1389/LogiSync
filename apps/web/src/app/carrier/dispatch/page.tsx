'use client';

import {
	AlertTriangle,
	CheckCircle,
	Clock,
	MapPin,
	Navigation,
	Plus,
	Send,
	Truck,
	User,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { updateWorkflowState, useWorkflowState } from '@/lib/workflow-store';

const statusColor: Record<string, string> = {
	pending_dispatch: 'bg-[#FFEFC6] text-[#7A4F00]',
	in_transit: 'bg-[#D3E4F5] text-[#0F4C8A]',
	incident: 'bg-[#FFDAD6] text-[#BA1A1A]',
	delivered: 'bg-[#C8F0D8] text-[#1B6B3A]',
};

export default function DispatchTracking() {
	const [workflow, setWorkflow] = useWorkflowState();
	const [tab, setTab] = useState<'dispatch' | 'tracking' | 'tariffs' | 'quotations'>('dispatch');
	const [dispatchModal, setDispatchModal] = useState<string | null>(null);
	const [selectedVehicle, setSelectedVehicle] = useState('');
	const [selectedDriver, setSelectedDriver] = useState('');
	const [issued, setIssued] = useState<string | null>(null);

	const availableVehicles = useMemo(() => workflow.vehicles.filter((vehicle) => vehicle.status === 'active'), [workflow.vehicles]);
	const availableDrivers = useMemo(() => workflow.drivers.filter((driver) => driver.status === 'available'), [workflow.drivers]);

	function issueTransportOrder(shipmentId: string) {
		const nextState = updateWorkflowState((currentState) => ({
			...currentState,
			shipments: currentState.shipments.map((shipment) =>
				shipment.id === shipmentId
					? { ...shipment, vehicle: selectedVehicle, driver: selectedDriver, status: 'in_transit' }
					: shipment,
			),
		}));

		setWorkflow(nextState);
		setIssued(shipmentId);
		setDispatchModal(null);
		setSelectedVehicle('');
		setSelectedDriver('');
	}

	const gpsTrail = [
		{ time: '06:30', loc: 'Can Tho Warehouse', lat: 10.045, lng: 105.748 },
		{ time: '08:15', loc: 'Cần Thơ Bypass', lat: 10.123, lng: 105.82 },
		{ time: '10:00', loc: 'Vĩnh Long', lat: 10.253, lng: 105.97 },
		{ time: '12:30', loc: 'Tiền Giang', lat: 10.36, lng: 106.365 },
		{ time: '14:00', loc: 'Bình Dương (current)', lat: 10.982, lng: 106.654 },
	];

	return (
		<div className="p-6">
			<h1 className="mb-6" style={{ color: '#191C1E' }}>Dispatch & Tracking</h1>

			<div className="flex gap-1 p-1 rounded-lg mb-6 flex-wrap" style={{ background: '#E0E4EB' }}>
				{[
					{ key: 'dispatch', label: 'Dispatch' },
					{ key: 'tracking', label: 'Real-time Tracking' },
					{ key: 'tariffs', label: 'Tariffs' },
					{ key: 'quotations', label: 'Quotations' },
				].map((item) => (
					<button key={item.key} onClick={() => setTab(item.key as typeof tab)} className="px-4 py-2 rounded-md transition-all" style={{ background: tab === item.key ? '#0F4C8A' : 'transparent', color: tab === item.key ? '#FFFFFF' : 'rgba(25,28,30,0.6)', fontWeight: tab === item.key ? 600 : 400, fontSize: 13 }}>
						{item.label}
					</button>
				))}
			</div>

			{tab === 'dispatch' && (
				<div className="space-y-3">
					{issued && <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700"><CheckCircle className="w-4 h-4" /> Transport order issued for shipment {issued}.</div>}
					{workflow.shipments.map((shipment) => (
						<div key={shipment.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
							<div className="flex items-start justify-between mb-3">
								<div>
									<p className="text-gray-900">{shipment.id} — Order {shipment.orderId}</p>
									<p className="text-sm text-gray-500 mt-0.5">{shipment.cargo}</p>
									<div className="flex items-center gap-2 mt-1 text-xs text-gray-500"><MapPin className="w-3.5 h-3.5" /> {shipment.origin} → {shipment.destination}</div>
								</div>
								<span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[shipment.status]}`}>{shipment.status.replace('_', ' ')}</span>
							</div>
							<div className="flex items-center gap-4 text-xs text-gray-500 mb-3 flex-wrap">
								<span><Truck className="w-3 h-3 inline mr-1" />{shipment.vehicle ? (workflow.vehicles.find((vehicle) => vehicle.id === shipment.vehicle)?.plateNumber ?? shipment.vehicle) : 'Not assigned'}</span>
								<span><User className="w-3 h-3 inline mr-1" />{shipment.driver ? (workflow.drivers.find((driver) => driver.id === shipment.driver)?.name ?? shipment.driver) : 'No driver'}</span>
								<span><Clock className="w-3 h-3 inline mr-1" />ETA: {shipment.eta}</span>
							</div>
							{shipment.status === 'pending_dispatch' && (
								<button onClick={() => setDispatchModal(shipment.id)} className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm">
									<Send className="w-4 h-4" /> Dispatch
								</button>
							)}
							{shipment.status === 'incident' && <div className="flex items-center gap-2 text-sm text-red-600"><AlertTriangle className="w-4 h-4" /> Incident reported - see Incident Management</div>}
						</div>
					))}
				</div>
			)}

			{tab === 'tracking' && (
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
					<div className="lg:col-span-2">
						<div className="bg-gray-200 rounded-xl overflow-hidden" style={{ height: 400 }}>
							<div className="w-full h-full relative flex items-center justify-center bg-gradient-to-br from-blue-100 to-green-100">
								<div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(0deg, #93C5FD 0px, #93C5FD 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, #93C5FD 0px, #93C5FD 1px, transparent 1px, transparent 40px)' }} />
								<div className="relative z-10 text-center">
									<Navigation className="w-12 h-12 text-orange-500 mx-auto mb-2 animate-pulse" />
									<p className="text-gray-700">Real-time GPS Map</p>
									<p className="text-sm text-gray-500 mt-1">SHIP002 - In Transit</p>
								</div>
								{gpsTrail.map((point, index) => (
									<div key={point.time} className="absolute w-3 h-3 rounded-full border-2 border-white" style={{ background: index === gpsTrail.length - 1 ? '#F97316' : '#3B82F6', left: `${15 + index * 15}%`, top: `${60 - index * 8}%` }}>
										{index === gpsTrail.length - 1 && <div className="absolute -top-8 -left-6 bg-orange-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">{point.loc}</div>}
									</div>
								))}
							</div>
						</div>
						<div className="mt-3 bg-white rounded-xl border border-gray-200 shadow-sm p-4">
							<p className="text-sm text-gray-700 mb-1">ETA: <strong>2026-04-14 18:00</strong> · Distance remaining: 142 km</p>
							<p className="text-xs text-gray-500">Last GPS update: 2026-04-13 14:35 · Accuracy: ±8m</p>
						</div>
					</div>
					<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
						<h2 className="text-gray-900 mb-3">Route Playback</h2>
						<p className="text-xs text-gray-500 mb-3">Historical GPS trail - SHIP002</p>
						<div className="space-y-2">
							{gpsTrail.map((point, index) => (
								<div key={point.time} className="flex items-start gap-3">
									<div className="flex flex-col items-center">
										<div className={`w-3 h-3 rounded-full ${index === gpsTrail.length - 1 ? 'bg-orange-500' : 'bg-blue-400'}`} />
										{index < gpsTrail.length - 1 && <div className="w-0.5 h-6 bg-gray-200 mt-1" />}
									</div>
									<div>
										<p className="text-xs text-gray-900">{point.loc}</p>
										<p className="text-xs text-gray-400">{point.time} · {point.lat.toFixed(3)}°N, {point.lng.toFixed(3)}°E</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			)}

			{tab === 'tariffs' && (
				<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
					<div className="flex justify-end p-4 border-b border-gray-200">
						<button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm"><Plus className="w-4 h-4" /> New Tariff</button>
					</div>
					<table className="w-full text-sm">
						<thead className="bg-gray-50 border-b border-gray-200"><tr>{['Name', 'Route', 'Vehicle Type', 'Rate/MT', 'Rate/Km', 'Effective', 'Version', 'Status'].map((heading) => <th key={heading} className="text-left px-4 py-3 text-xs text-gray-500 uppercase">{heading}</th>)}</tr></thead>
						<tbody>
							{workflow.tariffs.map((tariff, index) => (
								<tr key={tariff.id} className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
									<td className="px-4 py-3 text-gray-900">{tariff.name}</td>
									<td className="px-4 py-3 text-gray-600 text-xs">{tariff.route}</td>
									<td className="px-4 py-3 text-gray-600">{tariff.vehicleType}</td>
									<td className="px-4 py-3 text-gray-600">{tariff.ratePerMT ? `₫${tariff.ratePerMT.toLocaleString('vi-VN')}` : '—'}</td>
									<td className="px-4 py-3 text-gray-600">{tariff.ratePerKm ? `₫${tariff.ratePerKm.toLocaleString('vi-VN')}` : '—'}</td>
									<td className="px-4 py-3 text-xs text-gray-500">{tariff.effectiveFrom} → {tariff.effectiveTo}</td>
									<td className="px-4 py-3 text-xs text-gray-500">{tariff.version}</td>
									<td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${tariff.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{tariff.status}</span></td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{tab === 'quotations' && (
				<div className="space-y-3">
					<div className="flex justify-end mb-2"><button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm"><Plus className="w-4 h-4" /> Create Quotation</button></div>
					{workflow.freightQuotations.map((quotation) => (
						<div key={quotation.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
							<div className="flex items-start justify-between mb-2">
								<div>
									<p className="text-gray-900">{quotation.id} — {quotation.buyer}</p>
									<p className="text-xs text-gray-500 mt-0.5">{quotation.route} · {quotation.vehicleType}</p>
								</div>
								<span className={`text-xs px-2 py-0.5 rounded-full ${quotation.status === 'finalized' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{quotation.status}</span>
							</div>
							<div className="flex items-center gap-4 text-sm"><span className="text-gray-900">₫{quotation.totalPrice.toLocaleString('vi-VN')}</span><span className="text-gray-400">·</span><span className="text-gray-500 text-xs">Created: {quotation.createdAt}</span></div>
						</div>
					))}
				</div>
			)}

			{dispatchModal && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
						<h3 className="text-lg text-gray-900 mb-4">Issue Transport Order</h3>
						<p className="text-sm text-gray-500 mb-4">Shipment: <strong>{dispatchModal}</strong></p>
						<div className="space-y-3">
							<div>
								<label className="block text-sm text-gray-700 mb-1">Assign Vehicle</label>
								<select value={selectedVehicle} onChange={(e) => setSelectedVehicle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none bg-white">
									<option value="">Select vehicle...</option>
									{availableVehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.plateNumber} — {vehicle.type}</option>)}
								</select>
							</div>
							<div>
								<label className="block text-sm text-gray-700 mb-1">Assign Driver</label>
								<select value={selectedDriver} onChange={(e) => setSelectedDriver(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none bg-white">
									<option value="">Select driver...</option>
									{availableDrivers.map((driver) => <option key={driver.id} value={driver.id}>{driver.name}</option>)}
								</select>
							</div>
						</div>
						<div className="flex gap-2 mt-4">
							<button onClick={() => issueTransportOrder(dispatchModal)} disabled={!selectedVehicle || !selectedDriver} className="flex-1 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm disabled:opacity-40">Issue Transport Order</button>
							<button onClick={() => setDispatchModal(null)} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-600 text-sm">Cancel</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}