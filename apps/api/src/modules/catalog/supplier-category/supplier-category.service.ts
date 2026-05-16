/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */
import {
	BadRequestException,
	ConflictException,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import {
	AuditAction,
	AuditStatus,
} from '../../../core/audit/enums/audit.enums';
import { AuditLoggerService } from '../../../core/audit/services/audit-logger.service';
import { getDatabase } from '../../../infrastructure/database';
import { CatalogCategoryRepository } from '../../master-data/catalog-category/catalog-category.repository';
import type {
	CreateSupplierCategoryDto,
	UpdateSupplierCategoryDto,
} from './supplier-category.dto';
import { SupplierCategoryRepository } from './supplier-category.repository';

@Injectable()
export class SupplierCategoryService {
	private readonly logger = new Logger(SupplierCategoryService.name);

	constructor(
		private readonly supplierCategoryRepo: SupplierCategoryRepository,
		private readonly catalogCategoryRepo: CatalogCategoryRepository,
		private readonly auditLoggerService: AuditLoggerService,
	) {}

	async create(
		dto: CreateSupplierCategoryDto,
		actorId: string,
		workspaceId: string,
		ipAddress: string,
	) {
		const catalogCategory = await this.catalogCategoryRepo.findById(
			dto.catalogCategoryId,
		);
		if (!catalogCategory || !catalogCategory.isActive) {
			throw new BadRequestException(
				'Catalog category not found or is inactive',
			);
		}

		const existingName = await this.supplierCategoryRepo.findByName(dto.name);
		if (existingName) {
			throw new ConflictException(
				'A supplier category with the same name already exists in this workspace',
			);
		}

		const result = await getDatabase().transaction(async (tx) => {
			const category = await this.supplierCategoryRepo.create(
				{
					workspaceId,
					catalogCategoryId: dto.catalogCategoryId,
					name: dto.name,
					description: dto.description ?? null,
					createdBy: actorId,
				},
				tx,
			);

			await this.auditLoggerService.logInTx(tx as any, {
				actorId,
				workspaceId,
				action: AuditAction.SUPPLIER_CATEGORY_CREATE_SUCCESS,
				resourceType: 'supplier_category',
				resourceId: category.id,
				changes: {
					name: dto.name,
					catalogCategoryId: dto.catalogCategoryId,
				},
				ipAddress,
				status: AuditStatus.SUCCESS,
			});

			return category;
		});

		this.logger.log(`Supplier category created: ${result.name} (${result.id})`);
		return result;
	}

	async findAll() {
		return this.supplierCategoryRepo.findAllActive();
	}

	async findById(id: string) {
		const category = await this.supplierCategoryRepo.findById(id);
		if (!category) {
			throw new NotFoundException('Supplier category not found');
		}
		return category;
	}

	async checkNameAvailability(name: string) {
		const available =
			await this.supplierCategoryRepo.checkNameAvailability(name);
		return { available };
	}

	async update(
		id: string,
		dto: UpdateSupplierCategoryDto,
		actorId: string,
		workspaceId: string,
		ipAddress: string,
	) {
		const category = await this.findById(id);

		if (dto.name) {
			const existingName = await this.supplierCategoryRepo.findByName(
				dto.name,
				id,
			);
			if (existingName) {
				throw new ConflictException(
					'A supplier category with the same name already exists in this workspace',
				);
			}
		}

		const oldValues = {
			name: category.name,
			description: category.description,
		};

		const updated = await getDatabase().transaction(async (tx) => {
			const result = await this.supplierCategoryRepo.update(
				id,
				{
					...(dto.name !== undefined && { name: dto.name }),
					...(dto.description !== undefined && {
						description: dto.description,
					}),
				},
				tx,
			);

			await this.auditLoggerService.logInTx(tx as any, {
				actorId,
				workspaceId,
				action: AuditAction.SUPPLIER_CATEGORY_UPDATE_SUCCESS,
				resourceType: 'supplier_category',
				resourceId: id,
				changes: { old: oldValues, new: dto },
				ipAddress,
				status: AuditStatus.SUCCESS,
			});

			return result;
		});

		this.logger.log(`Supplier category updated: ${updated.name} (${id})`);
		return updated;
	}

	async softDelete(
		id: string,
		actorId: string,
		workspaceId: string,
		ipAddress: string,
	) {
		await this.findById(id);

		const productCount =
			await this.supplierCategoryRepo.countProductsByCategory(id);
		if (productCount > 0) {
			throw new ConflictException(
				'Cannot delete a category that has linked products',
			);
		}

		const updated = await getDatabase().transaction(async (tx) => {
			const result = await this.supplierCategoryRepo.softDelete(id, tx);

			await this.auditLoggerService.logInTx(tx as any, {
				actorId,
				workspaceId,
				action: AuditAction.SUPPLIER_CATEGORY_SOFT_DELETE_SUCCESS,
				resourceType: 'supplier_category',
				resourceId: id,
				changes: { isActive: false },
				ipAddress,
				status: AuditStatus.SUCCESS,
			});

			return result;
		});

		this.logger.log(`Supplier category soft-deleted: ${id}`);
		return updated;
	}
}
