import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { MessageQueueService } from '../../../infrastructure/message-queue/message-queue.service';
import { NotificationService } from '../services/notification.service';

export const WORKSPACE_PENDING_QUEUE = 'workspace.pending';

interface WorkspacePendingEvent {
	workspaceId: string;
	workspaceName: string;
	registeredAt?: string | Date | null;
}

function isWorkspacePendingEvent(
	value: unknown,
): value is WorkspacePendingEvent {
	if (!value || typeof value !== 'object') {
		return false;
	}
	const record = value as Record<string, unknown>;
	return (
		typeof record.workspaceId === 'string' &&
		typeof record.workspaceName === 'string'
	);
}

/**
 * WorkspacePendingConsumer — subscribes to `workspace.pending` events
 * published by `WorkspaceService.register()` (after transaction commit)
 * and fans the notification out to all platform admins.
 *
 * RabbitMQ consumers run outside any HTTP request, so we open a fresh
 * CLS scope per delivery (per development-guidelines §4.1) to make
 * downstream repositories happy.
 */
@Injectable()
export class WorkspacePendingConsumer implements OnModuleInit {
	private readonly logger = new Logger(WorkspacePendingConsumer.name);

	constructor(
		private readonly messageQueueService: MessageQueueService,
		private readonly notificationService: NotificationService,
		private readonly cls: ClsService,
	) {}

	async onModuleInit(): Promise<void> {
		if (!this.messageQueueService.isReady()) {
			this.logger.warn(
				'RabbitMQ not ready - workspace.pending consumer will not start',
			);
			return;
		}

		await this.messageQueueService.consumeMessage(
			WORKSPACE_PENDING_QUEUE,
			(raw) => this.handleMessage(raw),
		);
		this.logger.log(`Subscribed to queue "${WORKSPACE_PENDING_QUEUE}"`);
	}

	private async handleMessage(raw: unknown): Promise<void> {
		if (!isWorkspacePendingEvent(raw)) {
			this.logger.warn('Discarding malformed workspace.pending event payload');
			return;
		}

		const payload = raw;

		await this.cls.run(async () => {
			await this.notificationService.notifyPlatformAdmins({
				title: 'Workspace mới đang chờ duyệt',
				content: `Workspace "${payload.workspaceName}" vừa đăng ký và đang chờ Platform Admin phê duyệt.`,
				type: 'workspace_pending',
				referenceId: payload.workspaceId,
			});
		});
	}
}
