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
import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { getStoredAccessToken } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:9751';
const SHADOW = '0px 8px 24px rgba(15,76,138,0.08)';

type Tab = 'products' | 'categories';
type ApiList<T> = { items?: T[] } | T[] | undefined;
type ProductStatus = 'draft' | 'active' | 'inactive';

type SupplierCategory = {
	id: string;
	catalogCategoryId: string;
	name: string;
	description?: string | null;
	isActive?: boolean;
	status?: string;
};

type CatalogCategory = {
	id: string;
	name: string;
	code?: string;
	description?: string | null;
	isActive?: boolean;
	status?: string;
};

type Uom = {
	id: string;
	name: string;
	code: string;
	isActive?: boolean;
	status?: string;
};

type ProductApiItem = {
	id: string;
	supplierCategoryId: string;
	uomId: string;
	sku: string;
	name: string;
	description?: string | null;
	unitPrice: number;
	minOrderQty: number;
	status: ProductStatus;
	imageUrls?: string[] | null;
	attributes?: Record<string, unknown> | null;
};

type ProductRow = {
	id: string;
	supplierCategoryId: string;
	supplierCategoryName: string;
	uomId: string;
	uomLabel: string;
	sku: string;
	name: string;
	description: string;
	unitPrice: number;
	stock: number;
	status: ProductStatus;
	imageUrl: string | null;
	imageUrls: string[];
};

type ProductFormState = {
	id?: string;
	supplierCategoryId: string;
	uomId: string;
	sku: string;
	name: string;
	description: string;
	unitPrice: number;
	stock: number;
};

type CategoryFormState = {
	catalogCategoryId: string;
	name: string;
	description: string;
};

type CategoryOption = {
	id: string;
	name: string;
	description?: string | null;
	kind: 'supplier' | 'catalog';
};

const inputStyle = {
	background: '#D5DAE3',
	borderBottom: '2px solid #00559F',
	color: '#191C1E',
	fontSize: 14,
};

function toArray<T>(payload: ApiList<T>| any): T[] {
	if (!payload) return [];
    const unwrapped = payload?.data ?? payload;       // bỏ lớp axios response
    const inner = unwrapped?.data ?? unwrapped;       // bỏ lớp { success, data, error }
    if (Array.isArray(inner)) return inner;
    if (Array.isArray(inner?.items)) return inner.items;
    return [];
}

function StatusChip({ status }: { status: string }) {
	const active = status === 'active';
	const draft = status === 'draft';
	return (
		<span
			className="px-3 py-1 rounded-full"
			style={{
				background: active ? '#C8F0D8' : draft ? '#E8EEF7' : '#F5D0D0',
				color: active ? '#1B6B3A' : draft ? '#0F4C8A' : '#B42318',
				fontSize: 11,
				fontWeight: 500,
				letterSpacing: '0.05em',
			}}
		>
			{status?.toUpperCase()}
		</span>
	);
}

function formatCurrency(value: number) {
	return value.toLocaleString('vi-VN');
}

export default function CatalogManagement() {
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const [tab, setTab] = useState<Tab>('products');
	const [products, setProducts] = useState<ProductRow[]>([]);
	const [supplierCategories, setSupplierCategories] = useState<SupplierCategory[]>([]);
	const [catalogCategories, setCatalogCategories] = useState<CatalogCategory[]>([]);
	const [uoms, setUoms] = useState<Uom[]>([]);
	const [search, setSearch] = useState('');
	const [filterCatId, setFilterCatId] = useState('all');
	const [showForm, setShowForm] = useState(false);
	const [editProduct, setEditProduct] = useState<ProductFormState | null>(null);
	const [showCategoryForm, setShowCategoryForm] = useState(false);
	const [categoryForm, setCategoryForm] = useState<CategoryFormState>({
		catalogCategoryId: '',
		name: '',
		description: '',
	});
	const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
	const [imagePreviewUrl, setImagePreviewUrl] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [loadError, setLoadError] = useState('');
	const [actionError, setActionError] = useState('');

	const categoryProductCounts = useMemo(() => {
		const counts = new Map<string, number>();
		for (const product of products) {
			counts.set(product.supplierCategoryId, (counts.get(product.supplierCategoryId) ?? 0) + 1);
		}
		return counts;
	}, [products]);

	const productCategoryOptions = useMemo<CategoryOption[]>(() => {
		if (supplierCategories.length > 0) {
			return supplierCategories.map((category) => ({
				id: category.id,
				name: `${category.name}${catalogCategories.find((masterCategory) => masterCategory.id === category.catalogCategoryId)?.name ? ` · ${catalogCategories.find((masterCategory) => masterCategory.id === category.catalogCategoryId)?.name}` : ''}`,
				description: category.description,
				kind: 'supplier',
			}));
		}

		return catalogCategories.map((category) => ({
			id: category.id,
			name: `Master: ${category.name}`,
			description: category.description,
			kind: 'catalog',
		}));
	}, [catalogCategories, supplierCategories]);

	const catalogCategoryById = useMemo(() => {
		return new Map(catalogCategories.map((category) => [category.id, category]));
	}, [catalogCategories]);

	const filteredProducts = products.filter(
		(product) =>
			(product.name.toLowerCase().includes(search.toLowerCase()) ||
				product.sku.toLowerCase().includes(search.toLowerCase())) &&
			(filterCatId === 'all' || product.supplierCategoryId === filterCatId),
	);

	useEffect(() => {
		void (async () => {
			const masterData = await loadMasterData();
			await loadProducts(masterData);
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		return () => {
			if (imagePreviewUrl.startsWith('blob:')) {
				URL.revokeObjectURL(imagePreviewUrl);
			}
		};
	}, [imagePreviewUrl]);

	type MasterData = {
		categoryItems: SupplierCategory[];
		catalogCategoryItems: CatalogCategory[];
		uomItems: Uom[];
	};

	async function loadMasterData(): Promise<MasterData> {
		setLoadError('');
		const [categoryResult, catalogCategoryResult, uomResult] = await Promise.allSettled([
			api.get<ApiList<SupplierCategory>>('/catalog/categories'),
			api.get<ApiList<CatalogCategory>>('/catalog-categories'),
			api.get<ApiList<Uom>>('/uom'),
		]);

		console.log('catalog-categories raw:', JSON.stringify(catalogCategoryResult));

		const categoryItems =
			categoryResult.status === 'fulfilled' ? toArray(categoryResult.value) : [];
		const catalogCategoryItems =
			catalogCategoryResult.status === 'fulfilled'
				? toArray(catalogCategoryResult.value)
				: [];
		const uomItems = uomResult.status === 'fulfilled' ? toArray(uomResult.value) : [];

		if (categoryResult.status === 'rejected') {
			console.error('Error loading supplier categories', categoryResult.reason);
		}
		if (catalogCategoryResult.status === 'rejected') {
			console.error('Error loading master catalog categories', catalogCategoryResult.reason);
		}
		if (uomResult.status === 'rejected') {
			console.error('Error loading units of measure', uomResult.reason);
		}

		setSupplierCategories(categoryItems);
		setCatalogCategories(catalogCategoryItems);
		setUoms(uomItems);

		return {
			categoryItems,
			catalogCategoryItems,
			uomItems,
		};
	}

	async function loadProducts(masterData?: MasterData) {
		setIsLoading(true);
		try {
			const response: ApiList<ProductApiItem> = await api.get('/catalog/products');
			const productItems = toArray(response);
			const categoryMap = new Map(
				(masterData?.categoryItems ?? supplierCategories).map((item) => [item.id, item.name]),
			);
			const uomMap = new Map((masterData?.uomItems ?? uoms).map((item) => [item.id, item]));

			setProducts(
				productItems.map((item) => {
					const stockValue =
						typeof item.attributes?.stock === 'number'
							? (item.attributes.stock as number)
							: item.minOrderQty;
					const uom = uomMap.get(item.uomId);
					return {
						id: item.id,
						supplierCategoryId: item.supplierCategoryId,
						supplierCategoryName:
							categoryMap.get(item.supplierCategoryId) ?? 'Unassigned',
						uomId: item.uomId,
						uomLabel: uom ? `${uom.name} (${uom.code.toUpperCase()})` : 'Unknown',
						sku: item.sku,
						name: item.name,
						description: item.description ?? '',
						unitPrice: item.unitPrice,
						stock: stockValue,
						status: item.status ?? 'draft',
						imageUrl: item.imageUrls?.[0] ?? null,
						imageUrls: item.imageUrls ?? [],
					};
				}),
			);
		} catch (error) {
			console.error('Error loading supplier catalog', error);
			setLoadError('Không tải được dữ liệu Supplier từ database.');
		} finally {
			setIsLoading(false);
		}
	}

	function openAdd() {
		setActionError('');
		setSelectedImageFile(null);
		setImagePreviewUrl('');
		setEditProduct({
			supplierCategoryId: productCategoryOptions[0]?.id ?? '',
			uomId: uoms[0]?.id ?? '',
			sku: '',
			name: '',
			description: '',
			unitPrice: 0,
			stock: 0,
		});
		setShowForm(true);
	}

	function openEdit(product: ProductRow) {
		setActionError('');
		setSelectedImageFile(null);
		setImagePreviewUrl(product.imageUrl ?? '');
		setEditProduct({
			id: product.id,
			supplierCategoryId: product.supplierCategoryId,
			uomId: product.uomId,
			sku: product.sku,
			name: product.name,
			description: product.description,
			unitPrice: product.unitPrice,
			stock: product.stock,
		});
		setShowForm(true);
	}

	function closeForm() {
		setShowForm(false);
		setEditProduct(null);
		setSelectedImageFile(null);
		setImagePreviewUrl('');
		setActionError('');
	}

	function handleImageSelect(event: ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		if (!file) return;

		if (file.size > 5 * 1024 * 1024) {
			setActionError('Ảnh phải nhỏ hơn hoặc bằng 5MB.');
			event.target.value = '';
			return;
		}

		if (!['image/jpeg', 'image/png'].includes(file.type)) {
			setActionError('Chỉ hỗ trợ JPG hoặc PNG.');
			event.target.value = '';
			return;
		}

		if (imagePreviewUrl.startsWith('blob:')) {
			URL.revokeObjectURL(imagePreviewUrl);
		}

		setSelectedImageFile(file);
		setImagePreviewUrl(URL.createObjectURL(file));
		setActionError('');
	}

	async function uploadProductImage(productId: string) {
		if (!selectedImageFile) return;

		const token = getStoredAccessToken();
		const formData = new FormData();
		formData.append('file', selectedImageFile);

		const response = await fetch(
			`${API_BASE_URL}/catalog/products/${productId}/upload-image?replaceExisting=true`,
			{
				method: 'POST',
				headers: token ? { Authorization: `Bearer ${token}` } : undefined,
				body: formData,
			},
		);

		if (!response.ok) {
			throw new Error(`Upload failed with status ${response.status}`);
		}
	}

	async function saveProduct() {
		if (!editProduct) return;

		if (
			!editProduct.supplierCategoryId ||
			!editProduct.uomId ||
			!editProduct.sku.trim() ||
			!editProduct.name.trim()
		) {
			setActionError('Vui lòng nhập đầy đủ các trường bắt buộc.');
			return;
		}

		setIsSaving(true);
		setActionError('');

		let supplierCategoryId = editProduct.supplierCategoryId;

		if (supplierCategories.length === 0) {
			const selectedCatalogCategory = catalogCategories.find(
				(category) => category.id === editProduct.supplierCategoryId,
			);

			if (!selectedCatalogCategory) {
				setActionError('Vui lòng chọn danh mục để tiếp tục.');
				setIsSaving(false);
				return;
			}

			const existingSupplierCategory = supplierCategories.find(
				(category) =>
					category.catalogCategoryId === selectedCatalogCategory.id ||
					category.name === selectedCatalogCategory.name,
			);

			if (existingSupplierCategory) {
				supplierCategoryId = existingSupplierCategory.id;
			} else {
				const createdCategory: any = await api.post('/catalog/categories', {
					catalogCategoryId: selectedCatalogCategory.id,
					name: selectedCatalogCategory.name,
					description: selectedCatalogCategory.description ?? undefined,
				});
				supplierCategoryId = createdCategory?.data?.id ?? createdCategory?.id;
				if (!supplierCategoryId) {
					throw new Error('Missing created supplier category id');
				}
			}
		}

		const payload = {
			supplierCategoryId,
			uomId: editProduct.uomId,
			sku: editProduct.sku.trim(),
			name: editProduct.name.trim(),
			description: editProduct.description.trim() || undefined,
			unitPrice: Math.max(0, Math.trunc(editProduct.unitPrice)),
			minOrderQty: 1,
			attributes: {
				stock: Math.max(0, Math.trunc(editProduct.stock)),
			},
		};

		try {
			let productId = editProduct.id;

			if (productId) {
				await api.patch(`/catalog/products/${productId}`, payload);
			} else {
				const created: any = await api.post('/catalog/products', payload);
				console.log('created product response:', JSON.stringify(created));
				productId = created?.data?.data?.id ?? created?.data?.id ?? created?.id;
				if (!productId) {
					throw new Error('Missing created product id');
				}
			}

			if (selectedImageFile && productId) {
				await uploadProductImage(productId);
			}

			const masterData = await loadMasterData();
			await loadProducts(masterData);
			closeForm();
		} catch (error) {
			console.error('Error saving product', error);
			setActionError('Không thể lưu sản phẩm.');
		} finally {
			setIsSaving(false);
		}
	}

	async function toggleVisibility(product: ProductRow) {
		setActionError('');
		try {
			if (product.status === 'active') {
				await api.patch(`/catalog/products/${product.id}/unpublish`, {});
			} else {
				await api.patch(`/catalog/products/${product.id}/publish`, {});
			}
			await loadProducts();
		} catch (error) {
			console.error('Error updating product status', error);
			setActionError('Không thể cập nhật trạng thái sản phẩm.');
		}
	}

	function openAddCategory() {
		setActionError('');
		setCategoryForm({
			catalogCategoryId: catalogCategories[0]?.id ?? '',
			name: '',
			description: '',
		});
		setShowCategoryForm(true);
	}

	function closeCategoryForm() {
		setShowCategoryForm(false);
		setActionError('');
	}

	async function saveCategory() {
		if (!categoryForm.catalogCategoryId || !categoryForm.name.trim()) {
			setActionError('Vui lòng chọn catalog category và nhập tên danh mục.');
			return;
		}

		setIsSaving(true);
		setActionError('');
		try {
			await api.post('/catalog/categories', {
				catalogCategoryId: categoryForm.catalogCategoryId,
				name: categoryForm.name.trim(),
				description: categoryForm.description.trim() || undefined,
			});
			await loadMasterData();
			closeCategoryForm();
		} catch (error) {
			console.error('Error saving supplier category', error);
			setActionError('Không thể tạo supplier category.');
		} finally {
			setIsSaving(false);
		}
	}

	return (
		<div className="p-6">
			<div className="flex items-center justify-between mb-6 gap-4">
				<div>
					<div
						className="flex items-center gap-2 mb-2 cursor-pointer"
						style={{ color: '#0F4C8A', fontWeight: 500 }}
						onClick={() => window.history.back()}
					>
						<ChevronLeft size={20} />
						<span>Supplier / Catalog</span>
					</div>
					<h1 style={{ color: '#191C1E' }}>Catalog Management</h1>
				</div>
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

			<div
				className="flex gap-1 p-1 rounded-lg mb-5 w-fit"
				style={{ background: '#E0E4EB' }}
			>
				{(['products', 'categories'] as const).map((currentTab) => (
					<button
						key={currentTab}
						onClick={() => setTab(currentTab)}
						className="px-5 py-2 rounded-md capitalize transition-all"
						style={{
							background: tab === currentTab ? '#0F4C8A' : 'transparent',
							color: tab === currentTab ? '#FFFFFF' : 'rgba(25,28,30,0.6)',
							fontWeight: tab === currentTab ? 600 : 400,
							fontSize: 13,
						}}
					>
						{currentTab}
					</button>
				))}
			</div>

			{tab === 'categories' && (
				<div className="mb-4 flex justify-end">
					<button
						onClick={openAddCategory}
						className="flex items-center gap-2 px-4 py-2.5 text-white rounded-[6px] transition-all hover:brightness-105"
						style={{
							background: 'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)',
							fontWeight: 600,
							fontSize: 12,
							letterSpacing: '0.06em',
						}}
					>
						<Plus className="w-4 h-4" /> ADD CATEGORY
					</button>
				</div>
			)}

			{loadError && (
				<div className="mb-4 rounded-lg px-4 py-3" style={{ background: '#FFDAD6', color: '#BA1A1A' }}>
					{loadError}
				</div>
			)}

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
							value={filterCatId}
							onChange={(e) => setFilterCatId(e.target.value)}
							className="px-3 h-10 rounded-t-[6px] focus:outline-none"
							style={{
								background: '#D5DAE3',
								borderBottom: '2px solid #00559F',
								color: '#191C1E',
								fontSize: 14,
							}}
						>
							<option value="all">All</option>
							{supplierCategories.map((category) => (
								<option key={category.id} value={category.id}>
									{category.name}
								</option>
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
									{['', 'SKU', 'NAME', 'CATEGORY', 'PRICE (VND)', 'STOCK', 'STATUS', 'ACTIONS'].map((header) => (
										<th
											key={header}
											className="text-left px-4 py-3"
											style={{
												fontSize: 11,
												fontWeight: 500,
												letterSpacing: '0.05em',
												color: 'rgba(25,28,30,0.6)',
											}}
										>
											{header}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{isLoading ? (
									<tr>
										<td className="px-4 py-6 text-sm text-slate-500" colSpan={8}>
											Loading supplier products...
										</td>
									</tr>
								) : filteredProducts.length === 0 ? (
									<tr>
										<td className="px-4 py-6 text-sm text-slate-500" colSpan={8}>
											No products found.
										</td>
									</tr>
								) : (
									filteredProducts.map((product, index) => (
										<tr
											key={product.id}
											style={{ background: index % 2 === 1 ? '#F7F9FC' : '#FFFFFF' }}
											onMouseEnter={(event) =>
												((event.currentTarget as HTMLTableRowElement).style.background = '#E0E4EB')
											}
											onMouseLeave={(event) =>
												((event.currentTarget as HTMLTableRowElement).style.background =
													index % 2 === 1 ? '#F7F9FC' : '#FFFFFF')
											}
										>
											<td className="px-4 py-3">
												<div className="w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden" style={{ background: '#F2F4F7' }}>
													{product.imageUrl && product.imageUrl.startsWith('http') ? (
														<img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
													) : (
														<Image className="w-4 h-4" style={{ color: 'rgba(25,28,30,0.35)' }} />
													)}
												</div>
											</td>
											<td className="px-4 py-3" style={{ fontFamily: 'monospace', fontSize: 12, color: '#1A6EC4' }}>
												{product.sku}
											</td>
											<td className="px-4 py-3" style={{ fontSize: 14, color: '#191C1E', fontWeight: 500 }}>
												{product.name}
											</td>
											<td className="px-4 py-3">
												<span className="px-3 py-1 rounded-full" style={{ background: '#D3E4F5', color: '#0F4C8A', fontSize: 11, fontWeight: 500, letterSpacing: '0.05em' }}>
													{product.supplierCategoryName.toUpperCase()}
												</span>
											</td>
											<td className="px-4 py-3" style={{ fontSize: 14, color: '#191C1E' }}>
												{formatCurrency(product.unitPrice)}
											</td>
											<td className="px-4 py-3" style={{ fontSize: 14, color: 'rgba(25,28,30,0.7)' }}>
												{product.stock.toLocaleString()} MT
											</td>
											<td className="px-4 py-3">
												<StatusChip status={product.status} />
											</td>
											<td className="px-4 py-3">
												<div className="flex items-center gap-2">
													<button onClick={() => toggleVisibility(product)} className="flex items-center gap-1">
														{product.status === 'active' ? (
															<>
																<ToggleRight className="w-5 h-5" style={{ color: '#1B6B3A' }} />
																<span style={{ fontSize: 12, color: '#1B6B3A' }}>Public</span>
															</>
														) : (
															<>
																<ToggleLeft className="w-5 h-5" style={{ color: 'rgba(25,28,30,0.35)' }} />
																<span style={{ fontSize: 12, color: 'rgba(25,28,30,0.5)' }}>Hidden</span>
															</>
														)}
													</button>
													<button onClick={() => openEdit(product)} style={{ color: '#1A6EC4' }}>
														<Edit2 className="w-4 h-4" />
													</button>
												</div>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</>
			)}

			{tab === 'categories' && (
				<div className="rounded-xl overflow-hidden" style={{ background: '#FFFFFF', boxShadow: SHADOW }}>
					<table className="w-full">
						<thead style={{ background: '#F2F4F7' }}>
							<tr>
								{['NAME', 'MASTER CATEGORY', 'DESCRIPTION', 'PRODUCTS', 'STATUS'].map((header) => (
									<th
										key={header}
										className="text-left px-5 py-3"
										style={{
											fontSize: 11,
											fontWeight: 500,
											letterSpacing: '0.05em',
											color: 'rgba(25,28,30,0.6)',
										}}
									>
										{header}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{supplierCategories.length === 0 ? (
								<tr>
									<td className="px-5 py-6 text-sm text-slate-500" colSpan={5}>
										No supplier categories found.
									</td>
								</tr>
							) : (
								supplierCategories.map((category, index) => (
									<tr
										key={category.id}
										style={{ background: index % 2 === 1 ? '#F7F9FC' : '#FFFFFF' }}
										onMouseEnter={(event) =>
											((event.currentTarget as HTMLTableRowElement).style.background = '#E0E4EB')
										}
										onMouseLeave={(event) =>
											((event.currentTarget as HTMLTableRowElement).style.background =
												index % 2 === 1 ? '#F7F9FC' : '#FFFFFF')
										}
									>
										<td className="px-5 py-3" style={{ fontSize: 14, color: '#191C1E', fontWeight: 500 }}>
											{category.name}
										</td>
									<td className="px-5 py-3" style={{ fontSize: 13, color: 'rgba(25,28,30,0.55)' }}>
										{catalogCategoryById.get(category.catalogCategoryId)?.name ?? '—'}
									</td>
										<td className="px-5 py-3" style={{ fontSize: 13, color: 'rgba(25,28,30,0.55)' }}>
											{category.description ?? '—'}
										</td>
										<td className="px-5 py-3" style={{ fontSize: 14, color: 'rgba(25,28,30,0.7)' }}>
											{categoryProductCounts.get(category.id) ?? 0}
										</td>
										<td className="px-5 py-3">
											<StatusChip status={category.status ?? (category.isActive === false ? 'inactive' : 'active')} />
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			)}

			{showCategoryForm && (
				<div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
					<div className="rounded-xl p-6 w-full max-w-lg" style={{ background: 'rgba(255,255,255,0.93)', backdropFilter: 'blur(20px)', boxShadow: SHADOW }}>
						<div className="flex items-center justify-between mb-5">
							<h3 style={{ color: '#191C1E' }}>Add Supplier Category</h3>
							<button onClick={closeCategoryForm}>
								<X className="w-5 h-5" style={{ color: 'rgba(25,28,30,0.4)' }} />
							</button>
						</div>

						<div className="space-y-4">
							<div>
								<label className="block mb-1" style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(25,28,30,0.6)' }}>
									MASTER CATALOG CATEGORY
								</label>
								<select value={categoryForm.catalogCategoryId} onChange={(event) => setCategoryForm({ ...categoryForm, catalogCategoryId: event.target.value })} className="w-full px-3 h-10 rounded-t-[6px] focus:outline-none" style={{ background: '#D5DAE3', borderBottom: '2px solid #00559F', color: '#191C1E', fontSize: 14 }}>
									{catalogCategories.length === 0 ? <option value="">No master categories</option> : null}
									{catalogCategories.map((catalogCategory) => (
										<option key={catalogCategory.id} value={catalogCategory.id}>
											{catalogCategory.name}
										</option>
									))}
								</select>
							</div>
							<div>
								<label className="block mb-1" style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(25,28,30,0.6)' }}>
									CATEGORY NAME
								</label>
								<input value={categoryForm.name} onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })} className="w-full px-3 h-10 rounded-t-[6px] focus:outline-none" style={inputStyle} />
							</div>
							<div>
								<label className="block mb-1" style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(25,28,30,0.6)' }}>
									DESCRIPTION
								</label>
								<textarea value={categoryForm.description} onChange={(event) => setCategoryForm({ ...categoryForm, description: event.target.value })} className="w-full px-3 py-2 rounded-t-[6px] min-h-[96px] focus:outline-none" style={inputStyle} />
							</div>
						</div>

						<div className="flex gap-2 mt-5">
							<button onClick={saveCategory} disabled={isSaving} className="flex-1 py-2.5 text-white rounded-[6px] transition-all hover:brightness-105 disabled:opacity-60" style={{ background: 'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)', fontWeight: 600, fontSize: 13 }}>
								{isSaving ? 'Saving...' : 'Create Category'}
							</button>
							<button onClick={closeCategoryForm} className="flex-1 py-2.5 rounded-[6px]" style={{ background: '#D5DAE3', color: '#191C1E', fontWeight: 500, fontSize: 13 }}>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}

			{showForm && editProduct && (
				<div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
					<div className="rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ background: 'rgba(255,255,255,0.93)', backdropFilter: 'blur(20px)', boxShadow: SHADOW }}>
						<div className="flex items-center justify-between mb-5">
							<h3 style={{ color: '#191C1E' }}>{editProduct.id ? 'Edit Product' : 'Add Product'}</h3>
							<button onClick={closeForm}>
								<X className="w-5 h-5" style={{ color: 'rgba(25,28,30,0.4)' }} />
							</button>
						</div>

						{actionError && (
							<div className="mb-4 rounded-lg px-4 py-3" style={{ background: '#FFDAD6', color: '#BA1A1A' }}>
								{actionError}
							</div>
						)}

						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="block mb-1" style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(25,28,30,0.6)' }}>
										SKU *
									</label>
									<input value={editProduct.sku} onChange={(event) => setEditProduct({ ...editProduct, sku: event.target.value })} className="w-full px-3 h-10 rounded-t-[6px] font-mono focus:outline-none" style={inputStyle} />
								</div>
								<div>
									<label className="block mb-1" style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(25,28,30,0.6)' }}>
										CATEGORY
									</label>
									<select value={editProduct.supplierCategoryId} onChange={(event) => setEditProduct({ ...editProduct, supplierCategoryId: event.target.value })} className="w-full px-3 h-10 rounded-t-[6px] focus:outline-none" style={{ background: '#D5DAE3', borderBottom: '2px solid #00559F', color: '#191C1E', fontSize: 14 }}>
										{productCategoryOptions.length === 0 ? <option value="">No categories</option> : null}
										{productCategoryOptions.map((category) => (
											<option key={category.id} value={category.id}>
												{category.name}
											</option>
										))}
									</select>
									{supplierCategories.length === 0 && catalogCategories.length > 0 ? (
										<p className="mt-1 text-xs" style={{ color: 'rgba(25,28,30,0.55)' }}>
											Workspace này chưa có supplier category, nên danh sách đang lấy từ master catalog và sẽ tự tạo category tương ứng khi lưu product.
										</p>
									) : null}
								</div>
							</div>

							<div>
								<label className="block mb-1" style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(25,28,30,0.6)' }}>
									PRODUCT NAME *
								</label>
								<input value={editProduct.name} onChange={(event) => setEditProduct({ ...editProduct, name: event.target.value })} className="w-full px-3 h-10 rounded-t-[6px] focus:outline-none" style={inputStyle} />
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="block mb-1" style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(25,28,30,0.6)' }}>
										PRICE (VND)
									</label>
									<input type="number" value={editProduct.unitPrice} onChange={(event) => setEditProduct({ ...editProduct, unitPrice: Number(event.target.value) })} className="w-full px-3 h-10 rounded-t-[6px] focus:outline-none" style={inputStyle} />
								</div>
								<div>
									<label className="block mb-1" style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(25,28,30,0.6)' }}>
										UNIT
									</label>
									<select value={editProduct.uomId} onChange={(event) => setEditProduct({ ...editProduct, uomId: event.target.value })} className="w-full px-3 h-10 rounded-t-[6px] focus:outline-none" style={{ background: '#D5DAE3', borderBottom: '2px solid #00559F', color: '#191C1E', fontSize: 14 }}>
										{uoms.length === 0 ? <option value="">No units</option> : null}
										{uoms.map((uom) => (
											<option key={uom.id} value={uom.id}>
												{uom.name} ({uom.code.toUpperCase()})
											</option>
										))}
									</select>
								</div>
							</div>

							<div>
								<label className="block mb-1" style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(25,28,30,0.6)' }}>
									STOCK QTY
								</label>
								<input type="number" value={editProduct.stock} onChange={(event) => setEditProduct({ ...editProduct, stock: Number(event.target.value) })} className="w-full px-3 h-10 rounded-t-[6px] focus:outline-none" style={inputStyle} />
							</div>

							<div>
								<label className="block mb-1" style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(25,28,30,0.6)' }}>
									UPLOAD IMAGE (≤5MB)
								</label>
								<div onClick={() => fileInputRef.current?.click()} className="rounded-lg p-4 text-center cursor-pointer transition-colors" style={{ border: '2px dashed #C1C6D4', background: '#F2F4F7' }}>
									{imagePreviewUrl ? (
										<img src={imagePreviewUrl} alt="Selected preview" className="mx-auto mb-2 h-24 w-24 rounded-lg object-cover" />
									) : (
										<Image className="w-6 h-6 mx-auto mb-1" style={{ color: 'rgba(25,28,30,0.3)' }} />
									)}
									<span style={{ fontSize: 13, color: 'rgba(25,28,30,0.45)' }}>
										Click to upload (JPG, PNG ≤ 5MB)
									</span>
								</div>
								<input ref={fileInputRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleImageSelect} />
							</div>
						</div>

						<div className="flex gap-2 mt-5">
							<button onClick={saveProduct} disabled={isSaving} className="flex-1 py-2.5 text-white rounded-[6px] transition-all hover:brightness-105 disabled:opacity-60" style={{ background: 'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)', fontWeight: 600, fontSize: 13 }}>
								{isSaving ? 'Saving...' : editProduct.id ? 'Save Changes' : 'Add Product'}
							</button>
							<button onClick={closeForm} className="flex-1 py-2.5 rounded-[6px]" style={{ background: '#D5DAE3', color: '#191C1E', fontWeight: 500, fontSize: 13 }}>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
