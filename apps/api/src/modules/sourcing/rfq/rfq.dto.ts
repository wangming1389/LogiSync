import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateRfqSchema = z.object({
	note: z.string().max(2000).optional(),
});
export class CreateRfqDto extends createZodDto(CreateRfqSchema) {}

export const AddRfqItemSchema = z.object({
	productId: z.string().uuid('productId must be a valid UUID'),
	quantity: z.number().int().positive('quantity must be a positive integer'),
	targetPrice: z.number().int().positive().optional(),
	deliveryDate: z.coerce.date().optional(),
	deliveryLocation: z.string().max(500).optional(),
	notes: z.string().max(1000).optional(),
});
export class AddRfqItemDto extends createZodDto(AddRfqItemSchema) {}

export const UpdateRfqItemSchema = z.object({
	quantity: z.number().int().positive().optional(),
	targetPrice: z.number().int().positive().optional(),
	deliveryDate: z.coerce.date().optional(),
	deliveryLocation: z.string().max(500).optional(),
	notes: z.string().max(1000).optional(),
});
export class UpdateRfqItemDto extends createZodDto(UpdateRfqItemSchema) {}

export const ListRfqQuerySchema = z.object({
	status: z.string().optional(),
	limit: z.coerce.number().int().positive().max(50).optional().default(25),
	offset: z.coerce.number().int().min(0).optional().default(0),
});
export class ListRfqQueryDto extends createZodDto(ListRfqQuerySchema) {}
