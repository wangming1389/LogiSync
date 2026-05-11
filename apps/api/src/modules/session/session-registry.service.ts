import {
	Injectable,
	Logger,
	OnModuleDestroy,
	OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { createClient, RedisClientType } from 'redis';
import { getDatabase, schema } from '../../database';

export interface SessionData {
	userId: string;
	workspaceId: string;
	sessionId: string;
	issuedAt: number;
	expiresAt: number;
	ipAddress: string;
	userAgent?: string;
}

@Injectable()
export class SessionRegistryService implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(SessionRegistryService.name);
	private readonly redisUrl: string;
	private redisClient!: RedisClientType;
	private isConnected = false;

	constructor(private readonly configService: ConfigService) {
		this.redisUrl = this.configService.get<string>(
			'REDIS_URL',
			'redis://localhost:6379',
		);
	}

	async onModuleInit() {
		this.logger.log('Connecting Redis...');

		try {
			this.redisClient = createClient({
				url: this.redisUrl,
				socket: {
					connectTimeout: 2000,
					reconnectStrategy: (retries) => Math.min(retries * 50, 5000),
				},
			});

			this.redisClient.on('error', (error: Error) => {
				this.logger.error('Redis error', error.stack);
				this.isConnected = false;
			});

			this.redisClient.on('ready', () => {
				this.isConnected = true;
				this.logger.log('Redis reconnected.');
			});

			await this.redisClient.connect();
			this.isConnected = true;
			this.logger.log('Redis connected for Session Registry.');
		} catch (error) {
			// Redis is optional
			this.isConnected = false;
			this.logger.warn(
				'Redis unavailable at startup - session features degraded.',
				error instanceof Error ? error.message : String(error),
			);
		}
	}

	async onModuleDestroy() {
		if (!this.redisClient?.isOpen) {
			return;
		}

		this.logger.log('Closing Redis connection...');
		await this.redisClient.quit();
		this.logger.log('Redis connection closed.');
	}

	async createSession(data: Omit<SessionData, 'sessionId' | 'issuedAt'>) {
		const sessionId = this.generateSessionId();
		const issuedAt = Date.now();
		const sessionData: SessionData = {
			...data,
			sessionId,
			issuedAt,
		};

		const ttl = Math.floor((data.expiresAt - issuedAt) / 1000);

		await this.redisClient.setEx(
			`session:${sessionId}`,
			ttl,
			JSON.stringify(sessionData),
		);
		await this.redisClient.sAdd(
			`workspace:${data.workspaceId}:sessions`,
			sessionId,
		);

		const db = getDatabase();
		const tokenHash = this.hashToken(sessionId);
		await db.insert(schema.sessionRegistry).values({
			userId: data.userId,
			workspaceId: data.workspaceId,
			sessionId,
			tokenHash,
			issuedAt: new Date(issuedAt),
			expiresAt: new Date(data.expiresAt),
			ipAddress: data.ipAddress,
			userAgent: data.userAgent,
			isActive: true,
		});

		return sessionId;
	}

	async getSession(sessionId: string): Promise<SessionData | null> {
		const data = await this.redisClient.get(`session:${sessionId}`);
		if (!data) {
			return null;
		}
		const parsed = JSON.parse(data) as SessionData;
		return parsed;
	}

	async revokeSession(sessionId: string): Promise<void> {
		const session = await this.getSession(sessionId);
		if (!session) {
			return;
		}

		await this.redisClient.del(`session:${sessionId}`);
		await this.redisClient.sRem(
			`workspace:${session.workspaceId}:sessions`,
			sessionId,
		);

		const db = getDatabase();
		const tokenHash = this.hashToken(sessionId);
		await db
			.update(schema.sessionRegistry)
			.set({
				isActive: false,
				revokedAt: new Date(),
			})
			.where(eq(schema.sessionRegistry.tokenHash, tokenHash));
	}

	async revokeAllWorkspaceSessions(workspaceId: string): Promise<void> {
		const sessionIds = await this.redisClient.sMembers(
			`workspace:${workspaceId}:sessions`,
		);

		await Promise.all(
			sessionIds.map((sessionId) => this.revokeSession(sessionId)),
		);
		await this.redisClient.del(`workspace:${workspaceId}:sessions`);

		this.logger.log(
			`Revoked ${sessionIds.length} sessions for workspace ${workspaceId}`,
		);
	}

	async revokeUserSessions(userId: string, workspaceId: string): Promise<void> {
		const sessionIds = await this.redisClient.sMembers(
			`workspace:${workspaceId}:sessions`,
		);

		for (const sessionId of sessionIds) {
			const session = await this.getSession(sessionId);
			if (session && session.userId === userId) {
				await this.revokeSession(sessionId);
			}
		}
	}

	async getActiveSessionCount(workspaceId: string): Promise<number> {
		return this.redisClient.sCard(`workspace:${workspaceId}:sessions`);
	}

	async ping() {
		if (!this.isConnected || !this.redisClient?.isOpen) {
			throw new Error('Redis is not connected');
		}

		await this.redisClient.ping();
	}

	isReady() {
		return this.isConnected && this.redisClient?.isOpen === true;
	}

	private generateSessionId(): string {
		return crypto.randomBytes(32).toString('hex');
	}

	private hashToken(token: string): string {
		return crypto.createHash('sha256').update(token).digest('hex');
	}
}
