import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateCatalogCategorySchema = z.object({
	name: z
		.string()
		.min(1, 'Name is required')
		.max(255, 'Name must be at most 255 characters'),
	code: z
		.string()
		.min(1, 'Code is required')
		.max(100, 'Code must be at most 100 characters'),
	description: z
		.string()
		.max(2000, 'Description must be at most 2000 characters')
		.optional(),
});

export class CreateCatalogCategoryDto extends createZodDto(
	CreateCatalogCategorySchema,
) {}

export const UpdateCatalogCategorySchema = z.object({
	name: z
		.string()
		.min(1, 'Name is required')
		.max(255, 'Name must be at most 255 characters')
		.optional(),
	code: z
		.string()
		.min(1, 'Code is required')
		.max(100, 'Code must be at most 100 characters')
		.optional(),
	description: z
		.string()
		.max(2000, 'Description must be at most 2000 characters')
		.optional(),
});

export class UpdateCatalogCategoryDto extends createZodDto(
	UpdateCatalogCategorySchema,
) {}
