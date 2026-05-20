import { BadRequestException, ConflictException } from '@nestjs/common';
import { AuditAction } from '../../../../core/audit/enums/audit.enums';
import { RfqService } from './rfq.service';

describe('RfqService', () => {
	const rfqRepo = {
		findByIdForBuyer: jest.fn(),
		countItems: jest.fn(),
		listItems: jest.fn(),
		findProductWorkspace: jest.fn(),
		upsertItem: jest.fn(),
		findItemById: jest.fn(),
		updateItem: jest.fn(),
	};
	const auditLoggerService = {
		logInTx: jest.fn(),
	};
	const messageQueueService = {
		isReady: jest.fn(),
	};
	const tx = {};
	const databaseService = {
		withTransaction: jest.fn((task: (tx: unknown) => Promise<unknown>) =>
			task(tx),
		),
	};

	const rfqCreatedCounter = {
		inc: jest.fn(),
	};

	let service: RfqService;

	const draftRfq = {
		id: 'rfq-1',
		status: 'draft',
		isLocked: false,
		note: null,
	};

	beforeEach(() => {
		jest.clearAllMocks();
		rfqRepo.findByIdForBuyer.mockResolvedValue(draftRfq);
		rfqRepo.countItems.mockResolvedValue(0);
		rfqRepo.listItems.mockResolvedValue([]);
		rfqRepo.findProductWorkspace.mockResolvedValue({
			workspaceId: 'supplier-workspace-1',
			status: 'active',
		});
		rfqRepo.upsertItem.mockResolvedValue({
			id: 'rfq-item-1',
			productId: 'product-1',
			quantity: 5,
		});
		rfqRepo.findItemById.mockResolvedValue({
			id: 'rfq-item-1',
			quantity: 5,
			targetPrice: null,
			deliveryDate: null,
			deliveryLocation: null,
			notes: null,
			status: 'pending',
		});
		rfqRepo.updateItem.mockResolvedValue({ id: 'rfq-item-1', quantity: 10 });
		auditLoggerService.logInTx.mockResolvedValue(undefined);
		messageQueueService.isReady.mockReturnValue(false);
		service = new RfqService(
			rfqRepo as never,
			auditLoggerService as never,
			messageQueueService as never,
			databaseService as never,
			rfqCreatedCounter,
		);
	});

	it('TC-SRC-01 Duplicate Item Merge', async () => {
		rfqRepo.countItems.mockResolvedValueOnce(200);
		rfqRepo.listItems.mockResolvedValueOnce([
			{ id: 'existing-item-1', productId: 'product-1' },
		]);

		await service.addItem(
			'rfq-1',
			{
				productId: 'product-1',
				quantity: 3,
			},
			'buyer-1',
			'buyer-workspace-1',
			'127.0.0.1',
		);

		expect(rfqRepo.upsertItem).toHaveBeenCalledWith(
			expect.objectContaining({
				rfqId: 'rfq-1',
				productId: 'product-1',
				quantity: 3,
			}),
			tx,
		);
		expect(auditLoggerService.logInTx).toHaveBeenCalledWith(
			tx,
			expect.objectContaining({
				action: AuditAction.RFQ_ITEM_UPSERT_SUCCESS,
				changes: expect.objectContaining({ mergedInto: 'existing-item-1' }),
			}),
		);
	});

	it('TC-SRC-02 RFQ Item Cap', async () => {
		rfqRepo.countItems.mockResolvedValueOnce(200);
		rfqRepo.listItems.mockResolvedValueOnce([]);

		await expect(
			service.addItem(
				'rfq-1',
				{
					productId: 'product-201',
					quantity: 1,
				},
				'buyer-1',
				'buyer-workspace-1',
				'127.0.0.1',
			),
		).rejects.toThrow(BadRequestException);
	});

	it('TC-SRC-04 Mutation Lock', async () => {
		rfqRepo.findByIdForBuyer.mockResolvedValueOnce({
			...draftRfq,
			status: 'pending_response',
			isLocked: true,
		});

		await expect(
			service.updateItem(
				'rfq-1',
				'rfq-item-1',
				{ quantity: 10 },
				'buyer-1',
				'buyer-workspace-1',
				'127.0.0.1',
			),
		).rejects.toThrow(ConflictException);
	});
});
