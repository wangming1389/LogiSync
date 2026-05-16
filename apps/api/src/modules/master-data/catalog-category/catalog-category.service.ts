/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */
import {
	ConflictException,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { AuditAction, AuditStatus } from '../../../core/audit/audit.enums';
import { AuditLoggerService } from '../../../core/audit/audit-logger.service';
import { getDatabase } from '../../../infrastructure/database';
import { MessageQueueService } from '../../../infrastructure/message-queue/message-queue.service';
import { WorkspaceRepository } from '../../iam/workspace/workspace.repository';
import type {
	CreateCatalogCategoryDto,
	UpdateCatalogCategoryDto,
} from './catalog-category.dto';
import { CatalogCategoryRepository } from './catalog-category.repository';

const CACHE_INVALIDATION_QUEUE = 'master-data:catalog-categories';

@Injectable()
export class CatalogCategoryService {
	private readonly logger = new Logger(CatalogCategoryService.name);
	private platformId: string | null = null;

	constructor(
		private readonly catalogCategoryRepo: CatalogCategoryRepository,
		private readonly auditLoggerService: AuditLoggerService,
		private readonly messageQueueService: MessageQueueService,
		private readonly workspaceRepository: WorkspaceRepository,
	) {}

	private async getPlatformId(): Promise<string> {
		if (this.platformId) return this.platformId;
		const platformWorkspace =
			await this.workspaceRepository.findBySlug('platform-admin');
		this.platformId = platformWorkspace.id;
		return this.platformId!;
	}

	async create(
		dto: CreateCatalogCategoryDto,
		actorId: string,
		ipAddress: string,
	) {
		const existing = await this.catalogCategoryRepo.findByNameOrCode(
			dto.name,
			dto.code,
		);
		if (existing) {
			throw new ConflictException(
				'A catalog category with the same name or code already exists',
			);
		}

		const platformId = await this.getPlatformId();
		const result = await getDatabase().transaction(async (tx) => {
			const category = await this.catalogCategoryRepo.create(
				{
					name: dto.name,
					code: dto.code,
					description: dto.description ?? null,
					createdBy: actorId,
				},
				tx,
			);

			await this.auditLoggerService.logInTx(tx as any, {
				actorId,
				workspaceId: platformId,
				action: AuditAction.CATALOG_CATEGORY_CREATE_SUCCESS,
				resourceType: 'catalog_category',
				resourceId: category.id,
				changes: { name: dto.name, code: dto.code },
				ipAddress,
				status: AuditStatus.SUCCESS,
			});

			return category;
		});

		await this.invalidateCache();
		this.logger.log(`Catalog category created: ${result.name} (${result.id})`);
		return result;
	}

	async findAll() {
		return this.catalogCategoryRepo.findAll();
	}

	async findAllActive() {
		return this.catalogCategoryRepo.findAllActive();
	}

	async findById(id: string) {
		const category = await this.catalogCategoryRepo.findById(id);
		if (!category) {
			throw new NotFoundException('Catalog category not found');
		}
		return category;
	}

	async update(
		id: string,
		dto: UpdateCatalogCategoryDto,
		actorId: string,
		ipAddress: string,
	) {
		const category = await this.findById(id);

		if (dto.name || dto.code) {
			const existing = await this.catalogCategoryRepo.findByNameOrCode(
				dto.name ?? category.name,
				dto.code ?? category.code,
				id,
			);
			if (existing) {
				throw new ConflictException(
					'A catalog category with the same name or code already exists',
				);
			}
		}

		const oldValues = {
			name: category.name,
			code: category.code,
			description: category.description,
		};
		const platformId = await this.getPlatformId();

		const updated = await getDatabase().transaction(async (tx) => {
			const result = await this.catalogCategoryRepo.update(
				id,
				{
					...(dto.name !== undefined && { name: dto.name }),
					...(dto.code !== undefined && { code: dto.code }),
					...(dto.description !== undefined && {
						description: dto.description,
					}),
				},
				tx,
			);

			await this.auditLoggerService.logInTx(tx as any, {
				actorId,
				workspaceId: platformId,
				action: AuditAction.CATALOG_CATEGORY_UPDATE_SUCCESS,
				resourceType: 'catalog_category',
				resourceId: id,
				changes: { old: oldValues, new: dto },
				ipAddress,
				status: AuditStatus.SUCCESS,
			});

			return result;
		});

		await this.invalidateCache();
		this.logger.log(`Catalog category updated: ${updated.name} (${id})`);
		return updated;
	}

	async disable(id: string, actorId: string, ipAddress: string) {
		await this.findById(id);

		const platformId = await this.getPlatformId();
		const updated = await getDatabase().transaction(async (tx) => {
			const result = await this.catalogCategoryRepo.disable(id, tx);

			await this.auditLoggerService.logInTx(tx as any, {
				actorId,
				workspaceId: platformId,
				action: AuditAction.CATALOG_CATEGORY_DISABLE_SUCCESS,
				resourceType: 'catalog_category',
				resourceId: id,
				changes: { isActive: false, disabledAt: result.disabledAt },
				ipAddress,
				status: AuditStatus.SUCCESS,
			});

			return result;
		});

		await this.invalidateCache();
		this.logger.log(`Catalog category disabled: ${updated.name} (${id})`);
		return updated;
	}

	async enable(id: string, actorId: string, ipAddress: string) {
		await this.findById(id);

		const platformId = await this.getPlatformId();
		const updated = await getDatabase().transaction(async (tx) => {
			const result = await this.catalogCategoryRepo.enable(id, tx);

			await this.auditLoggerService.logInTx(tx as any, {
				actorId,
				workspaceId: platformId,
				action: AuditAction.CATALOG_CATEGORY_ENABLE_SUCCESS,
				resourceType: 'catalog_category',
				resourceId: id,
				changes: { isActive: true, disabledAt: null },
				ipAddress,
				status: AuditStatus.SUCCESS,
			});

			return result;
		});

		await this.invalidateCache();
		this.logger.log(`Catalog category re-enabled: ${updated.name} (${id})`);
		return updated;
	}

	private async invalidateCache(): Promise<void> {
		try {
			if (this.messageQueueService.isReady()) {
				await this.messageQueueService.publishMessage(
					CACHE_INVALIDATION_QUEUE,
					{
						event: 'cache_invalidate',
						key: CACHE_INVALIDATION_QUEUE,
						timestamp: new Date().toISOString(),
					},
				);
			}
		} catch (error) {
			this.logger.warn(
				'Failed to publish cache invalidation event',
				error instanceof Error ? error.message : String(error),
			);
		}
	}
}
