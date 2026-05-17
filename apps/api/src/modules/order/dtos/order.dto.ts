import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ORDER_EXPORT_FORMATS } from '../enums/order.enums';

export const ListOrdersQuerySchema = z.object({
	status: z.string().max(30).optional(),
	limit: z.coerce.number().int().positive().max(100).optional().default(25),
	offset: z.coerce.number().int().min(0).optional().default(0),
});
export class ListOrdersQueryDto extends createZodDto(ListOrdersQuerySchema) {}

export const RejectOrderSchema = z.object({
	rejectionReason: z
		.string()
		.trim()
		.min(1, 'rejectionReason is required')
		.max(2000),
});
export class RejectOrderDto extends createZodDto(RejectOrderSchema) {}

export const AssignOrderSchema = z.object({
	userId: z.string().uuid(),
});
export class AssignOrderDto extends createZodDto(AssignOrderSchema) {}

export const ExportOrdersQuerySchema = z.object({
	start_date: z.coerce.date(),
	end_date: z.coerce.date(),
	format: z.enum(ORDER_EXPORT_FORMATS),
});
export class ExportOrdersQueryDto extends createZodDto(
	ExportOrdersQuerySchema,
) {}
