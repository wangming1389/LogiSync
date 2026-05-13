'use client';
import {
	AlertTriangle,
	Bell,
	CheckCheck,
	DollarSign,
	FileText,
	Settings,
	ShoppingCart,
} from 'lucide-react';
import { useState } from 'react';
import { notifications as initialNotifications } from '@/app/data/mockData';

const SHADOW = '0px 8px 24px rgba(15,76,138,0.08)';

const iconMap: Record<string, { icon: React.ReactNode; bg: string }> = {
	order: {
		icon: <ShoppingCart className="w-4 h-4" style={{ color: '#0F4C8A' }} />,
		bg: '#D3E4F5',
	},
	rfq: {
		icon: <FileText className="w-4 h-4" style={{ color: '#1B6B3A' }} />,
		bg: '#C8F0D8',
	},
	dispute: {
		icon: <AlertTriangle className="w-4 h-4" style={{ color: '#BA1A1A' }} />,
		bg: '#FFDAD6',
	},
	system: {
		icon: <Settings className="w-4 h-4" style={{ color: '#191C1E' }} />,
		bg: '#E0E4EB',
	},
	payment: {
		icon: <DollarSign className="w-4 h-4" style={{ color: '#7A4F00' }} />,
		bg: '#FFEFC6',
	},
};

export function NotificationCenter() {
	const [notes, setNotes] = useState(initialNotifications);
	const [filter, setFilter] = useState<string>('all');

	const unread = notes.filter((n) => !n.read).length;
	const filtered =
		filter === 'all'
			? notes
			: filter === 'unread'
				? notes.filter((n) => !n.read)
				: notes.filter((n) => n.type === filter);

	function markAll() {
		setNotes(notes.map((n) => ({ ...n, read: true })));
	}
	function markOne(id: string) {
		setNotes(notes.map((n) => (n.id === id ? { ...n, read: true } : n)));
	}

	return (
		<div className="max-w-2xl mx-auto p-6">
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center gap-3">
					<h1 style={{ color: '#191C1E' }}>Notifications</h1>
					{unread > 0 && (
						<span
							className="px-2.5 py-0.5 rounded-full text-white"
							style={{ background: '#1A6EC4', fontSize: 12, fontWeight: 600 }}
						>
							{unread}
						</span>
					)}
				</div>
				<button
					onClick={markAll}
					className="flex items-center gap-1 hover:opacity-80"
					style={{ fontSize: 13, color: '#1A6EC4' }}
				>
					<CheckCheck className="w-4 h-4" /> Mark all as read
				</button>
			</div>

			{/* Filters */}
			<div className="flex gap-2 mb-4 flex-wrap">
				{['all', 'unread', 'order', 'rfq', 'dispute', 'payment', 'system'].map(
					(f) => (
						<button
							key={f}
							onClick={() => setFilter(f)}
							className="px-3 py-1.5 rounded-full capitalize transition-colors"
							style={{
								background: filter === f ? '#0F4C8A' : '#E0E4EB',
								color: filter === f ? '#FFFFFF' : 'rgba(25,28,30,0.65)',
								fontSize: 12,
								fontWeight: filter === f ? 600 : 400,
							}}
						>
							{f}
						</button>
					),
				)}
			</div>

			{/* List */}
			<div className="space-y-2">
				{filtered.map((n) => {
					const icon = iconMap[n.type] ?? {
						icon: <Bell className="w-4 h-4" style={{ color: '#191C1E' }} />,
						bg: '#E0E4EB',
					};
					return (
						<div
							key={n.id}
							className="rounded-xl p-4 flex items-start gap-3 transition-all"
							style={{
								background: n.read ? '#FFFFFF' : '#F0F5FF',
								boxShadow: SHADOW,
								borderLeft: n.read ? 'none' : '3px solid #1A6EC4',
							}}
							onClick={() => markOne(n.id)}
						>
							<div
								className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
								style={{ background: icon.bg }}
							>
								{icon.icon}
							</div>
							<div className="flex-1 min-w-0">
								<div className="flex items-start justify-between gap-2">
									<p
										style={{
											fontSize: 14,
											color: '#191C1E',
											fontWeight: n.read ? 400 : 600,
										}}
									>
										{n.title}
									</p>
									<p
										style={{
											fontSize: 11,
											color: 'rgba(25,28,30,0.4)',
											whiteSpace: 'nowrap',
											marginTop: 2,
										}}
									>
										{n.timestamp}
									</p>
								</div>
								<p
									style={{
										fontSize: 13,
										color: 'rgba(25,28,30,0.6)',
										marginTop: 2,
									}}
								>
									{n.message}
								</p>
							</div>
							{!n.read && (
								<div
									className="w-2 h-2 rounded-full shrink-0 mt-1.5"
									style={{ background: '#1A6EC4' }}
								/>
							)}
						</div>
					);
				})}
				{filtered.length === 0 && (
					<div
						className="text-center py-12 rounded-xl"
						style={{ background: '#FFFFFF', boxShadow: SHADOW }}
					>
						<Bell
							className="w-10 h-10 mx-auto mb-3"
							style={{ color: '#C1C6D4' }}
						/>
						<p style={{ fontSize: 14, color: 'rgba(25,28,30,0.4)' }}>
							No notifications found
						</p>
					</div>
				)}
			</div>
		</div>
	);
}

