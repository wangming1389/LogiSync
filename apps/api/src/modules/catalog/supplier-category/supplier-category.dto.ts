import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateSupplierCategorySchema = z.object({
	catalogCategoryId: z.string().uuid('catalogCategoryId must be a valid UUID'),
	name: z
		.string()
		.min(1, 'Name is required')
		.max(255, 'Name must be at most 255 characters'),
	description: z
		.string()
		.max(2000, 'Description must be at most 2000 characters')
		.optional(),
});

export class CreateSupplierCategoryDto extends createZodDto(
	CreateSupplierCategorySchema,
) {}

export const UpdateSupplierCategorySchema = z.object({
	name: z
		.string()
		.min(1, 'Name is required')
		.max(255, 'Name must be at most 255 characters')
		.optional(),
	description: z
		.string()
		.max(2000, 'Description must be at most 2000 characters')
		.optional(),
});

export class UpdateSupplierCategoryDto extends createZodDto(
	UpdateSupplierCategorySchema,
) {}

export const CheckNameQuerySchema = z.object({
	name: z.string().min(1, 'Name is required'),
});

export class CheckNameQueryDto extends createZodDto(CheckNameQuerySchema) {}
