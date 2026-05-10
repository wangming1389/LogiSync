import { execFile } from 'node:child_process';
import { Readable } from 'node:stream';
import { createGzip } from 'node:zlib';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';
import { formatTimestamp } from '../../common/utils/format-timestamp.utils';

// Result of one snapshot backup operation.
export interface BackupResult {
	success: boolean;
	objectPath: string;
	sizeBytes: number;
	durationMs: number;
	timestamp: Date;
	error?: string;
}

// Result of cleanup operation, including how many files were deleted vs retained.
export interface CleanupResult {
	deletedCount: number;
	retainedCount: number;
	deletedFiles: string[];
}

/**
 * DatabaseBackupService
 *
 * Thực hiện chiến lược "Daily Snapshot + WAL Archiving":
 * - Tạo bản snapshot PostgreSQL hằng ngày bằng pg_dump (custom format, nén gzip)
 * - Upload lên MinIO bucket riêng (logisync-backups)
 * - Tự động xóa các bản backup cũ hơn retention period
 *
 * Kết hợp với WAL Archiving (cấu hình ở Docker level), đảm bảo:
 * - RPO ≈ 0 (Point-in-Time Recovery đến giao dịch cuối cùng)
 * - RTO < 24h (restore snapshot + replay WAL)
 */
@Injectable()
export class DatabaseBackupService implements OnModuleInit {
	private readonly logger = new Logger(DatabaseBackupService.name);

	private minioClient!: Client;
	private isConnected = false;

	private readonly backupBucket: string;
	private readonly retentionDays: number;
	private readonly backupEnabled: boolean;

	// Prefix cho snapshot và WAL trong bucket
	private readonly SNAPSHOT_PREFIX = 'snapshots/';
	private readonly WAL_PREFIX = 'wal-archive/';

	constructor(private readonly configService: ConfigService) {
		this.backupBucket = this.configService.get<string>(
			'BACKUP_BUCKET_NAME',
			'logisync-backups',
		);
		this.retentionDays = Number(
			this.configService.get<string>('BACKUP_RETENTION_DAYS', '7'),
		);
		this.backupEnabled =
			this.configService.get<string>('BACKUP_ENABLED', 'true') === 'true';
	}

	async onModuleInit() {
		if (!this.backupEnabled) {
			this.logger.warn('Database backup is DISABLED (BACKUP_ENABLED=false)');
			return;
		}

		this.logger.log('Initializing Database Backup Service...');

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
			// Kiểm tra kết nối MinIO
			await this.minioClient.listBuckets();

			// Tự động tạo bucket backup nếu chưa có
			const bucketExists = await this.minioClient.bucketExists(
				this.backupBucket,
			);

			if (!bucketExists) {
				await this.minioClient.makeBucket(this.backupBucket);
				this.logger.log(`Backup bucket created: ${this.backupBucket}`);
			}

			this.isConnected = true;
			this.logger.log(
				`Database Backup Service ready → bucket: ${this.backupBucket}, retention: ${this.retentionDays} days`,
			);
		} catch (error) {
			this.logger.error(
				'Failed to initialize backup service (MinIO unavailable)',
				error instanceof Error ? error.stack : String(error),
			);
			// Không throw - backup là non-critical, app vẫn chạy được
		}
	}

	/**
	 * Tạo Daily Snapshot bằng pg_dump và upload lên MinIO.
	 *
	 * Flow:
	 * 1. Parse DATABASE_URL → extract connection params
	 * 2. Chạy pg_dump --format=custom (binary, nén sẵn, hỗ trợ pg_restore)
	 * 3. Pipe output qua gzip → upload lên MinIO
	 * 4. Return kết quả (path, size, duration)
	 */
	async createDailySnapshot(): Promise<BackupResult> {
		const startTime = Date.now();
		const now = new Date();
		const timestamp = formatTimestamp(now);
		const objectPath = `${this.SNAPSHOT_PREFIX}${timestamp}.dump.gz`;

		this.ensureConnected();

		try {
			this.logger.log(`Creating snapshot: ${objectPath}`);

			// Parse database connection
			const dbConfig = this.parseDatabaseUrl();

			// Chạy pg_dump và lấy output dưới dạng buffer
			const dumpBuffer = await this.executePgDump(dbConfig);

			// Nén bằng gzip
			const compressedBuffer = await this.compressBuffer(dumpBuffer);

			// Upload lên MinIO
			await this.minioClient.putObject(
				this.backupBucket,
				objectPath,
				compressedBuffer,
				compressedBuffer.length,
				{ 'Content-Type': 'application/gzip' },
			);

			const durationMs = Date.now() - startTime;
			const sizeMB = (compressedBuffer.length / (1024 * 1024)).toFixed(2);

			this.logger.log(
				`✅ Snapshot completed: ${objectPath} | Size: ${sizeMB} MB | Duration: ${durationMs}ms`,
			);

			return {
				success: true,
				objectPath,
				sizeBytes: compressedBuffer.length,
				durationMs,
				timestamp: now,
			};
		} catch (error) {
			const durationMs = Date.now() - startTime;
			const errorMessage =
				error instanceof Error ? error.message : String(error);

			this.logger.error(
				`❌ Snapshot failed: ${errorMessage}`,
				error instanceof Error ? error.stack : undefined,
			);

			return {
				success: false,
				objectPath,
				sizeBytes: 0,
				durationMs,
				timestamp: now,
				error: errorMessage,
			};
		}
	}

	/**
	 * Xóa các bản backup cũ hơn retention period.
	 *
	 * Quét tất cả objects trong prefix `snapshots/`,
	 * parse timestamp từ tên file, xóa nếu quá hạn.
	 */
	async cleanupOldBackups(retentionDays?: number): Promise<CleanupResult> {
		this.ensureConnected();

		const days = retentionDays ?? this.retentionDays;
		const cutoffDate = new Date();
		cutoffDate.setDate(cutoffDate.getDate() - days);

		this.logger.log(
			`Cleaning up backups older than ${days} days (before ${cutoffDate.toISOString()})`,
		);

		const deletedFiles: string[] = [];
		let retainedCount = 0;

		const objectsStream = this.minioClient.listObjects(
			this.backupBucket,
			this.SNAPSHOT_PREFIX,
			true,
		);

		const objects: { name: string; lastModified: Date }[] = [];

		// Collect tất cả objects
		await new Promise<void>((resolve, reject) => {
			objectsStream.on('data', (obj) => {
				if (obj.name && obj.lastModified) {
					objects.push({
						name: obj.name,
						lastModified: obj.lastModified,
					});
				}
			});
			objectsStream.on('end', resolve);
			objectsStream.on('error', reject);
		});

		// Xóa các bản cũ
		for (const obj of objects) {
			if (obj.lastModified < cutoffDate) {
				await this.minioClient.removeObject(this.backupBucket, obj.name);
				deletedFiles.push(obj.name);
				this.logger.debug(`Deleted old backup: ${obj.name}`);
			} else {
				retainedCount++;
			}
		}

		if (deletedFiles.length > 0) {
			this.logger.log(
				`Cleanup done: deleted ${deletedFiles.length}, retained ${retainedCount}`,
			);
		} else {
			this.logger.log(
				`Cleanup done: nothing to delete, ${retainedCount} backups retained`,
			);
		}

		return {
			deletedCount: deletedFiles.length,
			retainedCount,
			deletedFiles,
		};
	}

	/**
	 * Xóa WAL archive files cũ hơn retention period.
	 *
	 * WAL files chỉ cần giữ lại kể từ bản snapshot cũ nhất còn tồn tại,
	 * vì WAL replay cần base snapshot + WAL segments sau đó.
	 */
	async cleanupOldWalFiles(retentionDays?: number): Promise<CleanupResult> {
		this.ensureConnected();

		const days = retentionDays ?? this.retentionDays;
		const cutoffDate = new Date();
		cutoffDate.setDate(cutoffDate.getDate() - days);

		this.logger.log(`Cleaning up WAL archives older than ${days} days`);

		const deletedFiles: string[] = [];
		let retainedCount = 0;

		const objectsStream = this.minioClient.listObjects(
			this.backupBucket,
			this.WAL_PREFIX,
			true,
		);

		const objects: { name: string; lastModified: Date }[] = [];

		await new Promise<void>((resolve, reject) => {
			objectsStream.on('data', (obj) => {
				if (obj.name && obj.lastModified) {
					objects.push({
						name: obj.name,
						lastModified: obj.lastModified,
					});
				}
			});
			objectsStream.on('end', resolve);
			objectsStream.on('error', reject);
		});

		for (const obj of objects) {
			if (obj.lastModified < cutoffDate) {
				await this.minioClient.removeObject(this.backupBucket, obj.name);
				deletedFiles.push(obj.name);
			} else {
				retainedCount++;
			}
		}

		if (deletedFiles.length > 0) {
			this.logger.log(
				`WAL cleanup done: deleted ${deletedFiles.length}, retained ${retainedCount}`,
			);
		}

		return {
			deletedCount: deletedFiles.length,
			retainedCount,
			deletedFiles,
		};
	}

	// List all snapshot backups currently available, sorted by last modified date (newest first).
	async listBackups(): Promise<
		{ name: string; size: number; lastModified: Date }[]
	> {
		this.ensureConnected();

		const results: { name: string; size: number; lastModified: Date }[] = [];

		const objectsStream = this.minioClient.listObjects(
			this.backupBucket,
			this.SNAPSHOT_PREFIX,
			true,
		);

		await new Promise<void>((resolve, reject) => {
			objectsStream.on('data', (obj) => {
				if (obj.name) {
					results.push({
						name: obj.name,
						size: obj.size ?? 0,
						lastModified: obj.lastModified ?? new Date(),
					});
				}
			});
			objectsStream.on('end', resolve);
			objectsStream.on('error', reject);
		});

		results.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());

		return results;
	}

	// Check backup service status
	getStatus(): {
		enabled: boolean;
		connected: boolean;
		bucket: string;
		retentionDays: number;
	} {
		return {
			enabled: this.backupEnabled,
			connected: this.isConnected,
			bucket: this.backupBucket,
			retentionDays: this.retentionDays,
		};
	}

	// ─── Private helpers ───

	/**
	 * Parse DATABASE_URL thành các thành phần riêng lẻ.
	 * Format: postgresql://user:password@host:port/dbname?schema=public
	 */
	private parseDatabaseUrl(): {
		host: string;
		port: string;
		user: string;
		password: string;
		database: string;
	} {
		const databaseUrl = this.configService.get<string>('DATABASE_URL');

		if (!databaseUrl) {
			throw new Error('DATABASE_URL environment variable is not set');
		}

		const url = new URL(databaseUrl);

		return {
			host: url.hostname,
			port: url.port || '5432',
			user: decodeURIComponent(url.username),
			password: decodeURIComponent(url.password),
			database: url.pathname.replace('/', ''),
		};
	}

	/**
	 * Chạy pg_dump và trả về buffer chứa dump data.
	 *
	 * Sử dụng format=custom (-Fc) - đây là format được PostgreSQL recommend:
	 * - Tự nén (compression built-in)
	 * - Hỗ trợ pg_restore selective (restore từng table)
	 * - Portable giữa các PostgreSQL versions
	 */
	private executePgDump(dbConfig: {
		host: string;
		port: string;
		user: string;
		password: string;
		database: string;
	}): Promise<Buffer> {
		return new Promise((resolve, reject) => {
			const args = [
				'--host',
				dbConfig.host,
				'--port',
				dbConfig.port,
				'--username',
				dbConfig.user,
				'--no-password',
				'--format=custom',
				'--compress=6',
				'--verbose',
				dbConfig.database,
			];

			const env = {
				...process.env,
				PGPASSWORD: dbConfig.password,
			};

			const child = execFile(
				'pg_dump',
				args,
				{
					env,
					maxBuffer: 512 * 1024 * 1024, // 512MB max
					encoding: 'buffer' as BufferEncoding,
				},
				(error, stdout, stderr) => {
					if (error) {
						this.logger.error(`pg_dump stderr: ${stderr?.toString() ?? 'N/A'}`);
						reject(new Error(`pg_dump failed: ${error.message}`));
						return;
					}

					if (stderr && stderr.length > 0) {
						// pg_dump ghi verbose info vào stderr (không phải lỗi)
						this.logger.debug(
							`pg_dump info: ${stderr.toString().slice(0, 500)}`,
						);
					}

					resolve(stdout as unknown as Buffer);
				},
			);

			child.on('error', (err) => {
				reject(
					new Error(
						`Failed to spawn pg_dump: ${err.message}. Ensure pg_dump is installed and in PATH.`,
					),
				);
			});
		});
	}

	// Nén buffer bằng gzip.
	private compressBuffer(input: Buffer): Promise<Buffer> {
		return new Promise((resolve, reject) => {
			const chunks: Buffer[] = [];
			const gzip = createGzip({ level: 6 });
			const readable = Readable.from(input);

			readable
				.pipe(gzip)
				.on('data', (chunk: Buffer) => chunks.push(chunk))
				.on('end', () => resolve(Buffer.concat(chunks)))
				.on('error', reject);
		});
	}

	private ensureConnected(): void {
		if (!this.isConnected) {
			throw new Error(
				'Backup service is not connected to MinIO. Check BACKUP_ENABLED and MinIO availability.',
			);
		}
	}
}
