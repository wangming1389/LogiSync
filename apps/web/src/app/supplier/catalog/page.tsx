'use client';
import {
	Edit2,
	Image,
	Plus,
	Search,
	ToggleLeft,
	ToggleRight,
	X,
} from 'lucide-react';
import { useState } from 'react';
import { supplierCategories, supplierProducts } from '@/app/data/mockData';

const SHADOW = '0px 8px 24px rgba(15,76,138,0.08)';
type Product = (typeof supplierProducts)[0] & { visibility: string };

const inputStyle = {
	background: '#D5DAE3',
	borderBottom: '2px solid #00559F',
	color: '#191C1E',
	fontSize: 14,
};

export default function CatalogManagement() {
	const [tab, setTab] = useState<'products' | 'categories'>('products');
	const [products, setProducts] = useState<Product[]>(supplierProducts);
	const [categories, setCategories] = useState(supplierCategories);
	const [search, setSearch] = useState('');
	const [filterCat, setFilterCat] = useState('All');
	const [showForm, setShowForm] = useState(false);
	const [editProduct, setEditProduct] = useState<Partial<Product> | null>(null);

	const filtered = products.filter(
		(p) =>
			(p.name.toLowerCase().includes(search.toLowerCase()) ||
				p.sku.toLowerCase().includes(search.toLowerCase())) &&
			(filterCat === 'All' || p.category === filterCat),
	);

	function toggleVisibility(id: string) {
		setProducts((ps) =>
			ps.map((p) =>
				p.id === id
					? {
							...p,
							visibility: p.visibility === 'public' ? 'hidden' : 'public',
						}
					: p,
			),
		);
	}

	function openAdd() {
		setEditProduct({
			sku: '',
			name: '',
			category: 'Rice',
			price: 0,
			unit: 'MT',
			stock: 0,
			visibility: 'public',
		});
		setShowForm(true);
	}
	function openEdit(p: Product) {
		setEditProduct({ ...p });
		setShowForm(true);
	}
	function saveProduct() {
		if (!editProduct?.name) return;
		if (editProduct.id) {
			setProducts((ps) =>
				ps.map((p) =>
					p.id === editProduct.id ? ({ ...p, ...editProduct } as Product) : p,
				),
			);
		} else {
			setProducts((ps) => [
				...ps,
				{
					...editProduct,
					id: 'PRD' + crypto.randomUUID().slice(0, 8),
					image: null,
				} as Product,
			]);
		}
		setShowForm(false);
		setEditProduct(null);
	}

	return (
		<div className="p-6">
			<div className="flex items-center justify-between mb-6">
				<h1 style={{ color: '#191C1E' }}>Catalog Management</h1>
				<button
					onClick={openAdd}
					className="flex items-center gap-2 px-4 py-2.5 text-white rounded-[6px] transition-all hover:brightness-105"
					style={{
						background: 'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)',
						fontWeight: 600,
						fontSize: 12,
						letterSpacing: '0.06em',
					}}
				>
					<Plus className="w-4 h-4" /> ADD PRODUCT
				</button>
			</div>

			{/* Tabs */}
			<div
				className="flex gap-1 p-1 rounded-lg mb-5 w-fit"
				style={{ background: '#E0E4EB' }}
			>
				{(['products', 'categories'] as const).map((t) => (
					<button
						key={t}
						onClick={() => setTab(t)}
						className="px-5 py-2 rounded-md capitalize transition-all"
						style={{
							background: tab === t ? '#0F4C8A' : 'transparent',
							color: tab === t ? '#FFFFFF' : 'rgba(25,28,30,0.6)',
							fontWeight: tab === t ? 600 : 400,
							fontSize: 13,
						}}
					>
						{t}
					</button>
				))}
			</div>

			{tab === 'products' && (
				<>
					<div className="flex gap-3 mb-4">
						<div className="relative flex-1">
							<Search
								className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
								style={{ color: 'rgba(25,28,30,0.4)' }}
							/>
							<input
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								placeholder="Search product name or SKU..."
								className="w-full pl-9 pr-4 h-10 rounded-t-[6px] focus:outline-none"
								style={inputStyle}
							/>
						</div>
						<select
							value={filterCat}
							onChange={(e) => setFilterCat(e.target.value)}
							className="px-3 h-10 rounded-t-[6px] focus:outline-none"
							style={{
								background: '#D5DAE3',
								borderBottom: '2px solid #00559F',
								color: '#191C1E',
								fontSize: 14,
							}}
						>
							<option>All</option>
							{categories.map((c) => (
								<option key={c.id}>{c.name}</option>
							))}
						</select>
					</div>
					<div
						className="rounded-xl overflow-hidden"
						style={{ background: '#FFFFFF', boxShadow: SHADOW }}
					>
						<table className="w-full">
							<thead style={{ background: '#F2F4F7' }}>
								<tr>
									{[
										'',
										'SKU',
										'NAME',
										'CATEGORY',
										'PRICE (VND/MT)',
										'STOCK',
										'VISIBILITY',
										'ACTIONS',
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
								{filtered.map((p, i) => (
									<tr
										key={p.id}
										style={{ background: i % 2 === 1 ? '#F7F9FC' : '#FFFFFF' }}
										onMouseEnter={(e) =>
											((
												e.currentTarget as HTMLTableRowElement
											).style.background = '#E0E4EB')
										}
										onMouseLeave={(e) =>
											((
												e.currentTarget as HTMLTableRowElement
											).style.background = i % 2 === 1 ? '#F7F9FC' : '#FFFFFF')
										}
									>
										<td className="px-4 py-3">
											<div
												className="w-9 h-9 rounded-lg flex items-center justify-center"
												style={{ background: '#F2F4F7' }}
											>
												<Image
													className="w-4 h-4"
													style={{ color: 'rgba(25,28,30,0.35)' }}
												/>
											</div>
										</td>
										<td
											className="px-4 py-3"
											style={{
												fontFamily: 'monospace',
												fontSize: 12,
												color: '#1A6EC4',
											}}
										>
											{p.sku}
										</td>
										<td
											className="px-4 py-3"
											style={{
												fontSize: 14,
												color: '#191C1E',
												fontWeight: 500,
											}}
										>
											{p.name}
										</td>
										<td className="px-4 py-3">
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
												{p.category.toUpperCase()}
											</span>
										</td>
										<td
											className="px-4 py-3"
											style={{ fontSize: 14, color: '#191C1E' }}
										>
											{p.price.toLocaleString('vi-VN')}
										</td>
										<td
											className="px-4 py-3"
											style={{ fontSize: 14, color: 'rgba(25,28,30,0.7)' }}
										>
											{p.stock.toLocaleString()} MT
										</td>
										<td className="px-4 py-3">
											<button
												onClick={() => toggleVisibility(p.id)}
												className="flex items-center gap-1"
											>
												{p.visibility === 'public' ? (
													<>
														<ToggleRight
															className="w-5 h-5"
															style={{ color: '#1B6B3A' }}
														/>
														<span style={{ fontSize: 12, color: '#1B6B3A' }}>
															Public
														</span>
													</>
												) : (
													<>
														<ToggleLeft
															className="w-5 h-5"
															style={{ color: 'rgba(25,28,30,0.35)' }}
														/>
														<span
															style={{
																fontSize: 12,
																color: 'rgba(25,28,30,0.5)',
															}}
														>
															Hidden
														</span>
													</>
												)}
											</button>
										</td>
										<td className="px-4 py-3">
											<button
												onClick={() => openEdit(p)}
												style={{ color: '#1A6EC4' }}
											>
												<Edit2 className="w-4 h-4" />
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</>
			)}

			{tab === 'categories' && (
				<div
					className="rounded-xl overflow-hidden"
					style={{ background: '#FFFFFF', boxShadow: SHADOW }}
				>
					<table className="w-full">
						<thead style={{ background: '#F2F4F7' }}>
							<tr>
								{['NAME', 'DESCRIPTION', 'PRODUCTS', 'STATUS', 'EDIT'].map(
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
							{categories.map((c, i) => (
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
										style={{ fontSize: 14, color: '#191C1E', fontWeight: 500 }}
									>
										{c.name}
									</td>
									<td
										className="px-5 py-3"
										style={{ fontSize: 13, color: 'rgba(25,28,30,0.55)' }}
									>
										{c.description}
									</td>
									<td
										className="px-5 py-3"
										style={{ fontSize: 14, color: 'rgba(25,28,30,0.7)' }}
									>
										{c.productCount}
									</td>
									<td className="px-5 py-3">
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
											{c.status.toUpperCase()}
										</span>
									</td>
									<td className="px-5 py-3">
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

			{/* Product Form Modal */}
			{showForm && editProduct && (
				<div
					className="fixed inset-0 flex items-center justify-center z-50"
					style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
				>
					<div
						className="rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
						style={{
							background: 'rgba(255,255,255,0.93)',
							backdropFilter: 'blur(20px)',
							boxShadow: SHADOW,
						}}
					>
						<div className="flex items-center justify-between mb-5">
							<h3 style={{ color: '#191C1E' }}>
								{editProduct.id ? 'Edit Product' : 'Add Product'}
							</h3>
							<button onClick={() => setShowForm(false)}>
								<X
									className="w-5 h-5"
									style={{ color: 'rgba(25,28,30,0.4)' }}
								/>
							</button>
						</div>
						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-3">
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
										SKU *
									</label>
									<input
										value={editProduct.sku ?? ''}
										onChange={(e) =>
											setEditProduct({ ...editProduct, sku: e.target.value })
										}
										className="w-full px-3 h-10 rounded-t-[6px] font-mono focus:outline-none"
										style={inputStyle}
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
										CATEGORY
									</label>
									<select
										value={editProduct.category ?? 'Rice'}
										onChange={(e) =>
											setEditProduct({
												...editProduct,
												category: e.target.value,
											})
										}
										className="w-full px-3 h-10 rounded-t-[6px] focus:outline-none"
										style={{
											background: '#D5DAE3',
											borderBottom: '2px solid #00559F',
											color: '#191C1E',
											fontSize: 14,
										}}
									>
										{categories.map((c) => (
											<option key={c.id}>{c.name}</option>
										))}
									</select>
								</div>
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
									PRODUCT NAME *
								</label>
								<input
									value={editProduct.name ?? ''}
									onChange={(e) =>
										setEditProduct({ ...editProduct, name: e.target.value })
									}
									className="w-full px-3 h-10 rounded-t-[6px] focus:outline-none"
									style={inputStyle}
								/>
							</div>
							<div className="grid grid-cols-2 gap-3">
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
										PRICE (VND)
									</label>
									<input
										type="number"
										value={editProduct.price ?? 0}
										onChange={(e) =>
											setEditProduct({ ...editProduct, price: +e.target.value })
										}
										className="w-full px-3 h-10 rounded-t-[6px] focus:outline-none"
										style={inputStyle}
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
										UNIT
									</label>
									<select
										value={editProduct.unit ?? 'MT'}
										onChange={(e) =>
											setEditProduct({ ...editProduct, unit: e.target.value })
										}
										className="w-full px-3 h-10 rounded-t-[6px] focus:outline-none"
										style={{
											background: '#D5DAE3',
											borderBottom: '2px solid #00559F',
											color: '#191C1E',
											fontSize: 14,
										}}
									>
										<option>MT</option>
										<option>KG</option>
										<option>BAG50</option>
									</select>
								</div>
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
									STOCK QTY
								</label>
								<input
									type="number"
									value={editProduct.stock ?? 0}
									onChange={(e) =>
										setEditProduct({ ...editProduct, stock: +e.target.value })
									}
									className="w-full px-3 h-10 rounded-t-[6px] focus:outline-none"
									style={inputStyle}
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
									UPLOAD IMAGE (≤5MB)
								</label>
								<div
									className="rounded-lg p-4 text-center cursor-pointer transition-colors"
									style={{
										border: '2px dashed #C1C6D4',
										background: '#F2F4F7',
									}}
								>
									<Image
										className="w-6 h-6 mx-auto mb-1"
										style={{ color: 'rgba(25,28,30,0.3)' }}
									/>
									<span style={{ fontSize: 13, color: 'rgba(25,28,30,0.45)' }}>
										Click to upload (JPG, PNG ≤ 5MB)
									</span>
								</div>
							</div>
						</div>
						<div className="flex gap-2 mt-5">
							<button
								onClick={saveProduct}
								className="flex-1 py-2.5 text-white rounded-[6px] transition-all hover:brightness-105"
								style={{
									background:
										'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)',
									fontWeight: 600,
									fontSize: 13,
								}}
							>
								{editProduct.id ? 'Save Changes' : 'Add Product'}
							</button>
							<button
								onClick={() => setShowForm(false)}
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
