'use client';

import { Activity, Download, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const SHADOW = '0px 8px 24px rgba(15,76,138,0.08)';
const STATUS_FILTERS = ['All', 'Success', 'Failure'] as const;

type AuditLogRow = {
	id: string;
	timestamp: string;
	actorId: string;
	workspaceId: string;
	action: string;
	resourceType: string;
	resourceId?: string | null;
	ipAddress: string;
	status: 'success' | 'failure' | string;
	errorMessage?: string | null;
	changes?: unknown;
};

function toDate(value: string) {
	const next = new Date(value);
	return Number.isNaN(next.getTime()) ? null : next;
}

function statusChipStyle(status: string) {
	if (status === 'success') return { bg: '#C8F0D8', color: '#1B6B3A', label: 'SUCCESS' };
	if (status === 'failure') return { bg: '#FFDAD6', color: '#BA1A1A', label: 'FAILURE' };
	return { bg: '#E0E4EB', color: '#191C1E', label: status.toUpperCase() };
}

export default function AuditLog() {
	const [logs, setLogs] = useState<AuditLogRow[]>([]);
	const [search, setSearch] = useState('');
	const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>('All');
	const [dateFrom, setDateFrom] = useState('');
	const [dateTo, setDateTo] = useState('');
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let active = true;
		async function loadLogs() {
			setLoading(true);
			try {
				// API docs limit is max 25
				const response: any = await api.get('/admin/audit-logs?limit=25');
				const payload = response?.data?.data ?? response?.data ?? response;
				const items = Array.isArray(payload) ? payload : payload?.items ?? [];
				if (active && Array.isArray(items)) {
					setLogs(items);
				}
			} catch (error) {
				console.error('Error loading audit logs', error);
			} finally {
				if (active) setLoading(false);
			}
		}

		loadLogs();
		return () => {
			active = false;
		};
	}, []);

	const filtered = logs
		.filter((log) => {
		const haystack = [
			log.actorId,
			log.workspaceId,
			log.action,
			log.resourceType,
			log.resourceId ?? '',
			log.ipAddress,
			log.status,
		].join(' ');
		const matchSearch = !search || haystack.toLowerCase().includes(search.toLowerCase());
		const matchStatus = status === 'All' || log.status === status.toLowerCase();
		if (!matchSearch || !matchStatus) return false;

		const logDate = toDate(log.timestamp.slice(0, 10));
		const fromDate = dateFrom ? toDate(dateFrom) : null;
		const toDateValue = dateTo ? toDate(dateTo) : null;
		if (fromDate && logDate && logDate < fromDate) return false;
		if (toDateValue && logDate && logDate > toDateValue) return false;
		return true;
	})
		.sort((left, right) => right.timestamp.localeCompare(left.timestamp));

	function exportCSV() {
		const header = [
			'ID',
			'Timestamp',
			'Actor ID',
			'Workspace ID',
			'Action',
			'Resource Type',
			'Resource ID',
			'IP',
			'Status',
		];
		const rows = filtered.map((l) => [
			l.id,
			l.timestamp,
			l.actorId,
			l.workspaceId,
			l.action,
			l.resourceType,
			l.resourceId ?? '',
			l.ipAddress,
			l.status,
		]);
		const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
		const blob = new Blob([csv], { type: 'text/csv' });
		const a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = 'audit-log.csv';
		a.click();
	}

	const inputStyle = {
		background: '#D5DAE3',
		borderBottom: '2px solid transparent',
		color: '#191C1E',
		fontSize: 14,
	};

	return (
		<div className="p-6">
			<div className="flex items-center justify-between mb-6">
				<div>
					<h1 style={{ color: '#191C1E' }}>Audit Log</h1>
					<p
						style={{ fontSize: 13, color: 'rgba(25,28,30,0.55)', marginTop: 2 }}
					>
						{filtered.length} records found
					</p>
				</div>
				<button
					onClick={exportCSV}
					className="flex items-center gap-2 px-4 py-2.5 rounded-[6px] transition-all hover:brightness-105"
					style={{
						background: 'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)',
						color: '#fff',
						fontWeight: 600,
						fontSize: 12,
						letterSpacing: '0.06em',
					}}
				>
					<Download className="w-4 h-4" /> EXPORT CSV
				</button>
			</div>

			{/* Filters */}
			<div
				className="rounded-xl p-4 mb-4 flex flex-wrap gap-3 items-center"
				style={{ background: '#FFFFFF', boxShadow: SHADOW }}
			>
				<div className="relative flex-1 min-w-48">
					<Search
						className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
						style={{ color: 'rgba(25,28,30,0.4)' }}
					/>
					<input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search actor, action, target..."
						className="w-full pl-9 pr-4 h-10 rounded-t-[6px] focus:outline-none"
						style={inputStyle}
						onFocus={(e) => {
							e.target.style.borderBottomColor = '#00559F';
						}}
						onBlur={(e) => {
							e.target.style.borderBottomColor = 'transparent';
						}}
					/>
				</div>
				<div className="flex items-center gap-2">
					<select
						value={status}
						onChange={(e) => setStatus(e.target.value as (typeof STATUS_FILTERS)[number])}
						className="px-3 h-10 rounded-t-[6px] focus:outline-none"
						style={{
							background: '#D5DAE3',
							borderBottom: '2px solid transparent',
							color: '#191C1E',
							fontSize: 14,
						}}
					>
						{STATUS_FILTERS.map((d) => (
							<option key={d}>{d}</option>
						))}
					</select>
				</div>
				<div className="flex items-center gap-2" style={{ fontSize: 14 }}>
					<input
						type="date"
						value={dateFrom}
						onChange={(e) => setDateFrom(e.target.value)}
						className="px-3 h-10 rounded-t-[6px] focus:outline-none"
						style={{
							background: '#D5DAE3',
							borderBottom: '2px solid transparent',
							color: '#191C1E',
							fontSize: 13,
						}}
					/>
					<span style={{ color: 'rgba(25,28,30,0.4)' }}>â€“</span>
					<input
						type="date"
						value={dateTo}
						onChange={(e) => setDateTo(e.target.value)}
						className="px-3 h-10 rounded-t-[6px] focus:outline-none"
						style={{
							background: '#D5DAE3',
							borderBottom: '2px solid transparent',
							color: '#191C1E',
							fontSize: 13,
						}}
					/>
				</div>
			</div>

			<div
				className="rounded-xl overflow-hidden"
				style={{ background: '#FFFFFF', boxShadow: SHADOW }}
			>
				<table className="w-full">
					<thead style={{ background: '#F2F4F7' }}>
						<tr>
							{[
								'TIMESTAMP',
								'ACTOR ID',
								'WORKSPACE ID',
								'ACTION',
								'RESOURCE',
								'IP ADDRESS',
								'STATUS',
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
						{loading ? (
							<tr>
								<td className="px-4 py-6 text-sm text-slate-500" colSpan={7}>
									Loading audit logs...
								</td>
							</tr>
						) : null}
						{filtered.map((log, i) => (
							<tr
								key={log.id}
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
									className="px-4 py-3"
									style={{
										fontFamily: 'monospace',
										fontSize: 12,
										color: 'rgba(25,28,30,0.5)',
									}}
								>
									{new Date(log.timestamp).toLocaleString('vi-VN')}
								</td>
								<td
									className="px-4 py-3"
									style={{ fontSize: 13, color: 'rgba(25,28,30,0.7)' }}
								>
									{log.actorId}
								</td>
								<td
									className="px-4 py-3"
									style={{ fontSize: 13, color: 'rgba(25,28,30,0.7)' }}
								>
									{log.workspaceId}
								</td>
								<td className="px-4 py-3">
									<div className="flex items-center gap-1.5">
										<Activity
											className="w-3.5 h-3.5"
											style={{ color: '#1A6EC4' }}
										/>
										<span
											style={{
												fontFamily: 'monospace',
												fontSize: 12,
												color: '#191C1E',
											}}
										>
											{log.action}
										</span>
									</div>
								</td>
								<td
									className="px-4 py-3"
									style={{ fontSize: 13, color: 'rgba(25,28,30,0.7)' }}
								>
									{log.resourceType}
									{log.resourceId ? ` / ${log.resourceId}` : ''}
								</td>
								<td
									className="px-4 py-3"
									style={{
										fontFamily: 'monospace',
										fontSize: 12,
										color: 'rgba(25,28,30,0.5)',
									}}
								>
									{log.ipAddress}
								</td>
								<td className="px-4 py-3">
									{(() => {
										const s = statusChipStyle(log.status);
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
									})()}
								</td>
							</tr>
						))}
						{filtered.length === 0 && (
							<tr>
								<td
									colSpan={7}
									className="text-center py-12"
									style={{ color: 'rgba(25,28,30,0.4)', fontSize: 14 }}
								>
									No logs match your filters
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
