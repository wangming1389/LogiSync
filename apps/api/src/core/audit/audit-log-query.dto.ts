import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const pageSchema = z.coerce.number().int().min(1).default(1);
const limitSchema = z.coerce.number().int().min(1).max(25).default(25);
const dateQuerySchema = z
	.string()
	.trim()
	.refine((value) => !Number.isNaN(Date.parse(value)), {
		message: 'Invalid date',
	});

export const AuditLogQuerySchema = z
	.object({
		actorId: z.string().uuid().optional(),
		workspaceId: z.string().uuid().optional(),
		action: z.string().min(1).max(255).optional(),
		from: dateQuerySchema.optional(),
		to: dateQuerySchema.optional(),
		page: pageSchema,
		limit: limitSchema,
	})
	.refine(
		(query) =>
			!query.from ||
			!query.to ||
			Date.parse(query.from) <= Date.parse(query.to),
		{
			message: 'from must be before or equal to to',
			path: ['from'],
		},
	);

export class AuditLogQueryDto extends createZodDto(AuditLogQuerySchema) {}

export type AuditLogQuery = z.infer<typeof AuditLogQuerySchema>;
