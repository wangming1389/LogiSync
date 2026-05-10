import {
	Injectable,
	Logger,
	OnModuleDestroy,
	OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

@Injectable()
export class MessageQueueService implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(MessageQueueService.name);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private connection: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private channel: any;
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
			this.logger.error(
				'Failed to connect to RabbitMQ',
				error instanceof Error ? error.message : String(error),
			);
			throw error;
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

		// Verify connection by asserting a test queue
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

	async consumeMessage(
		queue: string,
		callback: (message: unknown) => Promise<void>,
	): Promise<void> {
		if (!this.isConnected || !this.channel) {
			throw new Error('RabbitMQ is not connected');
		}

		await this.channel.assertQueue(queue, { durable: true });
		await this.channel.consume(queue, async (message) => {
			if (message) {
				try {
					const content = JSON.parse(message.content.toString());
					await callback(content);
					this.channel.ack(message);
				} catch (error) {
					this.logger.error('Error processing message', error);
					this.channel.nack(message, false, true);
				}
			}
		});
	}

	isReady(): boolean {
		return this.isConnected;
	}
}
