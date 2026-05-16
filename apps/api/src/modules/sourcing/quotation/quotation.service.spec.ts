import { ConflictException } from '@nestjs/common';
import {
	AuditAction,
	AuditStatus,
} from '../../../core/audit/enums/audit.enums';
import { getDatabase } from '../../../infrastructure/database';
import { UserRole } from '../../iam/auth/enums/user-role.enum';
import { QuotationService } from './quotation.service';

jest.mock('../../../infrastructure/database', () => ({
	getDatabase: jest.fn(),
	schema: {
		rfqs: { id: 'rfqs.id', parentRfqId: 'rfqs.parentRfqId' },
	},
}));

describe('QuotationService', () => {
	const quotationRepo = {
		findById: jest.fn(),
		findLatestNegotiationRound: jest.fn(),
		insertNegotiationRound: jest.fn(),
		findByIdForUpdate: jest.fn(),
		findRfqById: jest.fn(),
		updateQuotation: jest.fn(),
		rejectOtherQuotationsForRfq: jest.fn(),
		cancelSiblingChildRfqs: jest.fn(),
		closeRfq: jest.fn(),
		createPurchaseOrder: jest.fn(),
		listItems: jest.fn(),
	};
	const rfqRepo = {};
	const auditLoggerService = {
		logInTx: jest.fn(),
	};
	const tx = {
		select: jest.fn(),
	};
	const db = {
		transaction: jest.fn((task: (tx: unknown) => Promise<unknown>) => task(tx)),
	};

	let service: QuotationService;

	const quotation = {
		id: 'quotation-1',
		rfqId: 'child-rfq-1',
		supplierWorkspaceId: 'supplier-workspace-1',
		status: 'submitted',
		isLocked: false,
		totalPrice: 10_000,
		unitPrice: 1_000,
		estimatedDeliveryDate: new Date('2026-06-01T00:00:00.000Z'),
		deliveryTerms: 'Delivered to warehouse',
	};

	beforeEach(() => {
		jest.clearAllMocks();
		(getDatabase as jest.Mock).mockReturnValue(db);
		tx.select.mockReturnValue({
			from: jest.fn().mockReturnValue({
				where: jest.fn().mockResolvedValue([{ id: 'sibling-rfq-1' }]),
			}),
		});
		quotationRepo.findById.mockResolvedValue(quotation);
		quotationRepo.findLatestNegotiationRound.mockResolvedValue(null);
		quotationRepo.insertNegotiationRound.mockResolvedValue({
			id: 'round-1',
			role: 'BUYER',
		});
		quotationRepo.findByIdForUpdate.mockResolvedValue(quotation);
		quotationRepo.findRfqById.mockResolvedValue({
			id: 'child-rfq-1',
			parentRfqId: 'parent-rfq-1',
			buyerWorkspaceId: 'buyer-workspace-1',
		});
		quotationRepo.updateQuotation.mockResolvedValue({
			...quotation,
			status: 'selected',
			isLocked: true,
		});
		quotationRepo.rejectOtherQuotationsForRfq.mockResolvedValue(undefined);
		quotationRepo.cancelSiblingChildRfqs.mockResolvedValue(undefined);
		quotationRepo.closeRfq.mockResolvedValue(undefined);
		quotationRepo.createPurchaseOrder.mockResolvedValue({
			id: 'po-1',
			finalUnitPrice: 1000,
			finalPaymentTerms: 'Delivered to warehouse',
		});
		quotationRepo.listItems.mockResolvedValue([
			{ id: 'quotation-item-1', quantity: 10 },
		]);
		auditLoggerService.logInTx.mockResolvedValue(undefined);

		service = new QuotationService(
			quotationRepo as never,
			rfqRepo as never,
			auditLoggerService as never,
		);
	});

	it('TC-SRC-03 Negotiation Turn Guard', async () => {
		quotationRepo.findLatestNegotiationRound.mockResolvedValueOnce({
			id: 'round-1',
			role: 'BUYER',
		});

		await expect(
			service.negotiate(
				'quotation-1',
				{ proposedPrice: 900, proposedDeliveryDays: 7 },
				'buyer-1',
				UserRole.BUYER_STAFF,
				'buyer-workspace-1',
				'127.0.0.1',
			),
		).rejects.toThrow(ConflictException);
	});

	it('TC-SRC-04 Mutation Lock', async () => {
		quotationRepo.findById.mockResolvedValueOnce({
			...quotation,
			isLocked: true,
		});

		await expect(
			service.negotiate(
				'quotation-1',
				{ proposedPrice: 900, proposedDeliveryDays: 7 },
				'supplier-1',
				UserRole.SUPPLIER_STAFF,
				'supplier-workspace-1',
				'127.0.0.1',
			),
		).rejects.toThrow(ConflictException);
	});

	it('TC-SRC-05 PO Snapshot Integrity', async () => {
		await service.selectQuotation(
			'quotation-1',
			'buyer-1',
			UserRole.BUYER_STAFF,
			'buyer-workspace-1',
			'127.0.0.1',
		);

		expect(quotationRepo.createPurchaseOrder).toHaveBeenCalledWith(
			expect.objectContaining({
				quotationId: 'quotation-1',
				buyerWorkspaceId: 'buyer-workspace-1',
				supplierWorkspaceId: 'supplier-workspace-1',
				totalPrice: 10_000,
				finalUnitPrice: 1_000,
				finalPaymentTerms: 'Delivered to warehouse',
				finalDeliveryDate: new Date('2026-06-01T00:00:00.000Z'),
				isLocked: true,
			}),
			tx,
		);
	});

	it('TC-SRC-08 Atomic Selection', async () => {
		await service.selectQuotation(
			'quotation-1',
			'buyer-1',
			UserRole.BUYER_STAFF,
			'buyer-workspace-1',
			'127.0.0.1',
		);

		expect(db.transaction).toHaveBeenCalledTimes(1);
		expect(quotationRepo.updateQuotation).toHaveBeenCalledWith(
			'quotation-1',
			{ status: 'selected', isLocked: true },
			tx,
		);
		expect(quotationRepo.closeRfq).toHaveBeenCalledWith('parent-rfq-1', tx);
		expect(quotationRepo.createPurchaseOrder).toHaveBeenCalledWith(
			expect.any(Object),
			tx,
		);
		expect(auditLoggerService.logInTx).toHaveBeenCalledWith(
			tx,
			expect.objectContaining({
				action: AuditAction.QUOTATION_SELECT_SUCCESS,
				status: AuditStatus.SUCCESS,
			}),
		);
	});
});
