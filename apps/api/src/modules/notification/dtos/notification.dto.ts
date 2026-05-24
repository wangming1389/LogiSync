import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const PaginationSchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const NotificationListQuerySchema = PaginationSchema.extend({
	onlyUnread: z.coerce.boolean().optional().default(false),
});

export class NotificationListQueryDto extends createZodDto(
	NotificationListQuerySchema,
) {}

export const NotificationItemSchema = z.object({
	id: z.string().uuid(),
	title: z.string(),
	content: z.string(),
	type: z.string(),
	referenceId: z.string().uuid().nullable(),
	isRead: z.boolean(),
	deliveredAt: z.string(),
	readAt: z.string().nullable(),
});

export class NotificationItemDto extends createZodDto(NotificationItemSchema) {}

export const NotificationListResponseSchema = z.object({
	items: z.array(NotificationItemSchema),
	total: z.number().int(),
	page: z.number().int(),
	limit: z.number().int(),
	unreadCount: z.number().int(),
});

export class NotificationListResponseDto extends createZodDto(
	NotificationListResponseSchema,
) {}
