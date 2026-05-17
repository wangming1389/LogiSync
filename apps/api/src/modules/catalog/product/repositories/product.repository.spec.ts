import { and, eq } from 'drizzle-orm';
import { getDatabase } from '../../../../infrastructure/database';
import { ProductRepository } from './product.repository';

jest.mock('drizzle-orm', () => ({
	and: jest.fn((...conditions: unknown[]) => ({ conditions })),
	asc: jest.fn((field: unknown) => ({ direction: 'asc', field })),
	desc: jest.fn((field: unknown) => ({ direction: 'desc', field })),
	eq: jest.fn((left: unknown, right: unknown) => ({ left, right })),
	gte: jest.fn((left: unknown, right: unknown) => ({ op: 'gte', left, right })),
	ilike: jest.fn((left: unknown, right: unknown) => ({
		op: 'ilike',
		left,
		right,
	})),
	lte: jest.fn((left: unknown, right: unknown) => ({ op: 'lte', left, right })),
	or: jest.fn((...conditions: unknown[]) => ({ op: 'or', conditions })),
	sql: jest.fn(() => 'count(*)::int'),
}));

jest.mock('../../../../infrastructure/database', () => ({
	getDatabase: jest.fn(),
	schema: {
		products: {
			workspaceId: 'products.workspaceId',
			name: 'products.name',
			sku: 'products.sku',
			supplierCategoryId: 'products.supplierCategoryId',
			status: 'products.status',
			unitPrice: 'products.unitPrice',
			updatedAt: 'products.updatedAt',
		},
	},
}));

describe('ProductRepository', () => {
	const offset = jest.fn().mockResolvedValue([]);
	const limit = jest.fn(() => ({ offset }));
	const orderBy = jest.fn(() => ({ limit }));
	const where = jest.fn(() => ({ orderBy }));
	const from = jest.fn(() => ({ where }));
	const select = jest.fn(() => ({ from }));
	const db = { select };
	const cls = { get: jest.fn() };

	let repository: ProductRepository;

	beforeEach(() => {
		jest.clearAllMocks();
		(getDatabase as jest.Mock).mockReturnValue(db);
		cls.get.mockImplementation((key: string) =>
			key === 'workspaceId' ? 'workspace-1' : undefined,
		);
		repository = new ProductRepository(cls as never);
	});

	it('TC-CAT-07 Tenant Isolation', async () => {
		await repository.findAll({ limit: 25, offset: 0 });

		expect(eq).toHaveBeenCalledWith('products.workspaceId', 'workspace-1');
		expect(and).toHaveBeenCalledWith({
			left: 'products.workspaceId',
			right: 'workspace-1',
		});
		expect(where).toHaveBeenCalledWith({
			conditions: [{ left: 'products.workspaceId', right: 'workspace-1' }],
		});
	});
});
