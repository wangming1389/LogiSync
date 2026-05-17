import { ConflictException } from '@nestjs/common';
import {
	AuditAction,
	AuditStatus,
} from '../../../../core/audit/enums/audit.enums';
import { getDatabase } from '../../../../infrastructure/database';
import { UomService } from './uom.service';

jest.mock('../../../../infrastructure/database', () => ({
	getDatabase: jest.fn(),
}));

describe('UomService', () => {
	const uomRepo = {
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
	const db = {
		transaction: jest.fn((task: (tx: unknown) => Promise<unknown>) => task(tx)),
	};

	let service: UomService;

	beforeEach(() => {
		jest.clearAllMocks();
		(getDatabase as jest.Mock).mockReturnValue(db);
		uomRepo.findByNameOrCode.mockResolvedValue(null);
		uomRepo.findById.mockResolvedValue({
			id: 'uom-1',
			name: 'Kilogram',
			code: 'KG',
			isActive: true,
		});
		uomRepo.create.mockResolvedValue({ id: 'uom-1', name: 'Kilogram' });
		uomRepo.update.mockResolvedValue({ id: 'uom-1', name: 'Gram', code: 'G' });
		uomRepo.disable.mockResolvedValue({
			id: 'uom-1',
			name: 'Kilogram',
			isActive: false,
			disabledAt: new Date('2026-05-16T00:00:00.000Z'),
		});
		auditLoggerService.logInTx.mockResolvedValue(undefined);
		messageQueueService.isReady.mockReturnValue(false);
		workspaceRepository.findBySlug.mockResolvedValue({ id: 'platform-1' });

		service = new UomService(
			uomRepo as never,
			auditLoggerService as never,
			messageQueueService as never,
			workspaceRepository as never,
		);
	});

	it('TC-MD-01 Name/Code Uniqueness', async () => {
		uomRepo.findByNameOrCode.mockResolvedValueOnce({ id: 'existing-uom' });

		await expect(
			service.create({ name: 'Kilogram', code: 'KG' }, 'admin-1', '127.0.0.1'),
		).rejects.toThrow(ConflictException);
	});

	it('TC-MD-02 Soft Disable Persistence', async () => {
		await service.disable('uom-1', 'admin-1', '127.0.0.1');

		expect(uomRepo.disable).toHaveBeenCalledWith('uom-1', tx);
		expect(uomRepo).not.toHaveProperty('delete');
		expect(auditLoggerService.logInTx).toHaveBeenCalledWith(
			tx,
			expect.objectContaining({
				action: AuditAction.UOM_DISABLE_SUCCESS,
				changes: expect.objectContaining({ isActive: false }),
			}),
		);
	});

	it('TC-MD-08 Audit Diff Integrity', async () => {
		await service.update(
			'uom-1',
			{ name: 'Gram', code: 'G' },
			'admin-1',
			'127.0.0.1',
		);

		expect(auditLoggerService.logInTx).toHaveBeenCalledWith(
			tx,
			expect.objectContaining({
				action: AuditAction.UOM_UPDATE_SUCCESS,
				status: AuditStatus.SUCCESS,
				changes: {
					old: { name: 'Kilogram', code: 'KG' },
					new: { name: 'Gram', code: 'G' },
				},
			}),
		);
	});
});
