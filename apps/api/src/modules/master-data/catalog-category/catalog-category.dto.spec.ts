import { UpdateCatalogCategorySchema } from './catalog-category.dto';

describe('UpdateCatalogCategorySchema', () => {
	it('TC-MD-04 Status Guard', () => {
		const parsed = UpdateCatalogCategorySchema.parse({
			name: 'Packaging',
			isActive: false,
		});

		expect(parsed).toEqual({ name: 'Packaging' });
		expect(parsed).not.toHaveProperty('isActive');
	});
});
