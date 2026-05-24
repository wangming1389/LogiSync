import {
	Injectable,
	Logger,
	OnModuleDestroy,
	OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Channel, ChannelModel, ConsumeMessage } from 'amqplib';
import * as amqp from 'amqplib';

@Injectable()
export class MessageQueueService implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(MessageQueueService.name);

	private connection?: ChannelModel;

	private channel?: Channel;
	private isConnected = false;

	constructor(private readonly configService: ConfigService) {}

	async onModuleInit() {
		this.logger.log('Connecting RabbitMQ...');

		const rabbitmqUrl = this.configService.get<string>(
			'RABBITMQ_URL',
			'amqp://guest:guest@localhost:5672',
		);

		try {
			this.connection = await amqp.connect(rabbitmqUrl);
			this.channel = await this.connection.createChannel();
			this.isConnected = true;

			this.connection.on('error', (error: Error) => {
				this.logger.error('RabbitMQ connection error', error.stack);
				this.isConnected = false;
			});

			this.connection.on('close', () => {
				this.logger.warn('RabbitMQ connection closed');
				this.isConnected = false;
			});

			this.logger.log('RabbitMQ connected successfully.');
		} catch (error) {
			// RabbitMQ is optional
			this.isConnected = false;
			this.logger.warn(
				'RabbitMQ unavailable at startup - message queue degraded.',
				error instanceof Error ? error.message : String(error),
			);
		}
	}

	async onModuleDestroy() {
		this.logger.log('Closing RabbitMQ connection...');
		if (this.channel) {
			await this.channel.close();
		}
		if (this.connection) {
			await this.connection.close();
		}
		this.logger.log('RabbitMQ connection closed.');
	}

	async ping(): Promise<void> {
		if (!this.isConnected || !this.channel) {
			throw new Error('RabbitMQ is not connected');
		}

		await this.channel.assertQueue('healthcheck:test', { durable: false });
	}

	async publishMessage(queue: string, message: unknown): Promise<void> {
		if (!this.isConnected || !this.channel) {
			throw new Error('RabbitMQ is not connected');
		}

		await this.channel.assertQueue(queue, { durable: true });
		this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
			persistent: true,
		});
	}

	/**
	 * Publish a message to a durable queue wired with a dead-letter queue.
	 *
	 * `queue` is asserted with `x-dead-letter-exchange: ''` and
	 * `x-dead-letter-routing-key: <dlqQueue>`, while the DLQ itself is a
	 * separate durable queue. Use this only for queues that opt-in to DLQ
	 * semantics — `publishMessage` remains unchanged to keep existing
	 * queues (e.g. healthcheck) backward compatible.
	 */
	async publishWithDLQ(
		queue: string,
		message: unknown,
		dlqQueue: string,
	): Promise<void> {
		if (!this.isConnected || !this.channel) {
			throw new Error('RabbitMQ is not connected');
		}

		await this.channel.assertQueue(dlqQueue, { durable: true });
		await this.channel.assertQueue(queue, {
			durable: true,
			arguments: {
				'x-dead-letter-exchange': '',
				'x-dead-letter-routing-key': dlqQueue,
			},
		});

		this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
			persistent: true,
		});
	}

	async consumeMessage(
		queue: string,
		callback: (message: unknown) => Promise<void>,
	): Promise<void> {
		if (!this.isConnected || !this.channel) {
			throw new Error('RabbitMQ is not connected');
		}

		const channel = this.channel;
		await channel.assertQueue(queue, { durable: true });
		await channel.consume(queue, (message) => {
			void this.handleConsumedMessage(channel, message, callback);
		});
	}

	/**
	 * Consume a queue with bounded retries and dead-letter routing.
	 *
	 * Each failed delivery increments the `x-retry-count` header. Up to
	 * `maxRetries` retries, the message is republished onto the same
	 * queue (the broker handles redelivery ordering); the original
	 * delivery is acked so RabbitMQ stops the redelivery loop. After the
	 * retry budget is exhausted, the payload is published to `dlqQueue`
	 * and the original message is acked.
	 */
	async consumeWithRetry(
		queue: string,
		callback: (message: unknown) => Promise<void>,
		maxRetries: number,
		dlqQueue: string,
	): Promise<void> {
		if (!this.isConnected || !this.channel) {
			throw new Error('RabbitMQ is not connected');
		}

		const channel = this.channel;
		await channel.assertQueue(dlqQueue, { durable: true });
		await channel.assertQueue(queue, {
			durable: true,
			arguments: {
				'x-dead-letter-exchange': '',
				'x-dead-letter-routing-key': dlqQueue,
			},
		});

		await channel.consume(queue, (message) => {
			void this.handleRetriableMessage(
				channel,
				message,
				callback,
				queue,
				dlqQueue,
				maxRetries,
			);
		});
	}

	isReady(): boolean {
		return this.isConnected;
	}

	private async handleConsumedMessage(
		channel: Channel,
		message: ConsumeMessage | null,
		callback: (message: unknown) => Promise<void>,
	): Promise<void> {
		if (!message) {
			return;
		}

		try {
			const content = JSON.parse(message.content.toString()) as unknown;
			await callback(content);
			channel.ack(message);
		} catch (error) {
			this.logger.error('Error processing message', error);
			channel.nack(message, false, true);
		}
	}

	private async handleRetriableMessage(
		channel: Channel,
		message: ConsumeMessage | null,
		callback: (message: unknown) => Promise<void>,
		queue: string,
		dlqQueue: string,
		maxRetries: number,
	): Promise<void> {
		if (!message) {
			return;
		}

		const headers = (message.properties.headers ?? {}) as Record<
			string,
			unknown
		>;
		const rawRetryCount = headers['x-retry-count'];
		const retryCount =
			typeof rawRetryCount === 'number' && Number.isFinite(rawRetryCount)
				? rawRetryCount
				: 0;

		try {
			const content = JSON.parse(message.content.toString()) as unknown;
			await callback(content);
			channel.ack(message);
		} catch (error) {
			this.logger.error(
				`Error processing message from "${queue}" (retry ${retryCount}/${maxRetries})`,
				error instanceof Error ? error.stack : String(error),
			);

			if (retryCount >= maxRetries) {
				channel.sendToQueue(dlqQueue, message.content, {
					persistent: true,
					headers: {
						...headers,
						'x-retry-count': retryCount,
						'x-original-queue': queue,
						'x-dead-lettered-at': new Date().toISOString(),
					},
				});
				channel.ack(message);
				return;
			}

			channel.sendToQueue(queue, message.content, {
				persistent: true,
				headers: {
					...headers,
					'x-retry-count': retryCount + 1,
				},
			});
			channel.ack(message);
		}
	}
}
