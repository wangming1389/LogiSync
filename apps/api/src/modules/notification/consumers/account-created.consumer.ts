import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EmailService } from '../../../infrastructure/email/email.service';
import { MessageQueueService } from '../../../infrastructure/message-queue/message-queue.service';

export const ACCOUNT_CREATED_QUEUE = 'account.created';
export const ACCOUNT_CREATED_DLQ = 'account.created.dlq';
export const ACCOUNT_CREATED_MAX_RETRIES = 3;

interface AccountCreatedEvent {
	userId: string;
	email: string;
	firstName?: string | null;
	lastName?: string | null;
	tempPassword: string;
	workspaceName: string;
}

function isAccountCreatedEvent(value: unknown): value is AccountCreatedEvent {
	if (!value || typeof value !== 'object') {
		return false;
	}
	const record = value as Record<string, unknown>;
	return (
		typeof record.userId === 'string' &&
		typeof record.email === 'string' &&
		typeof record.tempPassword === 'string' &&
		typeof record.workspaceName === 'string'
	);
}

/**
 * AccountCreatedConsumer — delivers the welcome email containing the
 * temporary password to a newly provisioned employee.
 *
 * Uses `consumeWithRetry` to bound retries (default 3) and dead-letter
 * unrecoverable failures to `account.created.dlq` so the temp password
 * is never silently dropped without operator visibility.
 */
@Injectable()
export class AccountCreatedConsumer implements OnModuleInit {
	private readonly logger = new Logger(AccountCreatedConsumer.name);

	constructor(
		private readonly messageQueueService: MessageQueueService,
		private readonly emailService: EmailService,
	) {}

	async onModuleInit(): Promise<void> {
		if (!this.messageQueueService.isReady()) {
			this.logger.warn(
				'RabbitMQ not ready - account.created consumer will not start',
			);
			return;
		}

		await this.messageQueueService.consumeWithRetry(
			ACCOUNT_CREATED_QUEUE,
			(raw) => this.handleMessage(raw),
			ACCOUNT_CREATED_MAX_RETRIES,
			ACCOUNT_CREATED_DLQ,
		);
		this.logger.log(
			`Subscribed to queue "${ACCOUNT_CREATED_QUEUE}" (DLQ "${ACCOUNT_CREATED_DLQ}", maxRetries=${ACCOUNT_CREATED_MAX_RETRIES})`,
		);
	}

	private async handleMessage(raw: unknown): Promise<void> {
		if (!isAccountCreatedEvent(raw)) {
			throw new Error('Malformed account.created event payload');
		}

		const greetingName =
			[raw.firstName, raw.lastName].filter(Boolean).join(' ').trim() ||
			raw.email;

		await this.emailService.sendMail({
			to: raw.email,
			subject: `[LogiSync] Your employee account for ${raw.workspaceName} has been created`,
			text: [
				`Hello ${greetingName},`,
				'',
				`Your LogiSync account for workspace "${raw.workspaceName}" has been created.`,
				`Login email: ${raw.email}`,
				`Temporary password: ${raw.tempPassword}`,
				'',
				'Please sign in and change your password the first time you access your account.',
				'',
				'-- LogiSync',
			].join('\n'),
		});
	}
}
