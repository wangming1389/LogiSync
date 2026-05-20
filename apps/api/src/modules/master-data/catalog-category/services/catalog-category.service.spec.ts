import { ConflictException } from '@nestjs/common';
import {
	AuditAction,
	AuditStatus,
} from '../../../../core/audit/enums/audit.enums';
import { CatalogCategoryService } from './catalog-category.service';

describe('CatalogCategoryService', () => {
	const catalogCategoryRepo = {
		findByNameOrCode: jest.fn(),
		findById: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		disable: jest.fn(),
	};
	const auditLoggerService = {
		logInTx: jest.fn(),
	};
	const messageQueueService = {
		isReady: jest.fn(),
		publishMessage: jest.fn(),
	};
	const workspaceRepository = {
		findBySlug: jest.fn(),
	};
	const tx = {};
	const databaseService = {
		withTransaction: jest.fn((task: (tx: unknown) => Promise<unknown>) =>
			task(tx),
		),
	};

	let service: CatalogCategoryService;

	beforeEach(() => {
		jest.clearAllMocks();
		catalogCategoryRepo.findByNameOrCode.mockResolvedValue(null);
		catalogCategoryRepo.findById.mockResolvedValue({
			id: 'category-1',
			name: 'Packaging',
			code: 'PACK',
			description: 'Packaging materials',
			isActive: true,
		});
		catalogCategoryRepo.create.mockResolvedValue({
			id: 'category-1',
			name: 'Packaging',
		});
		catalogCategoryRepo.update.mockResolvedValue({
			id: 'category-1',
			name: 'Raw Materials',
			code: 'RAW',
			description: 'Raw inputs',
		});
		catalogCategoryRepo.disable.mockResolvedValue({
			id: 'category-1',
			name: 'Packaging',
			isActive: false,
			disabledAt: new Date('2026-05-16T00:00:00.000Z'),
		});
		auditLoggerService.logInTx.mockResolvedValue(undefined);
		messageQueueService.isReady.mockReturnValue(false);
		workspaceRepository.findBySlug.mockResolvedValue({ id: 'platform-1' });

		service = new CatalogCategoryService(
			catalogCategoryRepo as never,
			auditLoggerService as never,
			messageQueueService as never,
			workspaceRepository as never,
			databaseService as never,
		);
	});

	it('TC-MD-01 Name/Code Uniqueness', async () => {
		catalogCategoryRepo.findByNameOrCode.mockResolvedValueOnce({
			id: 'existing-category',
		});

		await expect(
			service.create(
				{ name: 'Packaging', code: 'PACK' },
				'admin-1',
				'127.0.0.1',
			),
		).rejects.toThrow(ConflictException);
	});

	it('TC-MD-02 Soft Disable Persistence', async () => {
		await service.disable('category-1', 'admin-1', '127.0.0.1');

		expect(catalogCategoryRepo.disable).toHaveBeenCalledWith('category-1', tx);
		expect(catalogCategoryRepo).not.toHaveProperty('delete');
		expect(auditLoggerService.logInTx).toHaveBeenCalledWith(
			tx,
			expect.objectContaining({
				action: AuditAction.CATALOG_CATEGORY_DISABLE_SUCCESS,
				changes: expect.objectContaining({ isActive: false }),
			}),
		);
	});

	it('TC-MD-08 Audit Diff Integrity', async () => {
		await service.update(
			'category-1',
			{
				name: 'Raw Materials',
				code: 'RAW',
				description: 'Raw inputs',
			},
			'admin-1',
			'127.0.0.1',
		);

		expect(auditLoggerService.logInTx).toHaveBeenCalledWith(
			tx,
			expect.objectContaining({
				action: AuditAction.CATALOG_CATEGORY_UPDATE_SUCCESS,
				status: AuditStatus.SUCCESS,
				changes: {
					old: {
						name: 'Packaging',
						code: 'PACK',
						description: 'Packaging materials',
					},
					new: {
						name: 'Raw Materials',
						code: 'RAW',
						description: 'Raw inputs',
					},
				},
			}),
		);
	});
});
