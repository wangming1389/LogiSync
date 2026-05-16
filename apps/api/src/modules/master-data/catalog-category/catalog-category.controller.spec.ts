import { CatalogCategoryController } from './catalog-category.controller';

describe('CatalogCategoryController', () => {
	const catalogCategoryService = {
		findAll: jest.fn(),
		findAllActive: jest.fn(),
	};

	let controller: CatalogCategoryController;

	beforeEach(() => {
		jest.clearAllMocks();
		controller = new CatalogCategoryController(catalogCategoryService as never);
	});

	it('TC-MD-03 Visibility Filter', async () => {
		catalogCategoryService.findAll.mockResolvedValue([
			{ id: 'category-1', isActive: true },
			{ id: 'category-2', isActive: false },
		]);
		catalogCategoryService.findAllActive.mockResolvedValue([
			{ id: 'category-1', isActive: true },
		]);

		await expect(controller.findAll()).resolves.toEqual([
			{ id: 'category-1', isActive: true },
			{ id: 'category-2', isActive: false },
		]);
		await expect(controller.findAllActive()).resolves.toEqual([
			{ id: 'category-1', isActive: true },
		]);
		expect(catalogCategoryService.findAll).toHaveBeenCalledTimes(1);
		expect(catalogCategoryService.findAllActive).toHaveBeenCalledTimes(1);
	});
});
