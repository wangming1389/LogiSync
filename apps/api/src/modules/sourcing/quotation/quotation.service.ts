/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call */
import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import {
	AuditAction,
	AuditStatus,
} from '../../../core/audit/enums/audit.enums';
import { AuditLoggerService } from '../../../core/audit/services/audit-logger.service';
import { getDatabase, schema } from '../../../infrastructure/database';
import { UserRole } from '../../iam/auth/enums/user-role.enum';
import { RfqRepository } from '../rfq/rfq.repository';
import type {
	AcceptRoundDto,
	NegotiateDto,
	SubmitQuotationDto,
} from './quotation.dto';
import { QuotationRepository } from './quotation.repository';

const BUYER_ROLES = [
	UserRole.BUYER_STAFF,
	UserRole.BUYER_MANAGER,
	UserRole.COMPANY_ADMIN,
];
const SUPPLIER_ROLES = [
	UserRole.SUPPLIER_STAFF,
	UserRole.SUPPLIER_MANAGER,
	UserRole.COMPANY_ADMIN,
];

type NegotiationRole = 'BUYER' | 'SUPPLIER';

@Injectable()
export class QuotationService {
	private readonly logger = new Logger(QuotationService.name);

	constructor(
		private readonly quotationRepo: QuotationRepository,
		private readonly rfqRepo: RfqRepository,
		private readonly auditLoggerService: AuditLoggerService,
	) {}

	async respondToRfq(
		rfqId: string,
		dto: SubmitQuotationDto,
		actorId: string,
		workspaceId: string,
		ipAddress: string,
	) {
		const rfq = await this.rfqRepo.findByIdAnyRole(rfqId);
		if (!rfq) throw new NotFoundException('RFQ not found');
		if (!rfq.parentRfqId) {
			throw new BadRequestException(
				'Quotations can only be submitted against Child RFQs',
			);
		}
		if (rfq.supplierWorkspaceId !== workspaceId) {
			throw new ForbiddenException(
				'This RFQ is not addressed to your workspace',
			);
		}
		if (rfq.status !== 'pending_response') {
			throw new ConflictException(
				`RFQ is not awaiting a response (status: ${rfq.status})`,
			);
		}

		const existing = await this.quotationRepo.findByRfqAndSupplier(
			rfqId,
			workspaceId,
		);
		if (existing && existing.isLocked) {
			throw new ConflictException(
				'Quotation is locked — no further edits allowed',
			);
		}

		// Validate every quotation item references a real RFQ item on the same RFQ
		const rfqItems = await this.rfqRepo.listItems(rfqId);
		const rfqItemIds = new Set(rfqItems.map((it: any) => it.id));
		for (const item of dto.items) {
			if (!rfqItemIds.has(item.rfqItemId)) {
				throw new BadRequestException(
					`Quotation item references unknown rfqItemId=${item.rfqItemId}`,
				);
			}
		}

		const totalPrice = dto.items.reduce(
			(acc, it) => acc + it.unitPrice * it.quantity,
			0,
		);

		const finalStatus = dto.mode === 'draft' ? 'draft' : 'submitted';
		const estimatedDeliveryDays = this.toEstimatedDeliveryDays(
			dto.estimatedDeliveryDate,
		);

		const result = await getDatabase().transaction(async (tx) => {
			let quotationId: string;

			if (existing) {
				const updated = await this.quotationRepo.updateQuotation(
					existing.id,
					{
						status: finalStatus,
						totalPrice,
						unitPrice: dto.unitPrice,
						estimatedDeliveryDate: estimatedDeliveryDays,
						deliveryTerms: dto.deliveryTerms,
						note: dto.note ?? null,
						submittedAt:
							finalStatus === 'submitted' ? new Date() : existing.submittedAt,
						respondedBy: actorId,
					},
					tx,
				);
				quotationId = updated.id;

				// Replace items (simple strategy: delete + reinsert) inside the tx
				await tx
					.delete(schema.quotationItems)
					.where(eq(schema.quotationItems.quotationId, existing.id));
			} else {
				const created = await this.quotationRepo.createQuotation(
					{
						rfqId,
						supplierWorkspaceId: workspaceId,
						respondedBy: actorId,
						status: finalStatus,
						totalPrice,
						unitPrice: dto.unitPrice,
						estimatedDeliveryDate: estimatedDeliveryDays,
						deliveryTerms: dto.deliveryTerms,
						note: dto.note ?? null,
						isLocked: false,
						submittedAt: finalStatus === 'submitted' ? new Date() : null,
					},
					tx,
				);
				quotationId = created.id;
			}

			await this.quotationRepo.insertQuotationItems(
				dto.items.map((item) => ({
					quotationId,
					rfqItemId: item.rfqItemId,
					unitPrice: item.unitPrice,
					quantity: item.quantity,
				})),
				tx,
			);

			if (finalStatus === 'submitted') {
				await tx
					.update(schema.rfqs)
					.set({ status: 'responded', updatedAt: new Date() })
					.where(eq(schema.rfqs.id, rfqId));
			}

			await this.auditLoggerService.logInTx(tx as any, {
				actorId,
				workspaceId,
				action:
					finalStatus === 'submitted'
						? AuditAction.QUOTATION_SUBMIT_SUCCESS
						: AuditAction.QUOTATION_DRAFT_SUCCESS,
				resourceType: 'quotation',
				resourceId: quotationId,
				changes: {
					rfqId,
					totalPrice,
					unitPrice: dto.unitPrice,
					mode: dto.mode,
				},
				ipAddress,
				status: AuditStatus.SUCCESS,
			});

			return this.quotationRepo.findById(quotationId, tx);
		});

		this.logger.log(
			`Quotation ${finalStatus}: rfq=${rfqId} quotation=${result.id}`,
		);
		return result;
	}

	async getQuotationDetail(id: string, role: string, workspaceId: string) {
		const quotation = await this.quotationRepo.findById(id);
		if (!quotation) throw new NotFoundException('Quotation not found');
		this.assertReadAccess(quotation, role, workspaceId);
		const items = await this.quotationRepo.listItems(id);
		const rounds = await this.quotationRepo.listNegotiationRounds(id);
		return { ...quotation, items, negotiationRounds: rounds };
	}

	async negotiate(
		id: string,
		dto: NegotiateDto,
		actorId: string,
		role: string,
		workspaceId: string,
		ipAddress: string,
	) {
		const quotation = await this.quotationRepo.findById(id);
		if (!quotation) throw new NotFoundException('Quotation not found');
		this.assertReadAccess(quotation, role, workspaceId);

		if (quotation.status !== 'submitted') {
			throw new ConflictException(
				`Negotiation requires status = 'submitted' (current: ${quotation.status})`,
			);
		}
		if (quotation.isLocked) {
			throw new ConflictException(
				'Quotation is locked - no further negotiation allowed',
			);
		}

		const callerRole = this.resolveNegotiationRole(role);

		const round = await getDatabase().transaction(async (tx) => {
			const latest = await this.quotationRepo.findLatestNegotiationRound(
				id,
				tx,
			);
			if (latest && latest.role === callerRole) {
				throw new ConflictException(
					'Same party cannot submit two consecutive negotiation rounds',
				);
			}

			const inserted = await this.quotationRepo.insertNegotiationRound(
				{
					quotationId: id,
					role: callerRole,
					proposedPrice: dto.proposedPrice,
					proposedDeliveryDays: dto.proposedDeliveryDays,
					note: dto.note ?? null,
					isAccepted: false,
					submittedBy: actorId,
					submittedAt: new Date(),
				},
				tx,
			);

			await this.auditLoggerService.logInTx(tx as any, {
				actorId,
				workspaceId,
				action: AuditAction.NEGOTIATION_ROUND_SUBMIT_SUCCESS,
				resourceType: 'negotiation_round',
				resourceId: inserted.id,
				changes: {
					quotationId: id,
					role: callerRole,
					proposedPrice: dto.proposedPrice,
					proposedDeliveryDays: dto.proposedDeliveryDays,
				},
				ipAddress,
				status: AuditStatus.SUCCESS,
			});

			return inserted;
		});

		return round;
	}

	async acceptLatestRound(
		quotationId: string,
		dto: AcceptRoundDto,
		actorId: string,
		role: string,
		workspaceId: string,
		ipAddress: string,
	) {
		const quotation = await this.quotationRepo.findById(quotationId);
		if (!quotation) throw new NotFoundException('Quotation not found');
		this.assertReadAccess(quotation, role, workspaceId);

		if (quotation.isLocked) {
			throw new ConflictException(
				'Quotation is locked - round acceptance not allowed',
			);
		}

		const callerRole = this.resolveNegotiationRole(role);

		const result = await getDatabase().transaction(async (tx) => {
			const target = dto.roundId
				? await this.quotationRepo.findNegotiationRoundById(dto.roundId, tx)
				: await this.quotationRepo.findLatestNegotiationRound(quotationId, tx);

			if (!target || target.quotationId !== quotationId) {
				throw new NotFoundException('Negotiation round not found');
			}
			if (target.isAccepted) {
				throw new ConflictException('Round has already been accepted');
			}
			if (target.role === callerRole) {
				throw new ConflictException('Cannot accept your own negotiation round');
			}

			const accepted = await this.quotationRepo.markRoundAccepted(
				target.id,
				tx,
			);
			if (!accepted) {
				throw new ConflictException('Failed to accept round');
			}

			// Finalize quotation with accepted terms - keep status as 'submitted'
			// so the Buyer can still execute selectQuotation()
			const updatedQuotation = await this.quotationRepo.updateQuotation(
				quotationId,
				{
					unitPrice: target.proposedPrice,
					// estimated_delivery_days is a negotiation-only field
				},
				tx,
			);

			await this.auditLoggerService.logInTx(tx as any, {
				actorId,
				workspaceId,
				action: AuditAction.NEGOTIATION_ROUND_ACCEPT_SUCCESS,
				resourceType: 'negotiation_round',
				resourceId: target.id,
				changes: {
					quotationId,
					acceptedPrice: target.proposedPrice,
					acceptedDeliveryDays: target.proposedDeliveryDays,
				},
				ipAddress,
				status: AuditStatus.SUCCESS,
			});

			return { round: accepted, quotation: updatedQuotation };
		});

		return result;
	}

	// US-64 — atomic, < 2s, single transaction. The pessimistic SELECT FOR UPDATE
	// blocks concurrent selects on the same quotation.
	async selectQuotation(
		quotationId: string,
		actorId: string,
		role: string,
		workspaceId: string,
		ipAddress: string,
	) {
		// Pre-check OUTSIDE the transaction - fail fast on locked quotations
		const preview = await this.quotationRepo.findById(quotationId);
		if (!preview) throw new NotFoundException('Quotation not found');
		if (preview.isLocked) {
			throw new ConflictException('Quotation is already locked');
		}
		if (!BUYER_ROLES.includes(role as UserRole)) {
			throw new ForbiddenException('Only Buyers can select quotations');
		}

		const result = await getDatabase().transaction(async (tx) => {
			// Step 1 — pessimistic lock
			const quotation = await this.quotationRepo.findByIdForUpdate(
				quotationId,
				tx,
			);
			if (!quotation) throw new NotFoundException('Quotation not found');

			// Step 2 — guard conditions
			if (quotation.status !== 'submitted') {
				throw new ConflictException(
					`Quotation is not in 'submitted' state (current: ${quotation.status})`,
				);
			}
			if (quotation.isLocked) {
				throw new ConflictException('Quotation is already locked');
			}

			const childRfq = await this.quotationRepo.findRfqById(
				quotation.rfqId,
				tx,
			);
			if (!childRfq) throw new NotFoundException('RFQ not found');

			if (
				childRfq.buyerWorkspaceId !== workspaceId &&
				role !== (UserRole.COMPANY_ADMIN as string)
			) {
				throw new ForbiddenException(
					'You do not own the RFQ this quotation belongs to',
				);
			}

			const parentRfqId = childRfq.parentRfqId ?? childRfq.id;

			// Step 3 — lock selected quotation
			const lockedQuotation = await this.quotationRepo.updateQuotation(
				quotationId,
				{ status: 'selected', isLocked: true },
				tx,
			);

			// Step 4 — reject competing quotations (siblings on same parent RFQ)
			const siblingRfqIds: string[] = (
				(await tx
					.select({ id: schema.rfqs.id })
					.from(schema.rfqs)
					.where(eq(schema.rfqs.parentRfqId, parentRfqId))) as {
					id: string;
				}[]
			).map((r) => r.id);
			const allRfqIds = [parentRfqId, ...siblingRfqIds];

			// Reject every other quotation under the same parent RFQ tree
			for (const rid of allRfqIds) {
				await this.quotationRepo.rejectOtherQuotationsForRfq(
					rid,
					quotationId,
					tx,
				);
			}

			// Step 5 — cancel Child RFQs from non-selected Suppliers (BR-403)
			await this.quotationRepo.cancelSiblingChildRfqs(
				parentRfqId,
				quotation.supplierWorkspaceId,
				tx,
			);

			// Step 6 — close parent RFQ
			await this.quotationRepo.closeRfq(parentRfqId, tx);

			// Step 7 — insert PO with frozen snapshot columns (QAR-25, BR-212)
			const unitPriceSnapshot =
				quotation.unitPrice ??
				Math.floor(
					quotation.totalPrice /
						Math.max(1, await this.totalQuotationQuantity(quotationId, tx)),
				);
			const totalQuantity = await this.totalQuotationQuantity(quotationId, tx);
			const po = await this.quotationRepo.createPurchaseOrder(
				{
					quotationId,
					buyerWorkspaceId: childRfq.buyerWorkspaceId,
					supplierWorkspaceId: quotation.supplierWorkspaceId,
					status: 'pending_approval',
					totalPrice: quotation.totalPrice,
					finalUnitPrice: unitPriceSnapshot,
					finalPaymentTerms: quotation.deliveryTerms,
					finalDeliveryDate: this.resolveFinalDeliveryDate(
						quotation.estimatedDeliveryDate,
					),
					isLocked: true,
				},
				tx,
			);

			// Step 8 — audit log inside the transaction
			await this.auditLoggerService.logInTx(tx as any, {
				actorId,
				workspaceId,
				action: AuditAction.QUOTATION_SELECT_SUCCESS,
				resourceType: 'quotation',
				resourceId: quotationId,
				changes: {
					purchaseOrderId: po.id,
					parentRfqId,
					rejectedSiblings: siblingRfqIds,
					snapshot: {
						unitPrice: unitPriceSnapshot,
						totalPrice: quotation.totalPrice,
						deliveryDate: quotation.estimatedDeliveryDate,
						deliveryTerms: quotation.deliveryTerms,
						quantity: totalQuantity,
					},
				},
				ipAddress,
				status: AuditStatus.SUCCESS,
			});

			return { quotation: lockedQuotation, purchaseOrder: po };
		});

		this.logger.log(
			`Quotation selected: ${quotationId} → PO ${result.purchaseOrder.id}`,
		);
		return result;
	}

	private async totalQuotationQuantity(
		quotationId: string,
		tx: any,
	): Promise<number> {
		const items = await this.quotationRepo.listItems(quotationId, tx);
		return items.reduce((acc: number, it: any) => acc + it.quantity, 0);
	}

	private resolveFinalDeliveryDate(value: unknown): Date | null {
		if (value instanceof Date) return value;
		if (typeof value === 'number') {
			return new Date(Date.now() + value * 24 * 60 * 60 * 1000);
		}
		return null;
	}

	private toEstimatedDeliveryDays(date: Date): number {
		const diffMs = date.getTime() - Date.now();
		return Math.max(1, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
	}

	private assertReadAccess(
		quotation: { rfqId: string; supplierWorkspaceId: string },
		role: string,
		workspaceId: string,
	) {
		if (SUPPLIER_ROLES.includes(role as UserRole)) {
			if (quotation.supplierWorkspaceId !== workspaceId) {
				throw new ForbiddenException(
					'Supplier can only access their own quotations',
				);
			}
			return;
		}
		// Buyer access is gated by RFQ ownership - defer to per-action checks
		if (!BUYER_ROLES.includes(role as UserRole)) {
			throw new ForbiddenException('Role cannot access quotations');
		}
	}

	private resolveNegotiationRole(role: string): NegotiationRole {
		if (BUYER_ROLES.includes(role as UserRole)) return 'BUYER';
		if (SUPPLIER_ROLES.includes(role as UserRole)) return 'SUPPLIER';
		throw new ForbiddenException('Role cannot negotiate');
	}
}
