'use client';
import {
	Download,
	Edit2,
	Plus,
	Target,
	ToggleLeft,
	ToggleRight,
	TrendingUp,
	User,
	X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { employees, kpiData } from '@/app/data/mockData';
import { isDemoWorkspaceSession } from '@/lib/workspace-mode';

type Employee = (typeof employees)[0] & { status: string };

const deptColor: Record<string, string> = {
	Sales: 'bg-green-100 text-green-700',
	Accounting: 'bg-blue-100 text-blue-700',
	Driver: 'bg-orange-100 text-orange-700',
	Operations: 'bg-purple-100 text-purple-700',
	HR: 'bg-pink-100 text-pink-700',
};

export default function HRManagement() {
	const [demoEnabled, setDemoEnabled] = useState(false);
	const [tab, setTab] = useState<'employees' | 'kpi'>('employees');
	const [empList, setEmpList] = useState<Employee[]>(employees);
	const [kpiList, setKpiList] = useState(kpiData);
	const [showForm, setShowForm] = useState(false);
	const [editEmp, setEditEmp] = useState<Partial<Employee> | null>(null);
	const [deactivateModal, setDeactivateModal] = useState<string | null>(null);
	const [deptFilter, setDeptFilter] = useState('All');
	const [periodFilter, setPeriodFilter] = useState('Q1 2026');
	const [showKPIForm, setShowKPIForm] = useState(false);

	useEffect(() => {
		if (isDemoWorkspaceSession()) setDemoEnabled(true);
	}, []);

	if (!demoEnabled) {
		return (
			<div className="p-6">
				<h1 className="text-2xl text-gray-900">User Management</h1>
				<p className="mt-2 text-sm text-slate-500">
					No sample user data is loaded for newly created workspaces.
				</p>
			</div>
		);
	}

	const depts = ['All', 'Sales', 'Accounting', 'Driver', 'Operations', 'HR'];
	const filteredEmps =
		deptFilter === 'All'
			? empList
			: empList.filter((e) => e.department === deptFilter);
	const filteredKPIs =
		periodFilter === 'All'
			? kpiList
			: kpiList.filter((k) => k.period === periodFilter);

	function toggleStatus(id: string) {
		setEmpList((es) =>
			es.map((e) =>
				e.id === id
					? { ...e, status: e.status === 'active' ? 'inactive' : 'active' }
					: e,
			),
		);
		setDeactivateModal(null);
	}

	const kpiStatusColor: Record<string, string> = {
		exceeded: 'bg-green-100 text-green-700',
		on_track: 'bg-blue-100 text-blue-700',
		below_target: 'bg-red-100 text-red-700',
	};

	return (
		<div className="p-6">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl text-gray-900">HR Management</h1>
				{tab === 'employees' && (
					<button
						onClick={() => {
							setEditEmp({
								name: '',
								email: '',
								phone: '',
								department: 'Sales',
								role: 'Sales Staff',
								status: 'active',
								idCard: '',
							});
							setShowForm(true);
						}}
						className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
					>
						<Plus className="w-4 h-4" /> Add Employee
					</button>
				)}
				{tab === 'kpi' && (
					<button
						onClick={() => setShowKPIForm(true)}
						className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
					>
						<Target className="w-4 h-4" /> Set KPI Target
					</button>
				)}
			</div>

			<div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-6 w-fit">
				{[
					{ key: 'employees', label: 'Employee Management' },
					{ key: 'kpi', label: 'KPI Management' },
				].map((t) => (
					<button
						key={t.key}
						onClick={() => setTab(t.key as any)}
						className={`px-5 py-2 rounded-md text-sm transition-all ${tab === t.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
					>
						{t.label}
					</button>
				))}
			</div>

			{tab === 'employees' && (
				<>
					<div className="flex gap-2 mb-4 flex-wrap">
						{depts.map((d) => (
							<button
								key={d}
								onClick={() => setDeptFilter(d)}
								className={`px-3 py-1.5 rounded-full text-sm ${deptFilter === d ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
							>
								{d}
							</button>
						))}
					</div>
					<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
						<table className="w-full text-sm">
							<thead className="bg-gray-50 border-b border-gray-200">
								<tr>
									{[
										'Employee',
										'Department',
										'Role',
										'Contact',
										'Status',
										'Join Date',
										'Actions',
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
								{filteredEmps.map((e, i) => (
									<tr
										key={e.id}
										className={`border-b border-gray-100 hover:bg-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}
									>
										<td className="px-4 py-3">
											<div className="flex items-center gap-2">
												<div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
													<User className="w-4 h-4 text-purple-600" />
												</div>
												<div>
													<p className="text-gray-900">{e.name}</p>
													<p className="text-xs text-gray-400">{e.email}</p>
												</div>
											</div>
										</td>
										<td className="px-4 py-3">
											<span
												className={`text-xs px-2 py-0.5 rounded-full ${deptColor[e.department] ?? 'bg-gray-100 text-gray-600'}`}
											>
												{e.department}
											</span>
										</td>
										<td className="px-4 py-3 text-gray-600 text-xs">
											{e.role}
										</td>
										<td className="px-4 py-3 text-gray-500 text-xs">
											{e.phone}
										</td>
										<td className="px-4 py-3">
											<span
												className={`text-xs px-2 py-0.5 rounded-full ${e.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
											>
												{e.status}
											</span>
										</td>
										<td className="px-4 py-3 text-gray-500 text-xs">
											{e.joinDate}
										</td>
										<td className="px-4 py-3">
											<div className="flex items-center gap-2">
												<button className="text-blue-600 hover:text-blue-800">
													<Edit2 className="w-4 h-4" />
												</button>
												<button onClick={() => setDeactivateModal(e.id)}>
													{e.status === 'active' ? (
														<ToggleRight className="w-5 h-5 text-green-500" />
													) : (
														<ToggleLeft className="w-5 h-5 text-gray-400" />
													)}
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</>
			)}

			{tab === 'kpi' && (
				<div className="space-y-5">
					{/* Summary cards */}
					<div className="grid grid-cols-3 gap-4">
						{[
							{
								label: 'Exceeded Target',
								count: kpiList.filter((k) => k.status === 'exceeded').length,
								color: 'bg-green-500',
							},
							{
								label: 'On Track',
								count: kpiList.filter((k) => k.status === 'on_track').length,
								color: 'bg-blue-500',
							},
							{
								label: 'Below Target',
								count: kpiList.filter((k) => k.status === 'below_target')
									.length,
								color: 'bg-red-500',
							},
						].map((s) => (
							<div
								key={s.label}
								className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center"
							>
								<div
									className={`w-3 h-3 rounded-full ${s.color} mx-auto mb-2`}
								/>
								<p className="text-2xl text-gray-900">{s.count}</p>
								<p className="text-xs text-gray-500">{s.label}</p>
							</div>
						))}
					</div>

					{/* Filters */}
					<div className="flex gap-3 items-center">
						<label className="text-sm text-gray-600">Period:</label>
						<select
							value={periodFilter}
							onChange={(e) => setPeriodFilter(e.target.value)}
							className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none bg-white"
						>
							{['Q1 2026', 'Q4 2025', 'Q3 2025'].map((p) => (
								<option key={p}>{p}</option>
							))}
						</select>
						<button className="ml-auto flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
							<Download className="w-4 h-4" /> Export XLSX
						</button>
					</div>

					{/* KPI Table */}
					<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
						<table className="w-full text-sm">
							<thead className="bg-gray-50 border-b border-gray-200">
								<tr>
									{[
										'Employee',
										'Department',
										'KPI Type',
										'Target',
										'Actual',
										'Completion %',
										'Status',
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
								{filteredKPIs.map((k, i) => (
									<tr
										key={k.id}
										className={`border-b border-gray-100 hover:bg-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}
									>
										<td className="px-4 py-3 text-gray-900">{k.employee}</td>
										<td className="px-4 py-3">
											<span
												className={`text-xs px-2 py-0.5 rounded-full ${deptColor[k.department] ?? 'bg-gray-100'}`}
											>
												{k.department}
											</span>
										</td>
										<td className="px-4 py-3 text-gray-600">{k.kpiType}</td>
										<td className="px-4 py-3 text-gray-700">
											{typeof k.target === 'number' && k.target > 1000
												? `₫${k.target.toLocaleString('vi-VN')}`
												: k.target}
										</td>
										<td className="px-4 py-3 text-gray-700">
											{typeof k.actual === 'number' && k.actual > 1000
												? `₫${k.actual.toLocaleString('vi-VN')}`
												: k.actual}
										</td>
										<td className="px-4 py-3">
											<div className="flex items-center gap-2">
												<div className="w-20 bg-gray-200 rounded-full h-1.5">
													<div
														className={`h-1.5 rounded-full ${k.completion >= 100 ? 'bg-green-500' : k.completion >= 80 ? 'bg-blue-500' : 'bg-red-500'}`}
														style={{ width: `${Math.min(k.completion, 100)}%` }}
													/>
												</div>
												<span className="text-xs text-gray-700">
													{k.completion}%
												</span>
											</div>
										</td>
										<td className="px-4 py-3">
											<span
												className={`text-xs px-2 py-0.5 rounded-full ${kpiStatusColor[k.status]}`}
											>
												{k.status.replace('_', ' ')}
											</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{/* Employee Form Modal */}
			{showForm && editEmp && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
						<div className="flex items-center justify-between mb-5">
							<h3 className="text-lg text-gray-900">Add Employee</h3>
							<button onClick={() => setShowForm(false)}>
								<X className="w-5 h-5 text-gray-400" />
							</button>
						</div>
						<div className="space-y-3">
							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="block text-xs text-gray-500 mb-1">
										Full Name *
									</label>
									<input
										value={editEmp.name ?? ''}
										onChange={(e) =>
											setEditEmp({ ...editEmp, name: e.target.value })
										}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
									/>
								</div>
								<div>
									<label className="block text-xs text-gray-500 mb-1">
										Department
									</label>
									<select
										value={editEmp.department ?? 'Sales'}
										onChange={(e) =>
											setEditEmp({ ...editEmp, department: e.target.value })
										}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none bg-white"
									>
										{depts
											.filter((d) => d !== 'All')
											.map((d) => (
												<option key={d}>{d}</option>
											))}
									</select>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="block text-xs text-gray-500 mb-1">
										Email *
									</label>
									<input
										type="email"
										value={editEmp.email ?? ''}
										onChange={(e) =>
											setEditEmp({ ...editEmp, email: e.target.value })
										}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
									/>
								</div>
								<div>
									<label className="block text-xs text-gray-500 mb-1">
										Phone
									</label>
									<input
										value={editEmp.phone ?? ''}
										onChange={(e) =>
											setEditEmp({ ...editEmp, phone: e.target.value })
										}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
									/>
								</div>
							</div>
							<div>
								<label className="block text-xs text-gray-500 mb-1">
									ID Card Number (CCCD)
								</label>
								<input
									value={editEmp.idCard ?? ''}
									onChange={(e) =>
										setEditEmp({ ...editEmp, idCard: e.target.value })
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
								/>
							</div>
							<div>
								<label className="block text-xs text-gray-500 mb-1">
									ID Card Photos (front & back, ≤5MB each)
								</label>
								<div className="grid grid-cols-2 gap-2">
									{['Front', 'Back'].map((side) => (
										<div
											key={side}
											className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center text-xs text-gray-400 cursor-pointer hover:border-purple-400"
										>
											{side}
										</div>
									))}
								</div>
							</div>
							{editEmp.department === 'Driver' && (
								<div className="border border-orange-200 bg-orange-50 rounded-lg p-3">
									<p className="text-xs text-orange-700 mb-2">
										Driver-specific fields:
									</p>
									<div className="grid grid-cols-2 gap-2">
										<div>
											<label className="block text-xs text-gray-500 mb-1">
												License No.
											</label>
											<input className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none font-mono" />
										</div>
										<div>
											<label className="block text-xs text-gray-500 mb-1">
												License Expiry
											</label>
											<input
												type="date"
												className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
											/>
										</div>
									</div>
								</div>
							)}
						</div>
						<div className="flex gap-2 mt-5">
							<button
								onClick={() => {
									if (editEmp.name) {
										setEmpList([
											...empList,
											{
												...editEmp,
												id: 'EMP' + crypto.randomUUID().slice(0, 8),
												joinDate: '2026-04-13',
											} as Employee,
										]);
										setShowForm(false);
									}
								}}
								className="flex-1 py-2.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
							>
								Add Employee
							</button>
							<button
								onClick={() => setShowForm(false)}
								className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-600 text-sm"
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Deactivate Modal */}
			{deactivateModal && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
						<h3 className="text-lg text-gray-900 mb-3">
							{empList.find((e) => e.id === deactivateModal)?.status ===
							'active'
								? 'Deactivate'
								: 'Reactivate'}{' '}
							Account
						</h3>
						<p className="text-sm text-gray-500 mb-5">
							{empList.find((e) => e.id === deactivateModal)?.status ===
							'active'
								? 'Deactivating will revoke all system access. The employee can be reactivated later.'
								: 'Reactivating will restore system access for this employee.'}
						</p>
						<div className="flex gap-2">
							<button
								onClick={() => toggleStatus(deactivateModal)}
								className="flex-1 py-2.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
							>
								Confirm
							</button>
							<button
								onClick={() => setDeactivateModal(null)}
								className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-600 text-sm"
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
