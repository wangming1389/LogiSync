import { UomController } from './uom.controller';

describe('UomController', () => {
	const uomService = {
		findAll: jest.fn(),
		findAllActive: jest.fn(),
	};

	let controller: UomController;

	beforeEach(() => {
		jest.clearAllMocks();
		controller = new UomController(uomService as never);
	});

	it('TC-MD-03 Visibility Filter', async () => {
		uomService.findAll.mockResolvedValue([
			{ id: 'uom-1', isActive: true },
			{ id: 'uom-2', isActive: false },
		]);
		uomService.findAllActive.mockResolvedValue([
			{ id: 'uom-1', isActive: true },
		]);

		await expect(controller.findAll()).resolves.toEqual([
			{ id: 'uom-1', isActive: true },
			{ id: 'uom-2', isActive: false },
		]);
		await expect(controller.findAllActive()).resolves.toEqual([
			{ id: 'uom-1', isActive: true },
		]);
		expect(uomService.findAll).toHaveBeenCalledTimes(1);
		expect(uomService.findAllActive).toHaveBeenCalledTimes(1);
	});
});
