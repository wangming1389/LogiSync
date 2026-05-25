import { api } from '@/lib/api';

export function getSupplierCategories() {
	return api.get('/catalog/categories');
}

export function getCatalogCategories() {
	return api.get('/catalog-categories');
}

export function getUnitsOfMeasure() {
	return api.get('/uom');
}

export function getSupplierProducts() {
	return api.get('/catalog/products');
}

export function createSupplierCategory(payload: {
	catalogCategoryId: string;
	name: string;
	description?: string;
}) {
	return api.post('/catalog/categories', payload);
}

export function createProduct(payload: unknown) {
	return api.post('/catalog/products', payload);
}

export function updateProduct(productId: string, payload: unknown) {
	return api.patch(`/catalog/products/${productId}`, payload);
}

export function publishProduct(productId: string) {
	return api.patch(`/catalog/products/${productId}/publish`, {});
}

export function unpublishProduct(productId: string) {
	return api.patch(`/catalog/products/${productId}/unpublish`, {});
}

export async function uploadProductImageFile(
	productId: string,
	file: File,
	replaceExisting = true,
) {
	const formData = new FormData();
	formData.append('file', file);

	return api.form(
		`/catalog/products/${productId}/upload-image?replaceExisting=${String(
			replaceExisting,
		)}`,
		formData,
	);
}
