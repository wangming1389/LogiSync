import {
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

		const stream: any = await this.minioClient.getObject(
			this.bucketName,
			objectName,
		);
		const chunks: Buffer[] = [];

		return new Promise((resolve, reject) => {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
			stream.on('data', (chunk: Buffer) => {
				chunks.push(chunk);
			});

			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
			stream.on('end', () => {
				resolve(Buffer.concat(chunks));
			});

			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
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

	async uploadFromUrl(url: string, folder = 'media'): Promise<string> {
		this.ensureConnected();
		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(
					`Failed to fetch image from URL: ${response.statusText}`,
				);
			}
			const arrayBuffer = await response.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);

			// Try to get extension from URL or Content-Type
			let extension = url.split('.').pop()?.split('?')[0];
			if (!extension || extension.length > 5 || extension.includes('/')) {
				const contentType = response.headers.get('content-type');
				extension = contentType ? contentType.split('/')[1] : 'png';
			}

			const objectName = `${folder}/${uuidv4()}.${extension}`;
			await this.minioClient.putObject(this.bucketName, objectName, buffer);
			return objectName;
		} catch (error) {
			this.logger.error(
				`Error uploading from URL: ${url}`,
				error instanceof Error ? error.stack : String(error),
			);
			throw new Error('Could not upload image from URL');
		}
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
