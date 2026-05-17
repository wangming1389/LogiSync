import { ne } from 'drizzle-orm';
import { getDatabase } from '../../../../infrastructure/database';
import { ProductSearchRepository } from './product-search.repository';

jest.mock('drizzle-orm', () => ({
	and: jest.fn((...conditions: unknown[]) => ({ conditions })),
	asc: jest.fn((field: unknown) => ({ direction: 'asc', field })),
	desc: jest.fn((field: unknown) => ({ direction: 'desc', field })),
	eq: jest.fn((left: unknown, right: unknown) => ({ op: 'eq', left, right })),
	gte: jest.fn((left: unknown, right: unknown) => ({ op: 'gte', left, right })),
	ilike: jest.fn((left: unknown, right: unknown) => ({
		op: 'ilike',
		left,
		right,
	})),
	inArray: jest.fn((left: unknown, right: unknown) => ({
		op: 'inArray',
		left,
		right,
	})),
	lte: jest.fn((left: unknown, right: unknown) => ({ op: 'lte', left, right })),
	ne: jest.fn((left: unknown, right: unknown) => ({ op: 'ne', left, right })),
	or: jest.fn((...conditions: unknown[]) => ({ op: 'or', conditions })),
}));

jest.mock('../../../../infrastructure/database', () => ({
	getDatabase: jest.fn(),
	schema: {
		products: {
			id: 'products.id',
			workspaceId: 'products.workspaceId',
			supplierCategoryId: 'products.supplierCategoryId',
			uomId: 'products.uomId',
			sku: 'products.sku',
			name: 'products.name',
			description: 'products.description',
			unitPrice: 'products.unitPrice',
			minOrderQty: 'products.minOrderQty',
			status: 'products.status',
			imageUrls: 'products.imageUrls',
			attributes: 'products.attributes',
			updatedAt: 'products.updatedAt',
		},
		workspaces: {
			id: 'workspaces.id',
			name: 'workspaces.name',
			slug: 'workspaces.slug',
			status: 'workspaces.status',
		},
		supplierCategories: {
			id: 'supplierCategories.id',
			catalogCategoryId: 'supplierCategories.catalogCategoryId',
		},
	},
}));

describe('ProductSearchRepository', () => {
	const offset = jest.fn().mockResolvedValue([]);
	const limit = jest.fn(() => ({ offset }));
	const orderBy = jest.fn(() => ({ limit }));
	const where = jest.fn(() => ({ orderBy }));
	const innerJoin = jest.fn(() => ({ innerJoin, where }));
	const from = jest.fn(() => ({ innerJoin }));
	const select = jest.fn(() => ({ from }));
	const db = { select };

	let repository: ProductSearchRepository;

	beforeEach(() => {
		jest.clearAllMocks();
		(getDatabase as jest.Mock).mockReturnValue(db);
		repository = new ProductSearchRepository({ get: jest.fn() } as never);
	});

	it('TC-SRC-09 Tenant Search Guard', async () => {
		await repository.search({
			buyerWorkspaceId: 'buyer-workspace-1',
			limit: 25,
			offset: 0,
		});

		expect(ne).toHaveBeenCalledWith(
			'products.workspaceId',
			'buyer-workspace-1',
		);
	});
});
