import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateUomSchema = z.object({
	name: z
		.string()
		.min(1, 'Name is required')
		.max(100, 'Name must be at most 100 characters'),
	code: z
		.string()
		.min(1, 'Code is required')
		.max(20, 'Code must be at most 20 characters'),
});

export class CreateUomDto extends createZodDto(CreateUomSchema) {}

export const UpdateUomSchema = z.object({
	name: z
		.string()
		.min(1, 'Name is required')
		.max(100, 'Name must be at most 100 characters')
		.optional(),
	code: z
		.string()
		.min(1, 'Code is required')
		.max(20, 'Code must be at most 20 characters')
		.optional(),
});

export class UpdateUomDto extends createZodDto(UpdateUomSchema) {}
