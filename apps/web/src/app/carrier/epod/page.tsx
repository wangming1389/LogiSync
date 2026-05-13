'use client';
import {
	AlertTriangle,
	Camera,
	CheckCircle,
	CheckSquare,
	Circle,
	DollarSign,
	MapPin,
	PenTool,
	Send,
	Upload,
	X,
	XSquare,
} from 'lucide-react';
import { useState } from 'react';
import { ePODData, expenses, incidents } from '@/app/data/mockData';

export default function EPODAndIncidents() {
	const [tab, setTab] = useState<'epod' | 'incidents' | 'expenses'>('epod');
	const [currentStep, setCurrentStep] = useState(2); // Step 2 is current (0-based: step 3 = index 2)
	const [expenseList, setExpenseList] = useState(expenses);
	const [showExpenseForm, setShowExpenseForm] = useState(false);
	const [expForm, setExpForm] = useState({
		type: 'Toll Fee',
		amount: '',
		receipt: '',
	});
	const [showIncidentForm, setShowIncidentForm] = useState(false);
	const [incForm, setIncForm] = useState({ type: 'Accident', description: '' });

	function advanceStep() {
		if (currentStep < 3) setCurrentStep(currentStep + 1);
	}

	function approveExpense(id: string) {
		setExpenseList((es: any) =>
			es.map((e: any) => (e.id === id ? { ...e, status: 'approved' } : e)),
		);
	}
	function rejectExpense(id: string) {
		setExpenseList(
			(es: any) =>
				es.map((e: any) =>
					e.id === id
						? { ...e, status: 'rejected', comment: 'Rejected by manager' }
						: e,
				) as any,
		);
	}

	const stepInfo = ePODData.steps;

	return (
		<div className="p-6">
			<h1 className="text-2xl text-gray-900 mb-6">
				e-POD, Incidents & Expenses
			</h1>

			<div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-6 w-fit">
				{[
					{ key: 'epod', label: 'e-POD' },
					{ key: 'incidents', label: 'Incidents' },
					{ key: 'expenses', label: 'Expenses' },
				].map((t) => (
					<button
						key={t.key}
						onClick={() => setTab(t.key as any)}
						className={`px-4 py-2 rounded-md text-sm transition-all ${tab === t.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
					>
						{t.label}
					</button>
				))}
			</div>

			{tab === 'epod' && (
				<div className="max-w-2xl mx-auto">
					<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
						<div className="mb-5">
							<h2 className="text-gray-900">e-POD: {ePODData.shipmentId}</h2>
							<p className="text-xs text-gray-500 mt-0.5">
								Driver: {ePODData.driver} · Vehicle: {ePODData.vehicle}
							</p>
							<p className="text-xs text-gray-500">Cargo: {ePODData.cargo}</p>
						</div>

						{/* 4-Step Progress */}
						<div className="flex items-center mb-8">
							{stepInfo.map((step, i) => (
								<div
									key={i}
									className="flex items-center flex-1 last:flex-none"
								>
									<div className="flex flex-col items-center">
										<div
											className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
												step.completed
													? 'bg-green-500 border-green-500 text-white'
													: i === currentStep
														? 'bg-orange-500 border-orange-500 text-white animate-pulse'
														: 'bg-white border-gray-300 text-gray-400'
											}`}
										>
											{step.completed ? (
												<CheckCircle className="w-5 h-5" />
											) : i === 0 ? (
												<MapPin className="w-4 h-4" />
											) : i === 1 ? (
												<Camera className="w-4 h-4" />
											) : i === 2 ? (
												<PenTool className="w-4 h-4" />
											) : (
												<Send className="w-4 h-4" />
											)}
										</div>
										<p
											className={`text-xs mt-1.5 text-center max-w-16 ${step.completed ? 'text-green-600' : i === currentStep ? 'text-orange-600' : 'text-gray-400'}`}
										>
											{step.name}
										</p>
										{step.completed && step.timestamp && (
											<p className="text-xs text-gray-400 mt-0.5">
												{step.timestamp.split(' ')[1]}
											</p>
										)}
									</div>
									{i < stepInfo.length - 1 && (
										<div
											className={`flex-1 h-0.5 mx-2 ${step.completed ? 'bg-green-400' : 'bg-gray-200'}`}
										/>
									)}
								</div>
							))}
						</div>

						{/* Current step content */}
						{currentStep < 4 && (
							<div className="border border-gray-200 rounded-xl p-5">
								{currentStep === 0 && (
									<div>
										<h3 className="text-gray-900 mb-3">
											Step 1: Geofence Check-in
										</h3>
										<p className="text-sm text-gray-500 mb-3">
											Must be within 100m of delivery location.
										</p>
										<div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
											<MapPin className="w-4 h-4 text-green-600" />
											<span className="text-sm text-green-700">
												Geofence confirmed: Hanoi Warehouse Zone A
											</span>
										</div>
										<button
											onClick={advanceStep}
											className="px-5 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm"
										>
											Confirm Check-in
										</button>
									</div>
								)}
								{currentStep === 1 && (
									<div>
										<h3 className="text-gray-900 mb-3">
											Step 2: Photo Capture
										</h3>
										<p className="text-sm text-gray-500 mb-3">
											Take photos of cargo upon delivery.
										</p>
										<div className="grid grid-cols-2 gap-3 mb-4">
											{['cargo_001.jpg', 'cargo_002.jpg'].map((f) => (
												<div
													key={f}
													className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300"
												>
													<div className="text-center">
														<Camera className="w-6 h-6 text-gray-400 mx-auto mb-1" />
														<p className="text-xs text-gray-400">{f}</p>
													</div>
												</div>
											))}
										</div>
										<button
											onClick={advanceStep}
											className="px-5 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm"
										>
											Confirm Photos
										</button>
									</div>
								)}
								{currentStep === 2 && (
									<div>
										<h3 className="text-gray-900 mb-3">
											Step 3: Signature Capture
										</h3>
										<p className="text-sm text-gray-500 mb-3">
											Collect recipient signature below.
										</p>
										<div className="w-full h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center mb-4 cursor-crosshair">
											<div className="text-center text-gray-400">
												<PenTool className="w-6 h-6 mx-auto mb-1" />
												<p className="text-xs">Draw signature here</p>
											</div>
										</div>
										<button
											onClick={advanceStep}
											className="px-5 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm"
										>
											Confirm Signature
										</button>
									</div>
								)}
								{currentStep === 3 && (
									<div>
										<h3 className="text-gray-900 mb-3">Step 4: Submit e-POD</h3>
										<div className="space-y-2 mb-4">
											{[
												'Geofence check-in ✓',
												'Photos captured (2) ✓',
												'Signature collected ✓',
											].map((s) => (
												<div
													key={s}
													className="flex items-center gap-2 text-sm text-green-700"
												>
													<CheckCircle className="w-4 h-4" /> {s}
												</div>
											))}
										</div>
										<button
											onClick={() => setCurrentStep(4)}
											className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
										>
											<Send className="w-4 h-4" /> Submit e-POD
										</button>
									</div>
								)}
							</div>
						)}
						{currentStep === 4 && (
							<div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
								<CheckCircle className="w-8 h-8 text-green-500 shrink-0" />
								<div>
									<p className="text-green-800">
										e-POD submitted successfully!
									</p>
									<p className="text-xs text-green-600 mt-0.5">
										Buyer and system notified. Delivery confirmed at{' '}
										{new Date().toLocaleTimeString('vi-VN')}.
									</p>
								</div>
							</div>
						)}
					</div>
				</div>
			)}

			{tab === 'incidents' && (
				<div className="space-y-4 max-w-2xl mx-auto">
					<div className="flex justify-end">
						<button
							onClick={() => setShowIncidentForm(true)}
							className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
						>
							<AlertTriangle className="w-4 h-4" /> Report Incident
						</button>
					</div>
					{incidents.map((inc) => (
						<div
							key={inc.id}
							className="bg-white rounded-xl border border-red-200 shadow-sm p-5"
						>
							<div className="flex items-start justify-between mb-3">
								<div className="flex items-start gap-3">
									<AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
									<div>
										<p className="text-gray-900">
											{inc.type} — {inc.shipmentId}
										</p>
										<p className="text-xs text-gray-500 mt-0.5">
											Driver: {inc.driver} · Vehicle: {inc.vehicle}
										</p>
									</div>
								</div>
								<span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
									{inc.status}
								</span>
							</div>
							<div className="bg-red-50 rounded-lg p-3 mb-3">
								<div className="flex items-center gap-1.5 text-xs text-red-700 mb-1">
									<MapPin className="w-3.5 h-3.5" /> {inc.location}
								</div>
								<p className="text-sm text-gray-700">{inc.description}</p>
							</div>
							<div className="flex items-center gap-3 text-xs text-gray-500">
								<span>
									GPS: {inc.lat}°N, {inc.lng}°E
								</span>
								<span>·</span>
								<span>Reported: {inc.reportedAt}</span>
							</div>
							{inc.photos.length > 0 && (
								<div className="flex gap-2 mt-3">
									{inc.photos.map((p) => (
										<div
											key={p}
											className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded flex items-center gap-1"
										>
											<Camera className="w-3 h-3" /> {p}
										</div>
									))}
								</div>
							)}
						</div>
					))}

					{showIncidentForm && (
						<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
							<div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
								<div className="flex items-center justify-between mb-4">
									<h3 className="text-lg text-gray-900">Report Incident</h3>
									<button onClick={() => setShowIncidentForm(false)}>
										<X className="w-5 h-5 text-gray-400" />
									</button>
								</div>
								<div className="space-y-3">
									<div>
										<label className="block text-sm text-gray-700 mb-1">
											Incident Type
										</label>
										<select
											value={incForm.type}
											onChange={(e) =>
												setIncForm({ ...incForm, type: e.target.value })
											}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none bg-white"
										>
											{[
												'Accident',
												'Breakdown',
												'Theft',
												'Cargo Damage',
												'Other',
											].map((t) => (
												<option key={t}>{t}</option>
											))}
										</select>
									</div>
									<div>
										<label className="block text-sm text-gray-700 mb-1">
											GPS Location (auto)
										</label>
										<input
											readOnly
											value="Auto-detected: 18.3421°N, 105.9058°E"
											className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-500"
										/>
									</div>
									<div>
										<label className="block text-sm text-gray-700 mb-1">
											Description
										</label>
										<textarea
											value={incForm.description}
											onChange={(e) =>
												setIncForm({ ...incForm, description: e.target.value })
											}
											rows={3}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none resize-none"
										/>
									</div>
									<div>
										<label className="block text-sm text-gray-700 mb-1">
											Photos (≤ 5MB)
										</label>
										<div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center text-sm text-gray-400 cursor-pointer hover:border-red-400">
											<Camera className="w-5 h-5 mx-auto mb-1" /> Upload photos
										</div>
									</div>
								</div>
								<div className="flex gap-2 mt-4">
									<button
										onClick={() => setShowIncidentForm(false)}
										className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm"
									>
										Submit Report
									</button>
									<button
										onClick={() => setShowIncidentForm(false)}
										className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-600 text-sm"
									>
										Cancel
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
			)}

			{tab === 'expenses' && (
				<div className="max-w-2xl mx-auto space-y-4">
					<div className="flex justify-end">
						<button
							onClick={() => setShowExpenseForm(true)}
							className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm"
						>
							<DollarSign className="w-4 h-4" /> Submit Expense
						</button>
					</div>
					{expenseList.map((e) => (
						<div
							key={e.id}
							className="bg-white rounded-xl border border-gray-200 shadow-sm p-4"
						>
							<div className="flex items-start justify-between mb-2">
								<div>
									<p className="text-gray-900">
										{e.type} — {e.shipmentId}
									</p>
									<p className="text-xs text-gray-500">
										Driver: {e.driver} · Submitted: {e.submittedAt}
									</p>
								</div>
								<div className="flex items-center gap-2">
									<span
										className={`text-xs px-2 py-0.5 rounded-full ${e.status === 'approved' ? 'bg-green-100 text-green-700' : e.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}
									>
										{e.status}
									</span>
									<span className="text-gray-900">
										₫{e.amount.toLocaleString('vi-VN')}
									</span>
								</div>
							</div>
							{e.receipt ? (
								<div className="text-xs text-blue-600 flex items-center gap-1">
									<Upload className="w-3 h-3" />
									{e.receipt}
								</div>
							) : (
								<div className="text-xs text-red-500">No receipt</div>
							)}
							{e.comment && (
								<p className="text-xs text-red-500 mt-1">{e.comment}</p>
							)}
							{e.status === 'pending' && (
								<div className="flex gap-2 mt-3">
									<button
										onClick={() => approveExpense(e.id)}
										className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700"
									>
										<CheckSquare className="w-3.5 h-3.5" /> Approve
									</button>
									<button
										onClick={() => rejectExpense(e.id)}
										className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700"
									>
										<XSquare className="w-3.5 h-3.5" /> Reject
									</button>
								</div>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
