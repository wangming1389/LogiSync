/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call */
import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import type { Counter } from 'prom-client';
import {
	AuditAction,
	AuditStatus,
} from '../../../../core/audit/enums/audit.enums';
import { AuditLoggerService } from '../../../../core/audit/services/audit-logger.service';
import { METRIC_RFQ_CREATED } from '../../../../core/metrics/business-metrics.providers';
import { DatabaseService } from '../../../../infrastructure/database/database.service';
import { MessageQueueService } from '../../../../infrastructure/message-queue/message-queue.service';
import {
	SOURCING_BUYER_ROLES,
	SOURCING_SUPPLIER_ROLES,
} from '../../enums/sourcing-role.enums';
import type {
	AddRfqItemDto,
	CreateRfqDto,
	ListRfqQueryDto,
	UpdateRfqItemDto,
} from '../dtos/rfq.dto';
import { RfqRepository } from '../repositories/rfq.repository';

// QAR-05 / response-size cap: each RFQ may hold at most 200 items
const MAX_ITEMS_PER_RFQ = 200;

@Injectable()
export class RfqService {
	private readonly logger = new Logger(RfqService.name);

	constructor(
		private readonly rfqRepo: RfqRepository,
		private readonly auditLoggerService: AuditLoggerService,
		private readonly messageQueueService: MessageQueueService,
		private readonly databaseService: DatabaseService,
		@InjectMetric(METRIC_RFQ_CREATED)
		private readonly rfqCreatedCounter: Counter<string>,
	) {}

	async createDraft(
		dto: CreateRfqDto,
		actorId: string,
		workspaceId: string,
		ipAddress: string,
	) {
		const result = await this.databaseService.withTransaction(async (tx) => {
			const rfq = await this.rfqRepo.createDraftRfq(
				{
					buyerWorkspaceId: workspaceId,
					createdBy: actorId,
					note: dto.note ?? null,
				},
				tx,
			);

			await this.auditLoggerService.logInTx(tx, {
				actorId,
				workspaceId,
				action: AuditAction.RFQ_CREATE_SUCCESS,
				resourceType: 'rfq',
				resourceId: rfq.id,
				changes: { note: dto.note ?? null },
				ipAddress,
				status: AuditStatus.SUCCESS,
			});

			return rfq;
		});

		this.logger.log(`RFQ draft created: ${result.id}`);
		this.rfqCreatedCounter.inc();
		return result;
	}

	// workspaceId resolves automatically via CLS inside BaseRepository
	async listAccessible(query: ListRfqQueryDto, role: string) {
		if (this.hasRole(SOURCING_BUYER_ROLES, role)) {
			return this.rfqRepo.listForBuyer({
				status: query.status,
				limit: query.limit,
				offset: query.offset,
			});
		}
		if (this.hasRole(SOURCING_SUPPLIER_ROLES, role)) {
			return this.rfqRepo.listForSupplier({
				status: query.status,
				limit: query.limit,
				offset: query.offset,
			});
		}
		throw new ForbiddenException('Role cannot access RFQs');
	}

	async getRfqDetail(id: string, role: string) {
		const rfq = await this.loadAccessibleRfq(id, role);
		const items = await this.rfqRepo.listItems(id);
		return { ...rfq, items };
	}

	async listQuotationsForRfq(rfqId: string, role: string) {
		// Only Buyers see all quotations for an RFQ they own
		if (!this.hasRole(SOURCING_BUYER_ROLES, role)) {
			throw new ForbiddenException('Only Buyers can list RFQ quotations');
		}
		const rfq = await this.rfqRepo.findByIdForBuyer(rfqId);
		if (!rfq) throw new NotFoundException('RFQ not found');
		return this.rfqRepo.listQuotationsForRfq(rfqId);
	}

	async addItem(
		rfqId: string,
		dto: AddRfqItemDto,
		actorId: string,
		workspaceId: string,
		ipAddress: string,
	) {
		const rfq = await this.rfqRepo.findByIdForBuyer(rfqId);
		if (!rfq) throw new NotFoundException('RFQ not found');

		this.assertMutationAllowed(rfq);

		const currentCount = await this.rfqRepo.countItems(rfqId);
		const existingItem = (await this.rfqRepo.listItems(rfqId)).find(
			(it: any) => it.productId === dto.productId,
		);

		// 200-item cap only applies when we'd create a NEW row - auto-merge into an
		// existing row does not increase the row count.
		if (!existingItem && currentCount >= MAX_ITEMS_PER_RFQ) {
			throw new BadRequestException(
				`RFQ cannot exceed ${MAX_ITEMS_PER_RFQ} items`,
			);
		}

		const product = await this.rfqRepo.findProductWorkspace(dto.productId);
		if (!product) throw new BadRequestException('Product not found');
		if (product.status !== 'active') {
			throw new BadRequestException(
				'Only active products can be added to an RFQ',
			);
		}
		if (product.workspaceId === workspaceId) {
			throw new BadRequestException(
				"Buyers cannot add their own workspace's products to an RFQ",
			);
		}

		const item = await this.databaseService.withTransaction(async (tx) => {
			const upserted = await this.rfqRepo.upsertItem(
				{
					rfqId,
					productId: dto.productId,
					supplierWorkspaceId: product.workspaceId,
					quantity: dto.quantity,
					targetPrice: dto.targetPrice ?? null,
					deliveryDate: dto.deliveryDate ?? null,
					deliveryLocation: dto.deliveryLocation ?? null,
					notes: dto.notes ?? null,
				},
				tx,
			);

			await this.auditLoggerService.logInTx(tx, {
				actorId,
				workspaceId,
				action: AuditAction.RFQ_ITEM_UPSERT_SUCCESS,
				resourceType: 'rfq_item',
				resourceId: upserted.id,
				changes: {
					rfqId,
					productId: dto.productId,
					quantity: dto.quantity,
					mergedInto: existingItem ? existingItem.id : null,
				},
				ipAddress,
				status: AuditStatus.SUCCESS,
			});

			return upserted;
		});

		this.logger.log(`RFQ item upserted: rfq=${rfqId} item=${item.id}`);
		return item;
	}

	async updateItem(
		rfqId: string,
		itemId: string,
		dto: UpdateRfqItemDto,
		actorId: string,
		workspaceId: string,
		ipAddress: string,
	) {
		const rfq = await this.rfqRepo.findByIdForBuyer(rfqId);
		if (!rfq) throw new NotFoundException('RFQ not found');
		this.assertMutationAllowed(rfq);

		const item = await this.rfqRepo.findItemById(rfqId, itemId);
		if (!item) throw new NotFoundException('RFQ item not found');

		const oldValues = {
			quantity: item.quantity,
			targetPrice: item.targetPrice,
			deliveryDate: item.deliveryDate,
			deliveryLocation: item.deliveryLocation,
			notes: item.notes,
		};

		const updated = await this.databaseService.withTransaction(async (tx) => {
			const result = await this.rfqRepo.updateItem(
				rfqId,
				itemId,
				{
					...(dto.quantity !== undefined && { quantity: dto.quantity }),
					...(dto.targetPrice !== undefined && {
						targetPrice: dto.targetPrice,
					}),
					...(dto.deliveryDate !== undefined && {
						deliveryDate: dto.deliveryDate,
					}),
					...(dto.deliveryLocation !== undefined && {
						deliveryLocation: dto.deliveryLocation,
					}),
					...(dto.notes !== undefined && { notes: dto.notes }),
				},
				tx,
			);

			await this.auditLoggerService.logInTx(tx, {
				actorId,
				workspaceId,
				action: AuditAction.RFQ_ITEM_UPDATE_SUCCESS,
				resourceType: 'rfq_item',
				resourceId: itemId,
				changes: { old: oldValues, new: dto },
				ipAddress,
				status: AuditStatus.SUCCESS,
			});

			return result;
		});

		return updated;
	}

	async deleteItem(
		rfqId: string,
		itemId: string,
		actorId: string,
		workspaceId: string,
		ipAddress: string,
	) {
		const rfq = await this.rfqRepo.findByIdForBuyer(rfqId);
		if (!rfq) throw new NotFoundException('RFQ not found');
		this.assertMutationAllowed(rfq);

		const item = await this.rfqRepo.findItemById(rfqId, itemId);
		if (!item) throw new NotFoundException('RFQ item not found');

		await this.databaseService.withTransaction(async (tx) => {
			await this.rfqRepo.deleteItem(rfqId, itemId, tx);

			await this.auditLoggerService.logInTx(tx, {
				actorId,
				workspaceId,
				action: AuditAction.RFQ_ITEM_DELETE_SUCCESS,
				resourceType: 'rfq_item',
				resourceId: itemId,
				changes: { productId: item.productId, quantity: item.quantity },
				ipAddress,
				status: AuditStatus.SUCCESS,
			});
		});

		return { deleted: true };
	}

	async submitRfq(
		id: string,
		actorId: string,
		workspaceId: string,
		ipAddress: string,
	) {
		const rfq = await this.rfqRepo.findByIdForBuyer(id);
		if (!rfq) throw new NotFoundException('RFQ not found');

		if (rfq.status !== 'draft') {
			throw new ConflictException('Only draft RFQs can be submitted');
		}
		if (rfq.isLocked) {
			throw new ConflictException('RFQ is already locked');
		}

		const itemCount = await this.rfqRepo.countItems(id);
		if (itemCount === 0) {
			throw new BadRequestException(
				'Draft RFQ must contain at least one item before submit',
			);
		}

		// US-63: group by supplier → spawn one Child RFQ per supplier inside a single tx
		const result = await this.databaseService.withTransaction(async (tx) => {
			const supplierIds = await this.rfqRepo.groupDraftItemsBySupplier(id, tx);

			const childRfqs: { id: string; supplierWorkspaceId: string }[] = [];
			for (const supplierId of supplierIds) {
				const child = await this.rfqRepo.createChildRfq(
					{
						buyerWorkspaceId: workspaceId,
						parentRfqId: id,
						supplierWorkspaceId: supplierId,
						createdBy: actorId,
						note: rfq.note,
					},
					tx,
				);
				await this.rfqRepo.cloneItemsToChildRfq(
					{
						sourceRfqId: id,
						childRfqId: child.id,
						supplierWorkspaceId: supplierId,
					},
					tx,
				);
				childRfqs.push({
					id: child.id,
					supplierWorkspaceId: supplierId,
				});
			}

			// Lock the parent Draft RFQ
			const updatedParent = await this.rfqRepo.updateRfq(
				id,
				{
					status: 'pending_response',
					isLocked: true,
					submittedAt: new Date(),
				},
				tx,
			);

			await this.auditLoggerService.logInTx(tx, {
				actorId,
				workspaceId,
				action: AuditAction.RFQ_SUBMIT_SUCCESS,
				resourceType: 'rfq',
				resourceId: id,
				changes: {
					childRfqIds: childRfqs.map((c) => c.id),
					supplierWorkspaceIds: childRfqs.map((c) => c.supplierWorkspaceId),
				},
				ipAddress,
				status: AuditStatus.SUCCESS,
			});

			return { parent: updatedParent, childRfqs };
		});

		// Notifications fire outside the DB transaction, failures here must not rollback the legal Child RFQ records.
		await this.fanoutSubmitNotifications(id, result.childRfqs, workspaceId);

		this.logger.log(
			`RFQ submitted: parent=${id} childCount=${result.childRfqs.length}`,
		);
		return result;
	}

	async deleteDraft(
		id: string,
		actorId: string,
		workspaceId: string,
		ipAddress: string,
	) {
		const rfq = await this.rfqRepo.findByIdForBuyer(id);
		if (!rfq) throw new NotFoundException('RFQ not found');

		if (rfq.status !== 'draft' || rfq.isLocked) {
			throw new ConflictException('Only unlocked draft RFQs can be deleted');
		}

		await this.databaseService.withTransaction(async (tx) => {
			const items = await this.rfqRepo.listItems(id, tx);
			for (const item of items) {
				await this.rfqRepo.deleteItem(id, item.id, tx);
			}
			await this.rfqRepo.deleteRfq(id, tx);

			await this.auditLoggerService.logInTx(tx, {
				actorId,
				workspaceId,
				action: AuditAction.RFQ_DELETE_SUCCESS,
				resourceType: 'rfq',
				resourceId: id,
				changes: { itemCount: items.length },
				ipAddress,
				status: AuditStatus.SUCCESS,
			});
		});

		return { deleted: true };
	}

	private assertMutationAllowed(rfq: { status: string; isLocked: boolean }) {
		if (rfq.isLocked) {
			throw new ConflictException(
				'RFQ is locked - no further item changes allowed',
			);
		}
		if (rfq.status !== 'draft') {
			throw new ConflictException(
				`RFQ items can only be modified while status = 'draft' (current: ${rfq.status})`,
			);
		}
	}

	private async loadAccessibleRfq(id: string, role: string) {
		if (this.hasRole(SOURCING_BUYER_ROLES, role)) {
			const rfq = await this.rfqRepo.findByIdForBuyer(id);
			if (!rfq) throw new NotFoundException('RFQ not found');
			return rfq;
		}
		if (this.hasRole(SOURCING_SUPPLIER_ROLES, role)) {
			const rfq = await this.rfqRepo.findByIdForSupplier(id);
			if (!rfq) throw new NotFoundException('RFQ not found');
			return rfq;
		}
		throw new ForbiddenException('Role cannot access RFQs');
	}

	private async fanoutSubmitNotifications(
		parentRfqId: string,
		childRfqs: { id: string; supplierWorkspaceId: string }[],
		buyerWorkspaceId: string,
	) {
		if (!this.messageQueueService.isReady?.()) return;
		try {
			for (const child of childRfqs) {
				await this.messageQueueService.publishMessage('rfq.submitted', {
					parentRfqId,
					childRfqId: child.id,
					supplierWorkspaceId: child.supplierWorkspaceId,
					buyerWorkspaceId,
					submittedAt: new Date().toISOString(),
				});
			}
		} catch (error) {
			this.logger.warn(
				'RFQ submit notifications failed (degraded MQ)',
				error instanceof Error ? error.message : String(error),
			);
		}
	}

	private hasRole(roles: readonly string[], role: string) {
		return roles.includes(role);
	}
}
