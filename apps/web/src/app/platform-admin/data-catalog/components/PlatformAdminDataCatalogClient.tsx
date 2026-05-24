'use client';

import { Edit2, Plus, ToggleLeft, ToggleRight, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const SHADOW = '0px 8px 24px rgba(15,76,138,0.08)';

type Tab = 'catalog-categories' | 'uom';

type CatalogItem = {
	id: string;
	code: string;
	name: string;
	description?: string;
	status: string;
};

type DraftItem = {
	id?: string;
	code: string;
	name: string;
	description: string;
};

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
			{status?.toUpperCase()}
		</span>
	);
}

export default function PlatformAdminDataCatalogClient() {
	const [tab, setTab] = useState<Tab>('catalog-categories');
	const [catalogCategories, setCatalogCategories] = useState<CatalogItem[]>([]);
	const [uoms, setUoms] = useState<CatalogItem[]>([]);
	const [showModal, setShowModal] = useState(false);
	const [editingItem, setEditingItem] = useState<DraftItem | null>(null);
	const [loading, setLoading] = useState(false);
	const [formError, setFormError] = useState('');
	const [newCode, setNewCode] = useState('');
	const [newName, setNewName] = useState('');
	const [newDescription, setNewDescription] = useState('');

	const TABS: { key: Tab; label: string }[] = [
		{ key: 'catalog-categories', label: 'Catalog Categories' },
		{ key: 'uom', label: 'Units of Measure' },
	];

	async function fetchItems(activeTab: Tab) {
		setLoading(true);
		try {
			const endpoint =
				activeTab === 'catalog-categories'
					? '/admin/catalog-categories?limit=100'
					: '/admin/uom?limit=100';
			const data: any = await api.get(endpoint);
			if (activeTab === 'catalog-categories') {
				setCatalogCategories(data?.items ?? []);
			} else {
				setUoms(data?.items ?? []);
			}
		} catch (error) {
			console.error('Failed to fetch catalog items', error);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		fetchItems(tab);
	}, [tab]);

	function openAdd() {
		setEditingItem({ code: '', name: '', description: '' });
		setNewCode('');
		setNewName('');
		setNewDescription('');
		setFormError('');
		setShowModal(true);
	}

	function openEdit(item: CatalogItem) {
		setEditingItem({
			id: item.id,
			code: item.code,
			name: item.name,
			description: item.description ?? '',
		});
		setNewCode(item.code);
		setNewName(item.name);
		setNewDescription(item.description ?? '');
		setFormError('');
		setShowModal(true);
	}

	async function saveItem() {
		if (!newCode.trim() || !newName.trim()) return;
		setFormError('');
		try {
			const payload = {
				code: newCode.trim(),
				name: newName.trim(),
				description: newDescription.trim(),
			};

			if (tab === 'catalog-categories') {
				if (editingItem?.id) {
					await api.patch(
						`/admin/catalog-categories/${editingItem.id}`,
						payload,
					);
				} else {
					await api.post('/admin/catalog-categories', payload);
				}
			} else if (editingItem?.id) {
				await api.patch(`/admin/uom/${editingItem.id}`, payload);
			} else {
				await api.post('/admin/uom', payload);
			}

			setShowModal(false);
			setEditingItem(null);
			setNewCode('');
			setNewName('');
			setNewDescription('');
			fetchItems(tab);
		} catch (error: any) {
			if (error?.status === 409) {
				setFormError(error?.message || 'Duplicate code or name.');
			} else {
				setFormError(error?.message || 'Failed to save item.');
			}
		}
	}

	async function toggleStatus(item: CatalogItem) {
		try {
			if (tab === 'catalog-categories') {
				await api.patch(
					`/admin/catalog-categories/${item.id}/${item.status === 'active' ? 'disable' : 'enable'}`,
					{},
				);
			} else {
				await api.patch(
					`/admin/uom/${item.id}/${item.status === 'active' ? 'disable' : 'enable'}`,
					{},
				);
			}
			fetchItems(tab);
		} catch (error) {
			console.error('Failed to update status', error);
			alert('Failed to update status');
		}
	}

	const list = tab === 'catalog-categories' ? catalogCategories : uoms;

	return (
		<div className="p-8 max-w-7xl mx-auto min-h-screen">
			<div className="mb-8">
				<h1
					className="text-3xl font-light mb-2"
					style={{ color: '#191C1E', letterSpacing: '-0.02em' }}
				>
					Data Catalog
				</h1>
				<p style={{ color: '#40484C' }}>
					Manage shared reference data across all workspaces.
				</p>
			</div>

			<div
				className="flex flex-wrap gap-2 mb-8 border-b pb-2"
				style={{ borderColor: '#E0E4EB' }}
			>
				{TABS.map((t) => (
					<button
						key={t.key}
						onClick={() => setTab(t.key)}
						className="px-6 py-2 rounded-t-xl font-medium transition-colors"
						style={{
							color: tab === t.key ? '#0F4C8A' : '#40484C',
							borderBottom:
								tab === t.key ? '2px solid #0F4C8A' : '2px solid transparent',
							background: tab === t.key ? '#F8FAFC' : 'transparent',
						}}
					>
						{t.label}
					</button>
				))}
			</div>

			<div className="flex justify-between items-center mb-6">
				<h2 className="text-xl font-medium" style={{ color: '#191C1E' }}>
					{TABS.find((t) => t.key === tab)?.label}
				</h2>
				<button
					onClick={openAdd}
					className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-medium"
					style={{ background: '#0F4C8A' }}
				>
					<Plus size={18} />
					Add New
				</button>
			</div>

			<div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
				<table className="w-full text-left">
					<thead
						className="bg-[#F8FAFC] border-b border-[#E0E4EB] text-sm"
						style={{ color: '#40484C' }}
					>
						<tr>
							<th className="px-6 py-4 font-medium">Code</th>
							<th className="px-6 py-4 font-medium">Name</th>
							<th className="px-6 py-4 font-medium">Description</th>
							<th className="px-6 py-4 font-medium">Status</th>
							<th className="px-6 py-4 font-medium text-right">Actions</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-[#E0E4EB]">
						{list.map((item) => (
							<tr
								key={item.id}
								className="hover:bg-[#F8FAFC] transition-colors"
							>
								<td
									className="px-6 py-4 font-mono text-sm"
									style={{ color: '#0F4C8A' }}
								>
									{item.code}
								</td>
								<td
									className="px-6 py-4 font-medium"
									style={{ color: '#191C1E' }}
								>
									{item.name}
								</td>
								<td className="px-6 py-4" style={{ color: '#40484C' }}>
									{item.description ?? '—'}
								</td>
								<td className="px-6 py-4">
									<StatusChip status={item.status} />
								</td>
								<td className="px-6 py-4 text-right">
									<div className="inline-flex items-center gap-3">
										<button
											onClick={() => openEdit(item)}
											className="inline-flex items-center gap-1 text-sm font-medium"
											style={{ color: '#0F4C8A' }}
										>
											<Edit2 size={16} /> Edit
										</button>
										<button
											onClick={() => toggleStatus(item)}
											className="inline-flex items-center gap-2 text-sm font-medium"
											style={{
												color: item.status === 'active' ? '#40484C' : '#0F4C8A',
											}}
										>
											{item.status === 'active' ? (
												<ToggleRight size={20} color="#0F4C8A" />
											) : (
												<ToggleLeft size={20} color="#72787E" />
											)}
											{item.status === 'active' ? 'Disable' : 'Enable'}
										</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
				{!loading && list.length === 0 && (
					<div className="p-8 text-center text-slate-500">No items found.</div>
				)}
			</div>

			{showModal && (
				<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
					<div
						className="bg-white rounded-2xl p-6 max-w-md w-full"
						style={{ boxShadow: SHADOW }}
					>
						<div className="flex justify-between items-center mb-6">
							<h3 className="text-xl font-medium" style={{ color: '#191C1E' }}>
								{editingItem?.id ? 'Edit' : 'Add'}{' '}
								{TABS.find((t) => t.key === tab)?.label}
							</h3>
							<button onClick={() => setShowModal(false)}>
								<X size={20} color="#72787E" />
							</button>
						</div>
						{formError && (
							<div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
								{formError}
							</div>
						)}
						<div className="space-y-4 mb-6">
							<div>
								<label
									className="block text-sm font-medium mb-1"
									style={{ color: '#40484C' }}
								>
									Code
								</label>
								<input
									type="text"
									value={newCode}
									onChange={(e) => setNewCode(e.target.value)}
									className="w-full border rounded-xl p-3 outline-none focus:border-[#0F4C8A]"
									placeholder="e.g. CAT001"
								/>
							</div>
							<div>
								<label
									className="block text-sm font-medium mb-1"
									style={{ color: '#40484C' }}
								>
									Name
								</label>
								<input
									type="text"
									value={newName}
									onChange={(e) => setNewName(e.target.value)}
									className="w-full border rounded-xl p-3 outline-none focus:border-[#0F4C8A]"
									placeholder="e.g. Electronics"
								/>
							</div>
							<div>
								<label
									className="block text-sm font-medium mb-1"
									style={{ color: '#40484C' }}
								>
									Description
								</label>
								<textarea
									value={newDescription}
									onChange={(e) => setNewDescription(e.target.value)}
									rows={3}
									className="w-full border rounded-xl p-3 outline-none focus:border-[#0F4C8A] resize-none"
									placeholder="Optional description"
								/>
							</div>
						</div>
						<div className="flex gap-3 justify-end">
							<button
								onClick={() => setShowModal(false)}
								className="px-5 py-3 rounded-xl font-medium text-[#40484C]"
							>
								Cancel
							</button>
							<button
								onClick={saveItem}
								disabled={!newName || !newCode}
								className="px-5 py-3 rounded-xl font-medium text-white disabled:opacity-50"
								style={{ background: '#0F4C8A' }}
							>
								Save Details
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
