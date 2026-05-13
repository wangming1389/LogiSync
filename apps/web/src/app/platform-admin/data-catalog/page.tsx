'use client';

import { Plus, ToggleLeft, ToggleRight, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { uomList, vehicleTypes } from '../../data/mockData';

const SHADOW = '0px 8px 24px rgba(15,76,138,0.08)';
type Tab = 'catalog-categories' | 'uom' | 'vehicles' | 'boundaries';

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

export default function DataCatalog() {
const [tab, setTab] = useState<Tab>('catalog-categories');

    const [catalogCategories, setCatalogCategories] = useState<any[]>([]);

const [items, setItems] = useState({
uom: uomList,
vehicles: vehicleTypes,
});

const [showAdd, setShowAdd] = useState(false);
const [newName, setNewName] = useState('');
const [newCode, setNewCode] = useState('');

const TABS: { key: Tab; label: string }[] = [
{ key: 'catalog-categories', label: 'Catalog Categories' },
{ key: 'uom', label: 'Units of Measure' },
{ key: 'vehicles', label: 'Vehicle Types' },
{ key: 'boundaries', label: 'Boundaries' },
];

    const fetchCategories = async () => {
        try {
            const data: any = await api.get('/admin/catalog-categories?limit=100');
            if (data?.items) {
                setCatalogCategories(data.items);
            }
        } catch (e) {
            console.error('Failed to fetch catalog categories', e);
        }
    };

    useEffect(() => {
        if (tab === 'catalog-categories') {
            fetchCategories();
        }
    }, [tab]);

async function toggleStatusCat(id: string, currentStatus: string) {
        try {
            if (currentStatus === 'active') {
                await api.patch('/admin/catalog-categories/' + id + '/disable', {});
            } else {
                await api.patch('/admin/catalog-categories/' + id + '/enable', {});
            }
            fetchCategories();
        } catch (e) {
            console.error(e);
            alert('Failed to update status');
        }
}

    function toggleStatusMock(listKey: 'uom' | 'vehicles', id: string) {
        setItems((prev) => ({
            ...prev,
            [listKey]: (prev[listKey] as any[]).map((x: any) =>
                x.id === id
                    ? { ...x, status: x.status === 'active' ? 'disabled' : 'active' }
                    : x,
            ),
        }));
    }

    async function handleAdd() {
        if (tab === 'catalog-categories') {
            try {
                await api.post('/admin/catalog-categories', {
                    name: newName,
                    code: newCode,
                    description: '',
                });
                fetchCategories();
                setNewName('');
                setNewCode('');
                setShowAdd(false);
            } catch (e) {
                console.error(e);
                alert('Add failed');
            }
        } else {
            alert('Not implemented yet');
        }
    }

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

{/* Tabs */}
<div className="flex flex-wrap gap-2 mb-8 border-b pb-2" style={{ borderColor: '#E0E4EB' }}>
{TABS.map((t) => (
<button
key={t.key}
onClick={() => setTab(t.key)}
className="px-6 py-2 rounded-t-xl font-medium transition-colors"
style={{
color: tab === t.key ? '#0F4C8A' : '#40484C',
borderBottom: tab === t.key ? '2px solid #0F4C8A' : '2px solid transparent',
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
onClick={() => setShowAdd(true)}
className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-medium"
style={{ background: '#0F4C8A' }}
>
<Plus size={18} />
Add New
</button>
</div>

{/* List container */}
<div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-[#F8FAFC] border-b border-[#E0E4EB] text-sm" style={{ color: '#40484C' }}>
                        <tr>
                            <th className="px-6 py-4 font-medium">Code</th>
                            <th className="px-6 py-4 font-medium">Name</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E0E4EB]">
                        {tab === 'catalog-categories' && catalogCategories.map(c => (
                            <tr key={c.id} className="hover:bg-[#F8FAFC] transition-colors">
                                <td className="px-6 py-4 font-mono text-sm" style={{ color: '#0F4C8A' }}>
                                    {c.code}
                                </td>
                                <td className="px-6 py-4 font-medium" style={{ color: '#191C1E' }}>
                                    {c.name}
                                </td>
                                <td className="px-6 py-4">
                                    <StatusChip status={c.status} />
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => toggleStatusCat(c.id, c.status)}
                                        className="inline-flex items-center gap-2 text-sm font-medium"
                                        style={{ color: c.status === 'active' ? '#40484C' : '#0F4C8A' }}
                                    >
                                        {c.status === 'active' ? <ToggleRight size={20} color="#0F4C8A" /> : <ToggleLeft size={20} color="#72787E" />}
                                        {c.status === 'active' ? 'Disable' : 'Enable'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {tab !== 'catalog-categories' && items[tab as 'uom' | 'vehicles']?.map((i: any) => (
                            <tr key={i.id} className="hover:bg-[#F8FAFC] transition-colors">
                                <td className="px-6 py-4 font-mono text-sm" style={{ color: '#0F4C8A' }}>
                                    {i.code}
                                </td>
                                <td className="px-6 py-4 font-medium" style={{ color: '#191C1E' }}>
                                    {i.name}
                                </td>
                                <td className="px-6 py-4">
                                    <StatusChip status={i.status} />
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => toggleStatusMock(tab as 'uom' | 'vehicles', i.id)}
                                        className="inline-flex items-center gap-2 text-sm font-medium"
                                        style={{ color: i.status === 'active' ? '#40484C' : '#0F4C8A' }}
                                    >
                                        {i.status === 'active' ? <ToggleRight size={20} color="#0F4C8A" /> : <ToggleLeft size={20} color="#72787E" />}
                                        {i.status === 'active' ? 'Disable' : 'Enable'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
</div>

{/* Add Modal */}
{showAdd && (
<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
<div
className="bg-white rounded-2xl p-6 max-w-md w-full"
style={{ boxShadow: SHADOW }}
>
<div className="flex justify-between items-center mb-6">
<h3 className="text-xl font-medium" style={{ color: '#191C1E' }}>
Add New {TABS.find((t) => t.key === tab)?.label}
</h3>
<button onClick={() => setShowAdd(false)}>
<X size={20} color="#72787E" />
</button>
</div>
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
</div>
<div className="flex gap-3 justify-end">
<button
onClick={() => setShowAdd(false)}
className="px-5 py-3 rounded-xl font-medium text-[#40484C]"
>
Cancel
</button>
<button
onClick={handleAdd}
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