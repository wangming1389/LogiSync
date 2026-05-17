import { ProductSearchService } from './product-search.service';

describe('ProductSearchService', () => {
	const productSearchRepo = {
		search: jest.fn(),
	};
	const sessionRegistry = {
		get: jest.fn(),
		getJson: jest.fn(),
		setJsonEx: jest.fn(),
	};

	let service: ProductSearchService;

	beforeEach(() => {
		jest.clearAllMocks();
		productSearchRepo.search.mockResolvedValue({
			items: [
				{ id: 'product-1', workspaceId: 'supplier-1' },
				{ id: 'product-2', workspaceId: 'supplier-2' },
			],
			total: 2,
			limit: 25,
			offset: 0,
		});
		sessionRegistry.get.mockImplementation((key: string) => {
			if (key === 'reputation:supplier-1') return '80';
			if (key === 'reputation:supplier-2') return '95';
			return null;
		});
		sessionRegistry.getJson.mockResolvedValue(null);
		sessionRegistry.setJsonEx.mockResolvedValue(undefined);
		service = new ProductSearchService(
			productSearchRepo as never,
			sessionRegistry as never,
		);
	});

	it('TC-SRC-07 Reputation Source', async () => {
		const result = await service.search(
			{ sortBy: 'reputation_score', order: 'desc', limit: 25, offset: 0 },
			'buyer-workspace-1',
			'buyer-1',
		);

		expect(sessionRegistry.get).toHaveBeenCalledWith('reputation:supplier-1');
		expect(sessionRegistry.get).toHaveBeenCalledWith('reputation:supplier-2');
		expect(productSearchRepo.search).toHaveBeenCalledTimes(1);
		expect(result.items.map((item) => item.id)).toEqual([
			'product-2',
			'product-1',
		]);
		expect(result.items[0].reputationScore).toBe(95);
	});
});
