"use client";
import {
	ChevronLeft,
	Edit2,
	Image,
	Plus,
	Search,
	ToggleLeft,
	ToggleRight,
	X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';

const SHADOW = '0px 8px 24px rgba(15,76,138,0.08)';
const PAGE_SIZE = 25;

type ProductStatus = 'draft' | 'active' | 'inactive';

type SupplierCategory = {
	id: string;
	code: string;
	name: string;
	description?: string;
	status: string;
};

type Uom = { id: string; code: string; name: string };

type Product = {
	id: string;
	sku: string;
	name: string;
	description?: string;
	supplierCategoryId?: string;
	supplierCategoryName?: string;
	uomId?: string;
	uomName?: string;
	unitPrice?: number;
	minOrderQty?: number;
	status?: ProductStatus;
	priceHistory?: { price: number; changedAt: string }[];
};

type DraftProduct = {
	id?: string;
	sku: string;
	name: string;
	description: string;
	supplierCategoryId: string;
	uomId: string;
	unitPrice: string;
	minOrderQty: string;
};

type DraftCategory = {
	id?: string;
	code: string;
	name: string;
	description: string;
};

const productInputStyle = {
	background: '#D5DAE3',
	borderBottom: '2px solid #00559F',
	color: '#191C1E',
	fontSize: 14,
};

export default function CatalogManagement() {
	const [tab, setTab] = useState<'products' | 'categories'>('products');
	const [products, setProducts] = useState<Product[]>([]);
	const [categories, setCategories] = useState<SupplierCategory[]>([]);
	const [uoms, setUoms] = useState<Uom[]>([]);
	const [search, setSearch] = useState('');
	const [filterCat, setFilterCat] = useState('All');
	const [offset, setOffset] = useState(0);
	const [loading, setLoading] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const [showForm, setShowForm] = useState(false);
	const [productError, setProductError] = useState('');
	const [categoryError, setCategoryError] = useState('');
	const [editProduct, setEditProduct] = useState<DraftProduct | null>(null);
	const [categoryDraft, setCategoryDraft] = useState<DraftCategory | null>(null);
	const [priceHistory, setPriceHistory] = useState<{ price: number; changedAt: string }[]>([]);

	const filteredProducts = useMemo(
		() =>
			products.filter((product) => {
				const searchValue = search.toLowerCase();
				const matchSearch =
					!searchValue ||
					product.name.toLowerCase().includes(searchValue) ||
					product.sku.toLowerCase().includes(searchValue);
				const categoryLabel = product.supplierCategoryId ?? product.supplierCategoryName ?? '';
				const matchCategory = filterCat === 'All' || categoryLabel === filterCat;
				return matchSearch && matchCategory;
			}),
		[products, search, filterCat],
	);

	async function fetchCategories() {
		const data: any = await api.get('/catalog/categories?limit=100');
		setCategories(data?.items ?? []);
	}

	async function fetchUoms() {
		const data: any = await api.get('/uom?limit=100');
		setUoms(data?.items ?? []);
	}

	async function fetchProducts() {
		setLoading(true);
		try {
			const params = new URLSearchParams({
				limit: String(PAGE_SIZE),
				offset: String(offset),
			});
			if (search.trim()) {
				params.set('search', search.trim());
			}
			const data: any = await api.get(`/catalog/products?${params.toString()}`);
			setProducts(data?.items ?? []);
		} catch (error) {
			console.error('Failed to fetch products', error);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		if (tab === 'products') {
			fetchCategories();
			fetchUoms();
			fetchProducts();
		} else {
			fetchCategories();
		}
	}, [tab, offset]);

	useEffect(() => {
		if (tab === 'products') {
			fetchProducts();
		}
	}, [search]);

	useEffect(() => {
		async function loadPriceHistory() {
			if (!selectedProduct?.id) return;
			try {
				const data: any = await api.get(`/catalog/products/${selectedProduct.id}/price-history`);
				setPriceHistory(data?.items ?? []);
			} catch (error) {
				console.error('Failed to load price history', error);
				setPriceHistory([]);
			}
		}

		loadPriceHistory();
	}, [selectedProduct?.id]);

	function openAddProduct() {
		setEditProduct({
			sku: '',
			name: '',
			description: '',
			supplierCategoryId: categories[0]?.id ?? '',
			uomId: uoms[0]?.id ?? '',
			unitPrice: '',
			minOrderQty: '',
		});
		setProductError('');
		setShowForm(true);
	}

	function openEditProduct(product: Product) {
		setEditProduct({
			id: product.id,
			sku: product.sku,
			name: product.name,
			description: product.description ?? '',
			supplierCategoryId: product.supplierCategoryId ?? '',
			uomId: product.uomId ?? '',
			unitPrice: String(product.unitPrice ?? ''),
			minOrderQty: String(product.minOrderQty ?? ''),
		});
		setProductError('');
		setShowForm(true);
	}

	function openAddCategory() {
		setCategoryDraft({ code: '', name: '', description: '' });
		setCategoryError('');
		setShowForm(true);
	}

	function openEditCategory(category: SupplierCategory) {
		setCategoryDraft({
			id: category.id,
			code: category.code,
			name: category.name,
			description: category.description ?? '',
		});
		setCategoryError('');
		setShowForm(true);
	}

	async function saveProduct() {
		if (!editProduct?.name || !editProduct.supplierCategoryId || !editProduct.uomId) {
			return;
		}
		setProductError('');
		try {
			const payload = {
				name: editProduct.name,
				description: editProduct.description,
				supplierCategoryId: editProduct.supplierCategoryId,
				uomId: editProduct.uomId,
				unitPrice: Number(editProduct.unitPrice || 0),
				minOrderQty: Number(editProduct.minOrderQty || 0),
				...(editProduct.id ? {} : { sku: editProduct.sku }),
			} as any;

			if (editProduct.id) {
				await api.patch(`/catalog/products/${editProduct.id}`, payload);
			} else {
				await api.post('/catalog/products', payload);
			}

			setShowForm(false);
			setEditProduct(null);
			fetchProducts();
		} catch (error: any) {
			if (error?.status === 409) {
				setProductError(error?.message || 'SKU already exists.');
			} else {
				setProductError(error?.message || 'Failed to save product.');
			}
		}
	}

	async function saveCategory() {
		if (!categoryDraft?.name || !categoryDraft.code) return;
		setCategoryError('');
		try {
			const payload = {
				code: categoryDraft.code,
				name: categoryDraft.name,
				description: categoryDraft.description,
			} as any;
			if (categoryDraft.id) {
				await api.patch(`/catalog/categories/${categoryDraft.id}`, payload);
			} else {
				await api.post('/catalog/categories', payload);
			}
			setShowForm(false);
			setCategoryDraft(null);
			fetchCategories();
		} catch (error: any) {
			if (error?.status === 409) {
				setCategoryError(error?.message || 'Duplicate category name or code.');
			} else {
				setCategoryError(error?.message || 'Failed to save category.');
			}
		}
	}

	async function deleteCategory(category: SupplierCategory) {
		try {
			await api.delete(`/catalog/categories/${category.id}`);
			fetchCategories();
		} catch (error: any) {
			alert(error?.message || 'Failed to delete category.');
		}
	}

	async function toggleCategoryStatus(category: SupplierCategory) {
		try {
			await api.patch(
				`/catalog/categories/${category.id}/${category.status === 'active' ? 'disable' : 'enable'}`,
				{},
			);
			fetchCategories();
		} catch (error: any) {
			alert(error?.message || 'Failed to update category status.');
		}
	}

	async function toggleProductVisibility(product: Product) {
		try {
			await api.patch(
				`/catalog/products/${product.id}/${product.status === 'active' ? 'unpublish' : 'publish'}`,
				{},
			);
			fetchProducts();
		} catch (error: any) {
			alert(error?.message || 'Failed to update product visibility.');
		}
	}

	const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE) || 1);

	return (
		<div className="p-6">
			<div className="flex items-center justify-between mb-6">
				<h1 style={{ color: '#191C1E' }}>Catalog Management</h1>
				<button
					onClick={tab === 'products' ? openAddProduct : openAddCategory}
					className="flex items-center gap-2 px-4 py-2.5 text-white rounded-[6px] transition-all hover:brightness-105"
					style={{
						background: 'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)',
						fontWeight: 600,
						fontSize: 12,
						letterSpacing: '0.06em',
					}}
				>
					<Plus className="w-4 h-4" /> ADD {tab === 'products' ? 'PRODUCT' : 'CATEGORY'}
				</button>
			</div>

			<div className="flex gap-1 p-1 rounded-lg mb-5 w-fit" style={{ background: '#E0E4EB' }}>
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
					<div className="flex gap-3 mb-4 flex-wrap">
						<div className="relative flex-1 min-w-56">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(25,28,30,0.4)' }} />
							<input value={search} onChange={(e) => { setSearch(e.target.value); setOffset(0); }} placeholder="Search product name or SKU..." className="w-full pl-9 pr-4 h-10 rounded-t-[6px] focus:outline-none" style={productInputStyle} />
						</div>
						<select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="px-3 h-10 rounded-t-[6px] focus:outline-none" style={{ background: '#D5DAE3', borderBottom: '2px solid #00559F', color: '#191C1E', fontSize: 14 }}>
							<option>All</option>
							{categories.map((category) => (
								<option key={category.id} value={category.id}>{category.name}</option>
							))}
						</select>
					</div>

					<div className="rounded-xl overflow-hidden" style={{ background: '#FFFFFF', boxShadow: SHADOW }}>
						<table className="w-full">
							<thead style={{ background: '#F2F4F7' }}>
								<tr>
									{['', 'SKU', 'NAME', 'CATEGORY', 'PRICE', 'MOQ', 'STATUS', 'ACTIONS'].map((h) => (
										<th key={h} className="text-left px-4 py-3" style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.05em', color: 'rgba(25,28,30,0.6)' }}>
											{h}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{filteredProducts.map((product, index) => (
									<tr key={product.id} style={{ background: index % 2 === 1 ? '#F7F9FC' : '#FFFFFF' }}>
										<td className="px-4 py-3">
											<button onClick={() => setSelectedProduct(product)} className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#F2F4F7' }}>
												<Image className="w-4 h-4" style={{ color: 'rgba(25,28,30,0.35)' }} />
											</button>
										</td>
										<td className="px-4 py-3" style={{ fontFamily: 'monospace', fontSize: 12, color: '#1A6EC4' }}>{product.sku}</td>
										<td className="px-4 py-3" style={{ fontSize: 14, color: '#191C1E', fontWeight: 500 }}>{product.name}</td>
										<td className="px-4 py-3" style={{ fontSize: 13, color: '#40484C' }}>{product.supplierCategoryName ?? product.supplierCategoryId ?? '—'}</td>
										<td className="px-4 py-3" style={{ fontSize: 14, color: '#191C1E' }}>{Number(product.unitPrice ?? 0).toLocaleString('vi-VN')}</td>
										<td className="px-4 py-3" style={{ fontSize: 14, color: 'rgba(25,28,30,0.7)' }}>{product.minOrderQty ?? 0}</td>
										<td className="px-4 py-3">
											<span className="px-3 py-1 rounded-full" style={{ background: product.status === 'active' ? '#C8F0D8' : product.status === 'draft' ? '#D3E4F5' : '#E0E4EB', color: product.status === 'active' ? '#1B6B3A' : '#191C1E', fontSize: 11, fontWeight: 500, letterSpacing: '0.05em' }}>
												{(product.status ?? 'draft').toUpperCase()}
											</span>
										</td>
										<td className="px-4 py-3">
											<div className="flex items-center gap-3">
												<button onClick={() => openEditProduct(product)} style={{ color: '#1A6EC4' }}>
													<Edit2 className="w-4 h-4" />
												</button>
												<button onClick={() => toggleProductVisibility(product)} className="inline-flex items-center gap-1 text-sm font-medium" style={{ color: product.status === 'active' ? '#40484C' : '#0F4C8A' }}>
													{product.status === 'active' ? <ToggleRight size={20} color="#0F4C8A" /> : <ToggleLeft size={20} color="#72787E" />}
													{product.status === 'active' ? 'Unpublish' : 'Publish'}
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					<div className="flex items-center justify-between mt-4 text-sm text-slate-600">
						<button onClick={() => setOffset((value) => Math.max(0, value - PAGE_SIZE))} disabled={offset === 0} className="px-3 py-2 rounded-lg border border-slate-200 disabled:opacity-40">Previous</button>
						<span>Page {Math.floor(offset / PAGE_SIZE) + 1}</span>
						<button onClick={() => setOffset((value) => value + PAGE_SIZE)} className="px-3 py-2 rounded-lg border border-slate-200">Next</button>
					</div>
				</>
			)}

			{tab === 'categories' && (
				<div className="rounded-xl overflow-hidden" style={{ background: '#FFFFFF', boxShadow: SHADOW }}>
					<table className="w-full">
						<thead style={{ background: '#F2F4F7' }}>
							<tr>
								{['CODE', 'NAME', 'DESCRIPTION', 'STATUS', 'ACTIONS'].map((h) => (
									<th key={h} className="text-left px-5 py-3" style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.05em', color: 'rgba(25,28,30,0.6)' }}>{h}</th>
								))}
							</tr>
						</thead>
						<tbody>
							{categories.map((category, index) => (
								<tr key={category.id} style={{ background: index % 2 === 1 ? '#F7F9FC' : '#FFFFFF' }}>
									<td className="px-5 py-3" style={{ fontSize: 14, color: '#191C1E', fontWeight: 500 }}>{category.code}</td>
									<td className="px-5 py-3" style={{ fontSize: 14, color: '#191C1E' }}>{category.name}</td>
									<td className="px-5 py-3" style={{ fontSize: 13, color: 'rgba(25,28,30,0.55)' }}>{category.description ?? '—'}</td>
									<td className="px-5 py-3"><StatusChip status={category.status} /></td>
									<td className="px-5 py-3">
										<div className="flex items-center gap-3">
											<button onClick={() => openEditCategory(category)} style={{ color: '#1A6EC4' }}><Edit2 className="w-4 h-4" /></button>
											<button onClick={() => toggleCategoryStatus(category)} className="inline-flex items-center gap-1 text-sm font-medium" style={{ color: category.status === 'active' ? '#40484C' : '#0F4C8A' }}>
												{category.status === 'active' ? <ToggleRight size={20} color="#0F4C8A" /> : <ToggleLeft size={20} color="#72787E" />}
												{category.status === 'active' ? 'Disable' : 'Enable'}
											</button>
											<button onClick={() => deleteCategory(category)} className="text-sm font-medium text-red-700">Delete</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{showForm && (
				<div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
					<div className="rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ background: 'rgba(255,255,255,0.93)', backdropFilter: 'blur(20px)', boxShadow: SHADOW }}>
						<div className="flex items-center justify-between mb-5">
							<h3 style={{ color: '#191C1E' }}>{tab === 'products' ? (editProduct?.id ? 'Edit Product' : 'Add Product') : (categoryDraft?.id ? 'Edit Category' : 'Add Category')}</h3>
							<button onClick={() => { setShowForm(false); setEditProduct(null); setCategoryDraft(null); }}>
								<X className="w-5 h-5" style={{ color: 'rgba(25,28,30,0.4)' }} />
							</button>
						</div>

						{tab === 'products' && editProduct && (
							<div className="space-y-4">
								{productError && <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{productError}</div>}
								<div className="grid grid-cols-2 gap-3">
									<div>
										<label className="block mb-1" style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(25,28,30,0.6)' }}>SKU *</label>
										<input value={editProduct.sku} onChange={(e) => setEditProduct({ ...editProduct, sku: e.target.value })} disabled={Boolean(editProduct.id)} className="w-full px-3 h-10 rounded-t-[6px] font-mono focus:outline-none disabled:opacity-60" style={productInputStyle} />
									</div>
									<div>
										<label className="block mb-1" style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(25,28,30,0.6)' }}>CATEGORY</label>
										<select value={editProduct.supplierCategoryId} onChange={(e) => setEditProduct({ ...editProduct, supplierCategoryId: e.target.value })} className="w-full px-3 h-10 rounded-t-[6px] focus:outline-none" style={{ background: '#D5DAE3', borderBottom: '2px solid #00559F', color: '#191C1E', fontSize: 14 }}>
											{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
										</select>
									</div>
								</div>
								<div>
									<label className="block mb-1" style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(25,28,30,0.6)' }}>NAME *</label>
									<input value={editProduct.name} onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })} className="w-full px-3 h-10 rounded-t-[6px] focus:outline-none" style={productInputStyle} />
								</div>
								<div>
									<label className="block mb-1" style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(25,28,30,0.6)' }}>DESCRIPTION</label>
									<textarea value={editProduct.description} onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-t-[6px] focus:outline-none resize-none" style={productInputStyle} />
								</div>
								<div className="grid grid-cols-2 gap-3">
									<div>
										<label className="block mb-1" style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(25,28,30,0.6)' }}>UNIT</label>
										<select value={editProduct.uomId} onChange={(e) => setEditProduct({ ...editProduct, uomId: e.target.value })} className="w-full px-3 h-10 rounded-t-[6px] focus:outline-none" style={{ background: '#D5DAE3', borderBottom: '2px solid #00559F', color: '#191C1E', fontSize: 14 }}>
											{uoms.map((uom) => <option key={uom.id} value={uom.id}>{uom.code} - {uom.name}</option>)}
										</select>
									</div>
									<div>
										<label className="block mb-1" style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(25,28,30,0.6)' }}>PRICE</label>
										<input type="number" value={editProduct.unitPrice} onChange={(e) => setEditProduct({ ...editProduct, unitPrice: e.target.value })} className="w-full px-3 h-10 rounded-t-[6px] focus:outline-none" style={productInputStyle} />
									</div>
								</div>
								<div>
									<label className="block mb-1" style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(25,28,30,0.6)' }}>MIN ORDER QTY</label>
									<input type="number" value={editProduct.minOrderQty} onChange={(e) => setEditProduct({ ...editProduct, minOrderQty: e.target.value })} className="w-full px-3 h-10 rounded-t-[6px] focus:outline-none" style={productInputStyle} />
								</div>
							</div>
						)}

						{tab === 'categories' && categoryDraft && (
							<div className="space-y-4">
								{categoryError && <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{categoryError}</div>}
								<div>
									<label className="block mb-1" style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(25,28,30,0.6)' }}>CODE *</label>
									<input value={categoryDraft.code} onChange={(e) => setCategoryDraft({ ...categoryDraft, code: e.target.value })} className="w-full px-3 h-10 rounded-t-[6px] focus:outline-none" style={productInputStyle} />
								</div>
								<div>
									<label className="block mb-1" style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(25,28,30,0.6)' }}>NAME *</label>
									<input value={categoryDraft.name} onChange={(e) => setCategoryDraft({ ...categoryDraft, name: e.target.value })} className="w-full px-3 h-10 rounded-t-[6px] focus:outline-none" style={productInputStyle} />
								</div>
								<div>
									<label className="block mb-1" style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(25,28,30,0.6)' }}>DESCRIPTION</label>
									<textarea value={categoryDraft.description} onChange={(e) => setCategoryDraft({ ...categoryDraft, description: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-t-[6px] focus:outline-none resize-none" style={productInputStyle} />
								</div>
							</div>
						)}

						<div className="flex gap-2 mt-5">
							<button onClick={() => { setShowForm(false); setEditProduct(null); setCategoryDraft(null); }} className="flex-1 py-2.5 rounded-[6px]" style={{ background: '#D5DAE3', color: '#191C1E', fontWeight: 500, fontSize: 13 }}>Cancel</button>
							<button onClick={tab === 'products' ? saveProduct : saveCategory} className="flex-1 py-2.5 text-white rounded-[6px] transition-all hover:brightness-105" style={{ background: 'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)', fontWeight: 600, fontSize: 13 }}>{tab === 'products' ? (editProduct?.id ? 'Save Changes' : 'Add Product') : (categoryDraft?.id ? 'Save Changes' : 'Add Category')}</button>
						</div>
					</div>
				</div>
			)}

			{selectedProduct && (
				<div className="fixed inset-0 bg-black/40 flex items-center justify-end z-50">
					<div className="w-full max-w-md h-full bg-white p-6 overflow-y-auto" style={{ boxShadow: SHADOW }}>
						<div className="flex items-center justify-between mb-4">
							<div>
								<h3 className="text-xl font-medium" style={{ color: '#191C1E' }}>{selectedProduct.name}</h3>
								<p className="text-sm text-slate-500">SKU {selectedProduct.sku}</p>
							</div>
							<button onClick={() => setSelectedProduct(null)}><ChevronLeft className="w-5 h-5" /></button>
						</div>
						<div className="space-y-4 text-sm">
							<div className="rounded-lg bg-slate-50 p-3">Category: {selectedProduct.supplierCategoryName ?? selectedProduct.supplierCategoryId ?? '—'}</div>
							<div className="rounded-lg bg-slate-50 p-3">Unit: {selectedProduct.uomName ?? selectedProduct.uomId ?? '—'}</div>
							<div className="rounded-lg bg-slate-50 p-3">Unit price: {Number(selectedProduct.unitPrice ?? 0).toLocaleString('vi-VN')}</div>
							<div className="rounded-lg bg-slate-50 p-3">MOQ: {selectedProduct.minOrderQty ?? 0}</div>
							<div>
								<h4 className="mb-2 font-medium" style={{ color: '#191C1E' }}>Price history</h4>
								<div className="space-y-2">
									{priceHistory.length > 0 ? priceHistory.map((item, index) => (
										<div key={`${item.changedAt}-${index}`} className="rounded-lg border border-slate-200 p-3">
											<div className="font-medium">{Number(item.price).toLocaleString('vi-VN')}</div>
											<div className="text-xs text-slate-500">{item.changedAt}</div>
										</div>
									)) : <div className="text-slate-500">No price history yet.</div>}
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
