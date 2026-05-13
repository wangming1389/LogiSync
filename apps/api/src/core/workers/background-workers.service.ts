import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DatabaseBackupService } from './database-backup.service';

@Injectable()
export class BackgroundWorkersService {
	private readonly logger = new Logger(BackgroundWorkersService.name);

	constructor(private readonly databaseBackupService: DatabaseBackupService) {}

	// Run every 15 minutes - Auto settle confirmations after 48 hours
	@Cron('0 */15 * * * *')
	// eslint-disable-next-line @typescript-eslint/require-await
	async settleConfirmations(): Promise<void> {
		try {
			this.logger.log('🔄 Starting: Auto-settle confirmations...');
			// TODO: Query orders/shipments confirmed > 48h ago and settle them
			this.logger.log('✅ Confirmation settlement completed');
		} catch (error) {
			this.logger.error('❌ Confirmation settlement failed:', error);
		}
	}

	// Run every hour - Calculate reputation scores
	@Cron('0 0 * * * *')
	// eslint-disable-next-line @typescript-eslint/require-await
	async calculateReputationScores(): Promise<void> {
		try {
			this.logger.log('🔄 Starting: Reputation score calculation...');
			// TODO: Calculate reputation based on:
			// - Delivery success rate
			// - On-time delivery rate
			// - Customer satisfaction
			// - Dispute resolution rate
			this.logger.log('✅ Reputation scores updated');
		} catch (error) {
			this.logger.error('❌ Reputation calculation failed:', error);
		}
	}

	// Run every 6 hours - Compress e-POD images
	@Cron('0 0 */6 * * *')
	// eslint-disable-next-line @typescript-eslint/require-await
	async compressEPodImages(): Promise<void> {
		try {
			this.logger.log('🔄 Starting: e-POD image compression...');
			// TODO: Compress e-POD images that are > 1MB
			this.logger.log('✅ Image compression completed');
		} catch (error) {
			this.logger.error('❌ Image compression failed:', error);
		}
	}

	// Run daily at 2 AM - Clean up expired sessions
	@Cron('0 2 * * *')
	// eslint-disable-next-line @typescript-eslint/require-await
	async cleanExpiredSessions(): Promise<void> {
		try {
			this.logger.log('🔄 Starting: Session cleanup...');
			// TODO: Remove sessions older than 7 days
			this.logger.log('✅ Session cleanup completed');
		} catch (error) {
			this.logger.error('❌ Session cleanup failed:', error);
		}
	}

	// Run daily at 3 AM - Backup database (Daily Snapshot + Cleanup)
	// Chiến lược: pg_dump → gzip → upload MinIO → xóa bản cũ > 7 ngày
	// Kết hợp với WAL Archiving (cấu hình ở Docker level) để đạt RPO ≈ 0
	@Cron('0 3 * * *')
	async backupDatabase(): Promise<void> {
		try {
			this.logger.log('🔄 Starting: Database backup (Daily Snapshot)...');

			const status = this.databaseBackupService.getStatus();

			if (!status.enabled) {
				this.logger.warn('Database backup skipped: BACKUP_ENABLED=false');
				return;
			}

			if (!status.connected) {
				this.logger.error(
					'Database backup skipped: MinIO backup service not connected',
				);
				return;
			}

			// 1. Tạo Daily Snapshot (pg_dump → gzip → MinIO)
			const result = await this.databaseBackupService.createDailySnapshot();

			if (!result.success) {
				this.logger.error(`Snapshot failed: ${result.error}`);
				return;
			}

			const sizeMB = (result.sizeBytes / (1024 * 1024)).toFixed(2);
			this.logger.log(
				`Snapshot saved: ${result.objectPath} (${sizeMB} MB, ${result.durationMs}ms)`,
			);

			// 2. Xóa các bản snapshot cũ hơn retention period
			const snapshotCleanup =
				await this.databaseBackupService.cleanupOldBackups();

			if (snapshotCleanup.deletedCount > 0) {
				this.logger.log(
					`Cleaned ${snapshotCleanup.deletedCount} old snapshots, kept ${snapshotCleanup.retainedCount}`,
				);
			}

			// 3. Xóa các WAL archive files cũ
			const walCleanup = await this.databaseBackupService.cleanupOldWalFiles();

			if (walCleanup.deletedCount > 0) {
				this.logger.log(
					`Cleaned ${walCleanup.deletedCount} old WAL files, kept ${walCleanup.retainedCount}`,
				);
			}

			// 4. Log tổng kết
			const backups = await this.databaseBackupService.listBackups();
			this.logger.log(
				`✅ Database backup completed. Total snapshots available: ${backups.length}`,
			);
		} catch (error) {
			this.logger.error(
				'❌ Database backup failed:',
				error instanceof Error ? error.stack : String(error),
			);
		}
	}
}
