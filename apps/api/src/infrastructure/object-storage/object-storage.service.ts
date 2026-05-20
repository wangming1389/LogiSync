import {
	BadRequestException,
	Injectable,
	Logger,
	OnModuleDestroy,
	OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';
import { v4 as uuidv4 } from 'uuid';

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
			// MinIO is optional
			this.isConnected = false;
			this.logger.warn(
				'MinIO unavailable at startup - object storage degraded.',
				error instanceof Error ? error.stack : String(error),
			);
		}
	}

	onModuleDestroy() {
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

	async uploadFileWithExtension(
		fileBuffer: Buffer,
		originalName: string,
		folder = 'media',
	): Promise<string> {
		this.ensureConnected();
		const extension = originalName.split('.').pop() || 'png';
		const objectName = `${folder}/${uuidv4()}.${extension}`;
		await this.minioClient.putObject(this.bucketName, objectName, fileBuffer);
		return objectName;
	}

	uploadFromUrl(url: string, folder = 'media'): Promise<string> {
		void url;
		void folder;
		throw new BadRequestException('Remote URL upload is disabled for security');
	}

	async deleteFile(objectName: string): Promise<void> {
		this.ensureConnected();
		await this.minioClient.removeObject(this.bucketName, objectName);
	}

	async bucketExists(): Promise<boolean> {
		this.ensureConnected();
		return this.minioClient.bucketExists(this.bucketName);
	}

	async generateSignedUrl(
		objectName: string,
		expirySeconds = 60 * 60,
	): Promise<string> {
		this.ensureConnected();
		return this.minioClient.presignedGetObject(
			this.bucketName,
			objectName,
			expirySeconds,
		);
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
