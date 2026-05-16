import { ConflictException } from '@nestjs/common';
import { AuditAction, AuditStatus } from '../../../core/audit/audit.enums';
import { getDatabase } from '../../../infrastructure/database';
import { ProductService } from './product.service';

jest.mock('../../../infrastructure/database', () => ({
	getDatabase: jest.fn(),
}));

describe('ProductService', () => {
	const productRepo = {
		findBySku: jest.fn(),
		findById: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
		insertPriceHistory: jest.fn(),
		countByRfqPendingResponse: jest.fn(),
	};
	const uomRepo = {
		findById: jest.fn(),
	};
	const auditLoggerService = {
		logInTx: jest.fn(),
	};
	const objectStorageService = {
		isReady: jest.fn(),
		generateSignedUrl: jest.fn(),
		deleteFile: jest.fn(),
	};
	const mediaService = {
		uploadFile: jest.fn(),
		uploadFromUrl: jest.fn(),
	};
	const tx = {};
	const db = {
		transaction: jest.fn((task: (tx: unknown) => Promise<unknown>) => task(tx)),
	};

	let service: ProductService;

	const product = {
		id: 'product-1',
		workspaceId: 'workspace-1',
		supplierCategoryId: 'category-1',
		uomId: 'uom-1',
		sku: 'SKU-001',
		name: 'Steel Bolt',
		description: 'M8 bolt',
		unitPrice: 1000,
		minOrderQty: 1,
		status: 'draft',
		imageUrls: [],
		attributes: null,
	};

	beforeEach(() => {
		jest.clearAllMocks();
		(getDatabase as jest.Mock).mockReturnValue(db);
		uomRepo.findById.mockResolvedValue({ id: 'uom-1', isActive: true });
		productRepo.findBySku.mockResolvedValue(null);
		productRepo.findById.mockResolvedValue(product);
		productRepo.create.mockResolvedValue(product);
		productRepo.update.mockImplementation((_id, data) => ({
			...product,
			...data,
		}));
		productRepo.delete.mockResolvedValue(product);
		productRepo.insertPriceHistory.mockResolvedValue({ id: 'history-1' });
		productRepo.countByRfqPendingResponse.mockResolvedValue(0);
		auditLoggerService.logInTx.mockResolvedValue(undefined);
		objectStorageService.isReady.mockReturnValue(true);
		objectStorageService.generateSignedUrl.mockImplementation(
			(key: string) => `https://storage.test/${key}?signature=1`,
		);
		objectStorageService.deleteFile.mockResolvedValue(undefined);

		service = new ProductService(
			productRepo as never,
			uomRepo as never,
			auditLoggerService as never,
			objectStorageService as never,
			mediaService as never,
		);
	});

	it('TC-CAT-01 Unique SKU Check', async () => {
		productRepo.findBySku.mockResolvedValueOnce({ id: 'existing-product' });

		await expect(
			service.create(
				{
					supplierCategoryId: 'category-1',
					uomId: 'uom-1',
					sku: 'SKU-001',
					name: 'Steel Bolt',
					unitPrice: 1000,
					minOrderQty: 1,
				},
				'user-1',
				'workspace-1',
				'127.0.0.1',
			),
		).rejects.toThrow(ConflictException);
	});

	it('TC-CAT-03 Product Deletion Guard', async () => {
		productRepo.findById.mockResolvedValueOnce({
			...product,
			status: 'active',
		});

		await expect(
			service.deleteProduct('product-1', 'user-1', 'workspace-1', '127.0.0.1'),
		).rejects.toThrow(ConflictException);
	});

	it('TC-CAT-04 Price History Record', async () => {
		await service.update(
			'product-1',
			{ unitPrice: 1500 },
			'user-1',
			'workspace-1',
			'127.0.0.1',
		);

		expect(productRepo.insertPriceHistory).toHaveBeenCalledWith(
			{
				productId: 'product-1',
				unitPrice: 1000,
				changedBy: 'user-1',
			},
			tx,
		);
	});

	it('TC-CAT-05 Unpublish Warning', async () => {
		productRepo.findById.mockResolvedValueOnce({
			...product,
			status: 'active',
		});
		productRepo.countByRfqPendingResponse.mockResolvedValueOnce(2);

		const result = await service.unpublish(
			'product-1',
			'user-1',
			'workspace-1',
			'127.0.0.1',
		);

		expect(result).toEqual(
			expect.objectContaining({
				warning: 'This product is referenced in one or more open RFQs.',
			}),
		);
	});

	it('TC-CAT-06 Signed Media URLs', async () => {
		productRepo.findById.mockResolvedValueOnce({
			...product,
			imageUrls: ['products/product-1/image.png'],
		});

		const result = await service.findById('product-1');

		expect(objectStorageService.generateSignedUrl).toHaveBeenCalledWith(
			'products/product-1/image.png',
			3600,
		);
		expect(result.imageUrls).toEqual([
			'https://storage.test/products/product-1/image.png?signature=1',
		]);
	});

	it('TC-CAT-09 Audit Log Capture', async () => {
		productRepo.findById.mockResolvedValueOnce({ ...product, status: 'draft' });

		await service.publish('product-1', 'user-1', 'workspace-1', '127.0.0.1');

		expect(auditLoggerService.logInTx).toHaveBeenCalledWith(
			tx,
			expect.objectContaining({
				action: AuditAction.PRODUCT_PUBLISH_SUCCESS,
				status: AuditStatus.SUCCESS,
				changes: {
					old: { status: 'draft' },
					new: { status: 'active' },
				},
			}),
		);
	});
});
