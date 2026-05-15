/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/require-await */
import {
	BadRequestException,
	ConflictException,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { AuditAction, AuditStatus } from '../../../core/audit/audit.enums';
import { AuditLoggerService } from '../../../core/audit/audit-logger.service';
import { getDatabase } from '../../../infrastructure/database';
import { ObjectStorageService } from '../../../infrastructure/object-storage/object-storage.service';
import { UomRepository } from '../../master-data/uom/uom.repository';
import { type IMulterFile, MediaService } from '../../media/media.service';
import type {
	CreateProductDto,
	ListProductsQueryDto,
	UpdateProductDto,
} from './product.dto';
import { ProductRepository } from './product.repository';

@Injectable()
export class ProductService {
	private readonly logger = new Logger(ProductService.name);

	constructor(
		private readonly productRepo: ProductRepository,
		private readonly uomRepo: UomRepository,
		private readonly auditLoggerService: AuditLoggerService,
		private readonly objectStorageService: ObjectStorageService,
		private readonly mediaService: MediaService,
	) {}

	async create(
		dto: CreateProductDto,
		actorId: string,
		workspaceId: string,
		ipAddress: string,
	) {
		const uom = await this.uomRepo.findById(dto.uomId);
		if (!uom || !uom.isActive) {
			throw new BadRequestException('Unit of measure not found or is inactive');
		}

		const existingSku = await this.productRepo.findBySku(dto.sku);
		if (existingSku) {
			throw new ConflictException(
				'A product with the same SKU already exists in this workspace',
			);
		}

		const result = await getDatabase().transaction(async (tx) => {
			const product = await this.productRepo.create(
				{
					workspaceId,
					supplierCategoryId: dto.supplierCategoryId,
					uomId: dto.uomId,
					sku: dto.sku,
					name: dto.name,
					description: dto.description ?? null,
					unitPrice: dto.unitPrice,
					minOrderQty: dto.minOrderQty ?? 1,
					status: 'draft',
					imageUrls: null,
					attributes: dto.attributes ?? null,
					createdBy: actorId,
				},
				tx,
			);

			await this.auditLoggerService.logInTx(tx as any, {
				actorId,
				workspaceId,
				action: AuditAction.PRODUCT_CREATE_SUCCESS,
				resourceType: 'product',
				resourceId: product.id,
				changes: {
					sku: dto.sku,
					name: dto.name,
					unitPrice: dto.unitPrice,
				},
				ipAddress,
				status: AuditStatus.SUCCESS,
			});

			return product;
		});

		this.logger.log(`Product created: ${result.name} (${result.id})`);
		return this.withSignedUrls(result);
	}

	async findAll(query: ListProductsQueryDto) {
		const result = await this.productRepo.findAll({
			keyword: query.keyword,
			categoryId: query.categoryId,
			status: query.status,
			minPrice: query.minPrice,
			maxPrice: query.maxPrice,
			sortBy: query.sortBy,
			order: query.order,
			limit: query.limit,
			offset: query.offset,
		});

		const items = await Promise.all(
			result.items.map((item: any) => this.withSignedUrls(item)),
		);

		return { ...result, items };
	}

	async findById(id: string) {
		const product = await this.productRepo.findById(id);
		if (!product) {
			throw new NotFoundException('Product not found');
		}
		return this.withSignedUrls(product);
	}

	async checkSkuAvailability(sku: string) {
		const existing = await this.productRepo.findBySku(sku);
		return { available: !existing };
	}

	async getPriceHistory(id: string) {
		const product = await this.productRepo.findById(id);
		if (!product) {
			throw new NotFoundException('Product not found');
		}
		return this.productRepo.getPriceHistory(id);
	}

	async update(
		id: string,
		dto: UpdateProductDto,
		actorId: string,
		workspaceId: string,
		ipAddress: string,
	) {
		const product = await this.productRepo.findById(id);
		if (!product) {
			throw new NotFoundException('Product not found');
		}

		const oldValues = {
			name: product.name,
			description: product.description,
			unitPrice: product.unitPrice,
			minOrderQty: product.minOrderQty,
			attributes: product.attributes,
		};

		const priceChanged =
			dto.unitPrice !== undefined && dto.unitPrice !== product.unitPrice;

		const updated = await getDatabase().transaction(async (tx) => {
			if (priceChanged) {
				await this.productRepo.insertPriceHistory(
					{
						productId: id,
						unitPrice: product.unitPrice,
						changedBy: actorId,
					},
					tx,
				);
			}

			const result = await this.productRepo.update(
				id,
				{
					...(dto.name !== undefined && { name: dto.name }),
					...(dto.description !== undefined && {
						description: dto.description,
					}),
					...(dto.unitPrice !== undefined && { unitPrice: dto.unitPrice }),
					...(dto.minOrderQty !== undefined && {
						minOrderQty: dto.minOrderQty,
					}),
					...(dto.attributes !== undefined && {
						attributes: dto.attributes,
					}),
				},
				tx,
			);

			await this.auditLoggerService.logInTx(tx as any, {
				actorId,
				workspaceId,
				action: AuditAction.PRODUCT_UPDATE_SUCCESS,
				resourceType: 'product',
				resourceId: id,
				changes: { old: oldValues, new: dto },
				ipAddress,
				status: AuditStatus.SUCCESS,
			});

			return result;
		});

		this.logger.log(`Product updated: ${updated.name} (${id})`);
		return this.withSignedUrls(updated);
	}

	async publish(
		id: string,
		actorId: string,
		workspaceId: string,
		ipAddress: string,
	) {
		const product = await this.productRepo.findById(id);
		if (!product) {
			throw new NotFoundException('Product not found');
		}

		if (product.status !== 'draft' && product.status !== 'inactive') {
			throw new BadRequestException(
				'Only draft or inactive products can be published',
			);
		}

		const updated = await getDatabase().transaction(async (tx) => {
			const result = await this.productRepo.update(
				id,
				{ status: 'active' },
				tx,
			);

			await this.auditLoggerService.logInTx(tx as any, {
				actorId,
				workspaceId,
				action: AuditAction.PRODUCT_PUBLISH_SUCCESS,
				resourceType: 'product',
				resourceId: id,
				changes: {
					old: { status: product.status },
					new: { status: 'active' },
				},
				ipAddress,
				status: AuditStatus.SUCCESS,
			});

			return result;
		});

		this.logger.log(`Product published: ${updated.name} (${id})`);
		return this.withSignedUrls(updated);
	}

	async unpublish(
		id: string,
		actorId: string,
		workspaceId: string,
		ipAddress: string,
	) {
		const product = await this.productRepo.findById(id);
		if (!product) {
			throw new NotFoundException('Product not found');
		}

		if (product.status !== 'active') {
			throw new BadRequestException('Only active products can be unpublished');
		}

		const openRfqCount = await this.productRepo.countByRfqPendingResponse(id);

		const updated = await getDatabase().transaction(async (tx) => {
			const result = await this.productRepo.update(
				id,
				{ status: 'inactive' },
				tx,
			);

			await this.auditLoggerService.logInTx(tx as any, {
				actorId,
				workspaceId,
				action: AuditAction.PRODUCT_UNPUBLISH_SUCCESS,
				resourceType: 'product',
				resourceId: id,
				changes: {
					old: { status: 'active' },
					new: { status: 'inactive' },
				},
				ipAddress,
				status: AuditStatus.SUCCESS,
			});

			return result;
		});

		this.logger.log(`Product unpublished: ${updated.name} (${id})`);

		const response: any = { data: await this.withSignedUrls(updated) };
		if (openRfqCount > 0) {
			response.warning = 'This product is referenced in one or more open RFQs.';
		}
		return response;
	}

	async deleteProduct(
		id: string,
		actorId: string,
		workspaceId: string,
		ipAddress: string,
	) {
		const product = await this.productRepo.findById(id);
		if (!product) {
			throw new NotFoundException('Product not found');
		}

		if (product.status !== 'draft') {
			throw new ConflictException(
				'Only draft products can be deleted. Use unpublish for active products.',
			);
		}

		await getDatabase().transaction(async (tx) => {
			await this.productRepo.delete(id, tx);

			await this.auditLoggerService.logInTx(tx as any, {
				actorId,
				workspaceId,
				action: AuditAction.PRODUCT_DELETE_SUCCESS,
				resourceType: 'product',
				resourceId: id,
				changes: { sku: product.sku, name: product.name },
				ipAddress,
				status: AuditStatus.SUCCESS,
			});
		});

		this.logger.log(`Product deleted: ${product.name} (${id})`);
		return { deleted: true };
	}

	private async withSignedUrls(product: any): Promise<any> {
		if (
			!product?.imageUrls ||
			!Array.isArray(product.imageUrls) ||
			product.imageUrls.length === 0
		) {
			return product;
		}

		if (!this.objectStorageService.isReady()) {
			return product;
		}

		try {
			const signedUrls = await Promise.all(
				product.imageUrls.map((key: string) => this.generateSignedUrl(key)),
			);
			return { ...product, imageUrls: signedUrls };
		} catch {
			return product;
		}
	}

	private async generateSignedUrl(objectKey: string): Promise<string> {
		if (objectKey.startsWith('http://') || objectKey.startsWith('https://')) {
			return objectKey;
		}
		return objectKey;
	}

	async uploadProductImage(
		productId: string,
		file: IMulterFile,
		actorId: string,
		workspaceId: string,
		ipAddress: string,
		replaceExisting: boolean = false,
	) {
		const product = await this.productRepo.findById(productId);
		if (!product) {
			throw new NotFoundException('Product not found');
		}

		// Delete old images if replace mode
		if (replaceExisting && product.imageUrls && product.imageUrls.length > 0) {
			await this.deleteProductImages(product.imageUrls);
		}

		// Upload via MediaService
		const result = await this.mediaService.uploadFile(
			file,
			`products/${productId}`,
		);

		const updatedUrls = replaceExisting
			? [result.url]
			: [...(product.imageUrls || []), result.url];

		const updated = await getDatabase().transaction(async (tx) => {
			const updatedProduct = await this.productRepo.update(
				productId,
				{ imageUrls: updatedUrls },
				tx,
			);

			await this.auditLoggerService.logInTx(tx as any, {
				actorId,
				workspaceId,
				action: AuditAction.PRODUCT_IMAGE_UPLOAD_SUCCESS,
				resourceType: 'product',
				resourceId: productId,
				changes: {
					imageUrl: result.url,
					totalImages: updatedUrls.length,
					replaceExisting,
				},
				ipAddress,
				status: AuditStatus.SUCCESS,
			});

			return updatedProduct;
		});

		this.logger.log(`Product image uploaded: ${productId}`);
		return this.withSignedUrls(updated);
	}

	/**
	 * Batch upload product images from URLs (parallel processing)
	 * - Fetches multiple images from URLs concurrently and uploads to object storage
	 * - If replaceExisting=true: deletes all old images and stores only new ones
	 * - If replaceExisting=false (default): appends new images to existing ones
	 * - Uses Promise.all for efficient parallel URL fetching
	 */
	async uploadProductImageFromUrl(
		productId: string,
		urls: string[],
		actorId: string,
		workspaceId: string,
		ipAddress: string,
		folder?: string,
		replaceExisting: boolean = false,
	) {
		const product = await this.productRepo.findById(productId);
		if (!product) {
			throw new NotFoundException('Product not found');
		}

		if (!urls || urls.length === 0) {
			throw new BadRequestException('At least one URL is required');
		}

		if (replaceExisting && product.imageUrls && product.imageUrls.length > 0) {
			await this.deleteProductImages(product.imageUrls);
		}

		// Batch upload via MediaService (parallel - all URLs fetched concurrently)
		const uploadPromises = urls.map((url) =>
			this.mediaService.uploadFromUrl(url, folder || `products/${productId}`),
		);
		const results = await Promise.all(uploadPromises);
		const newImageUrls = results.map((r) => r.url);

		// Build updated imageUrls array: replace all or append
		const updatedUrls = replaceExisting
			? newImageUrls
			: [...(product.imageUrls || []), ...newImageUrls];

		const updated = await getDatabase().transaction(async (tx) => {
			const updatedProduct = await this.productRepo.update(
				productId,
				{ imageUrls: updatedUrls },
				tx,
			);

			await this.auditLoggerService.logInTx(tx as any, {
				actorId,
				workspaceId,
				action: AuditAction.PRODUCT_IMAGE_BATCH_UPLOAD_FROM_URL_SUCCESS,
				resourceType: 'product',
				resourceId: productId,
				changes: {
					uploadedCount: newImageUrls.length,
					uploadedUrls: newImageUrls,
					totalImages: updatedUrls.length,
					replaceExisting,
				},
				ipAddress,
				status: AuditStatus.SUCCESS,
			});

			return updatedProduct;
		});

		this.logger.log(
			`Batch uploaded ${newImageUrls.length} product images: ${productId}`,
		);
		return this.withSignedUrls(updated);
	}

	private async deleteProductImages(imageUrls: string[]): Promise<void> {
		if (!imageUrls || imageUrls.length === 0) {
			return;
		}

		try {
			await Promise.all(
				imageUrls.map((url) => {
					// Only delete object storage URLs (not external URLs)
					if (!url.startsWith('http://') && !url.startsWith('https://')) {
						return this.objectStorageService.deleteFile(url).catch((error) => {
							this.logger.warn(`Failed to delete image: ${url}`, error);
						});
					}
					return Promise.resolve();
				}),
			);
		} catch (error) {
			this.logger.error('Error deleting product images', error);
			// Don't throw - image deletion failure shouldn't block product update
		}
	}
}
