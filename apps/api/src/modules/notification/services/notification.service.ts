import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EmailService } from '../../../infrastructure/email/email.service';
import {
	type NotificationListRow,
	NotificationRepository,
} from '../repositories/notification.repository';

export interface NotifyPlatformAdminsInput {
	title: string;
	content: string;
	type: string;
	referenceId?: string;
}

@Injectable()
export class NotificationService {
	private readonly logger = new Logger(NotificationService.name);

	constructor(
		private readonly notificationRepository: NotificationRepository,
		private readonly emailService: EmailService,
	) {}

	async notifyPlatformAdmins(input: NotifyPlatformAdminsInput): Promise<void> {
		const admins = await this.notificationRepository.findAllPlatformAdmins();
		if (admins.length === 0) {
			this.logger.warn(
				`No active platform admins to receive notification "${input.title}"`,
			);
			return;
		}

		const notification = await this.notificationRepository.createNotification({
			title: input.title,
			content: input.content,
			type: input.type,
			referenceId: input.referenceId ?? null,
		});

		await this.notificationRepository.createUserNotifications(
			admins.map((admin) => ({
				userId: admin.id,
				notificationId: notification.id,
			})),
		);

		this.logger.log(
			`Notification "${input.title}" fanned out to ${admins.length} platform admin(s)`,
		);

		await Promise.allSettled(
			admins.map((admin) =>
				this.emailService.sendMail({
					to: admin.email,
					subject: `[LogiSync] ${input.title}`,
					text: input.content,
				}),
			),
		);
	}

	async listForUser(
		userId: string,
		options: { page: number; limit: number; onlyUnread: boolean },
	) {
		const { items, total } =
			await this.notificationRepository.findUserNotifications(userId, options);
		const unreadCount = options.onlyUnread
			? total
			: await this.notificationRepository.countUnread(userId);

		return {
			items: items.map((row) => this.toItemDto(row)),
			total,
			page: options.page,
			limit: options.limit,
			unreadCount,
		};
	}

	async markAsRead(userId: string, notificationId: string): Promise<void> {
		const updated = await this.notificationRepository.markAsRead(
			userId,
			notificationId,
		);
		if (!updated) {
			throw new NotFoundException(
				'Notification not found or already marked as read',
			);
		}
	}

	async markAllAsRead(userId: string): Promise<{ updated: number }> {
		const updated = await this.notificationRepository.markAllAsRead(userId);
		return { updated };
	}

	private toItemDto(row: NotificationListRow) {
		return {
			id: row.id,
			title: row.title,
			content: row.content,
			type: row.type,
			referenceId: row.referenceId,
			isRead: row.isRead,
			deliveredAt: row.deliveredAt.toISOString(),
			readAt: row.readAt ? row.readAt.toISOString() : null,
		};
	}
}
