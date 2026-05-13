import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateProductSchema = z.object({
	supplierCategoryId: z
		.string()
		.uuid('supplierCategoryId must be a valid UUID'),
	uomId: z.string().uuid('uomId must be a valid UUID'),
	sku: z
		.string()
		.min(1, 'SKU is required')
		.max(100, 'SKU must be at most 100 characters'),
	name: z
		.string()
		.min(1, 'Name is required')
		.max(255, 'Name must be at most 255 characters'),
	description: z
		.string()
		.max(2000, 'Description must be at most 2000 characters')
		.optional(),
	unitPrice: z.number().int().positive('Unit price must be a positive integer'),
	minOrderQty: z
		.number()
		.int()
		.positive('Minimum order quantity must be a positive integer')
		.optional()
		.default(1),
	attributes: z.record(z.unknown()).optional(),
});

export class CreateProductDto extends createZodDto(CreateProductSchema) {}

export const UpdateProductSchema = CreateProductSchema.omit({
	sku: true,
	supplierCategoryId: true,
	uomId: true,
}).partial();

export class UpdateProductDto extends createZodDto(UpdateProductSchema) {}

export const ListProductsQuerySchema = z.object({
	keyword: z.string().optional(),
	categoryId: z.string().uuid().optional(),
	status: z.enum(['draft', 'active', 'inactive']).optional(),
	minPrice: z.coerce.number().int().positive().optional(),
	maxPrice: z.coerce.number().int().positive().optional(),
	sortBy: z.enum(['name', 'price', 'updatedAt']).optional(),
	order: z.enum(['asc', 'desc']).optional(),
	limit: z.coerce.number().int().positive().max(25).optional().default(25),
	offset: z.coerce.number().int().min(0).optional().default(0),
});

export class ListProductsQueryDto extends createZodDto(
	ListProductsQuerySchema,
) {}

// check SKU availability for new product creation - must be unique across workspace
export const CheckSkuQuerySchema = z.object({
	sku: z.string().min(1, 'SKU is required'),
});

export class CheckSkuQueryDto extends createZodDto(CheckSkuQuerySchema) {}

// batch upload images from URLs - for uploading multiple images at once
export const UploadProductImageFromUrlSchema = z.object({
	urls: z
		.array(z.string().url('Each URL must be valid'))
		.min(1, 'At least one URL is required'),
	folder: z.string().optional(),
	replaceExisting: z.boolean().optional().default(false),
});

export class UploadProductImageFromUrlDto extends createZodDto(
	UploadProductImageFromUrlSchema,
) {}
