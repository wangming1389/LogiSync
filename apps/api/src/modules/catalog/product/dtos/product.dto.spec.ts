import { ListProductsQuerySchema, UpdateProductSchema } from './product.dto';

describe('Product DTO schemas', () => {
	it('TC-CAT-02 SKU Immutability', () => {
		const parsed = UpdateProductSchema.parse({
			name: 'Updated product',
			sku: 'NEW-SKU',
			status: 'active',
		});

		expect(parsed).toEqual({ name: 'Updated product' });
		expect(parsed).not.toHaveProperty('sku');
		expect(parsed).not.toHaveProperty('status');
	});

	it('TC-CAT-08 Pagination Limit', () => {
		expect(ListProductsQuerySchema.parse({ limit: 25 }).limit).toBe(25);
		expect(ListProductsQuerySchema.safeParse({ limit: 26 }).success).toBe(
			false,
		);
		expect(ListProductsQuerySchema.parse({}).limit).toBe(25);
	});
});
