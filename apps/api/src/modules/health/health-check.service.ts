import {
	Injectable,
	Logger,
	OnModuleDestroy,
	OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { DatabaseService } from '../../database/database.service';
import { SessionRegistryService } from '../session/session-registry.service';

export interface HealthStatus {
	database: boolean;
	redis: boolean;
	fileStorage: boolean;
	timestamp: number;
}

// now just check database and redis
@Injectable()
export class HealthCheckService implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(HealthCheckService.name);
	private readonly checkIntervalMs = 15_000; // 15 seconds
	private timer?: NodeJS.Timeout;
	private lastAlertSentAt = 0;
	private readonly alertCooldownMs = 2 * 60 * 1000; // 2 minutes
	private status: HealthStatus = {
		database: false,
		redis: false,
		fileStorage: true,
		timestamp: Date.now(),
	};

	constructor(
		private readonly databaseService: DatabaseService,
		private readonly sessionRegistryService: SessionRegistryService,
		private readonly configService: ConfigService,
	) {}

	onModuleInit() {
		this.timer = setInterval(
			() => void this.performHealthCheck(),
			this.checkIntervalMs,
		);
		this.timer.unref();
		void this.performHealthCheck();
	}

	onModuleDestroy() {
		if (this.timer) clearInterval(this.timer);
	}

	// performs health checks for all critical services and updates the status
	async performHealthCheck(): Promise<HealthStatus> {
		const failed: string[] = [];

		try {
			await this.databaseService.ping();
			this.status.database = true;
		} catch {
			this.status.database = false;
			failed.push('database');
			this.logger.error('Database health check failed');
		}

		try {
			await this.sessionRegistryService.ping();
			this.status.redis = true;
		} catch {
			this.status.redis = false;
			failed.push('redis');
			this.logger.error('Redis health check failed');
		}

		this.status.fileStorage = true;
		this.status.timestamp = Date.now();

		if (failed.length > 0) {
			this.logger.warn(`Health degraded: ${failed.join(', ')}`);
			await this.sendAlertIfNeeded(failed);
		}

		return this.getStatus();
	}

	private async sendAlertIfNeeded(failedServices: string[]): Promise<void> {
		const now = Date.now();
		if (now - this.lastAlertSentAt < this.alertCooldownMs) return; // cooldown

		this.lastAlertSentAt = now;

		const adminEmail = this.configService.get<string>('ALERT_EMAIL_TO');
		const smtpHost = this.configService.get<string>('SMTP_HOST');
		const smtpPort = this.configService.get<number>('SMTP_PORT', 587);
		const smtpUser = this.configService.get<string>('SMTP_USER');
		const smtpPass = this.configService.get<string>('SMTP_PASS');

		if (!adminEmail || !smtpHost || !smtpUser || !smtpPass) {
			this.logger.warn('SMTP not configured - skipping alert email');
			return;
		}

		try {
			// Call directly to bypass queue and avoid alert delays
			const transporter = nodemailer.createTransport({
				host: smtpHost,
				port: smtpPort,
				secure: false,
				auth: { user: smtpUser, pass: smtpPass },
			});

			await transporter.sendMail({
				from: smtpUser,
				to: adminEmail,
				subject: `🚨 [LogiSync] Critical: Service failure detected`,
				text: [
					`CRITICAL ALERT - ${new Date().toISOString()}`,
					`Failed services: ${failedServices.join(', ')}`,
					`Please check the system immediately.`,
				].join('\n'),
			});

			this.logger.warn(`Alert email sent to ${adminEmail}`);
		} catch (error) {
			this.logger.error(
				'Failed to send alert email',
				error instanceof Error ? error.stack : String(error),
			);
		}
	}

	getStatus(): HealthStatus {
		return { ...this.status };
	}

	isHealthy(): boolean {
		return this.status.database && this.status.redis && this.status.fileStorage;
	}
}
