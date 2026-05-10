import {
	Injectable,
	Logger,
	OnModuleDestroy,
	OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';

@Injectable()
export class ObjectStorageService implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(ObjectStorageService.name);

	private minioClient!: Client;

	private isConnected = false;

	private readonly bucketName: string;

	constructor(private readonly configService: ConfigService) {
		this.bucketName = this.configService.get<string>(
			'MINIO_BUCKET_NAME',
			'logisync-bucket',
		);
	}

	async onModuleInit() {
		this.logger.log('Connecting to MinIO...');

		const endpoint = this.configService.get<string>(
			'MINIO_ENDPOINT',
			'localhost',
		);
		const port = Number(this.configService.get<string>('MINIO_PORT', '9000'));
		const useSSL = this.configService.get<string>('MINIO_USE_SSL') === 'true';
		const rootUser = this.configService.get<string>(
			'MINIO_ROOT_USER',
			'minioadmin',
		);
		const rootPassword = this.configService.get<string>(
			'MINIO_ROOT_PASSWORD',
			'minioadmin',
		);

		this.minioClient = new Client({
			endPoint: endpoint,
			port,
			useSSL,
			accessKey: rootUser,
			secretKey: rootPassword,
		});

		try {
			await this.ping();

			const bucketExists = await this.minioClient.bucketExists(this.bucketName);

			if (!bucketExists) {
				await this.minioClient.makeBucket(this.bucketName);

				this.logger.log(`Bucket created successfully: ${this.bucketName}`);
			}

			this.isConnected = true;

			this.logger.log('MinIO connected successfully.');
		} catch (error) {
			this.logger.error(
				'Failed to connect to MinIO',
				error instanceof Error ? error.stack : String(error),
			);

			throw error;
		}
	}

	async onModuleDestroy() {
		this.logger.log('Closing MinIO connection...');
		this.isConnected = false;
		this.logger.log('MinIO connection closed.');
	}

	async ping(): Promise<void> {
		if (!this.minioClient) {
			throw new Error('MinIO client is not initialized');
		}

		await this.minioClient.listBuckets();
	}

	async uploadFile(objectName: string, data: Buffer | string): Promise<void> {
		this.ensureConnected();

		await this.minioClient.putObject(this.bucketName, objectName, data);
	}

	async downloadFile(objectName: string): Promise<Buffer> {
		this.ensureConnected();

		const stream = await this.minioClient.getObject(
			this.bucketName,
			objectName,
		);
		const chunks: Buffer[] = [];

		return new Promise((resolve, reject) => {
			stream.on('data', (chunk: Buffer) => {
				chunks.push(chunk);
			});

			stream.on('end', () => {
				resolve(Buffer.concat(chunks));
			});

			stream.on('error', reject);
		});
	}

	async deleteFile(objectName: string): Promise<void> {
		this.ensureConnected();
		await this.minioClient.removeObject(this.bucketName, objectName);
	}

	async bucketExists(): Promise<boolean> {
		this.ensureConnected();
		return this.minioClient.bucketExists(this.bucketName);
	}

	getBucketName(): string {
		return this.bucketName;
	}

	isReady(): boolean {
		return this.isConnected;
	}

	private ensureConnected(): void {
		if (!this.isConnected) {
			throw new Error('MinIO is not connected');
		}
	}
}
