/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/only-throw-error */
import {
	Injectable,
	Logger,
	OnModuleDestroy,
	OnModuleInit,
} from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import {
	getActiveTransaction,
	runInTransactionContext,
} from '../../core/database/transaction-context';
import {
	getDatabase,
	getPool,
	getReadReplicaPool,
	initializeDatabase,
	initializeReadReplicaDatabase,
} from './index';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(DatabaseService.name);

	constructor(private readonly cls: ClsService) {}

	async onModuleInit() {
		this.logger.log('Connecting PostgreSQL...');

		await this.withRetry(
			async () => {
				initializeDatabase();
				const pool = getPool();
				if (!pool) {
					throw new Error('Database pool is not initialized');
				}
				await pool.query('select 1');
				initializeReadReplicaDatabase();
				const readReplicaPool = getReadReplicaPool();
				if (!readReplicaPool) {
					throw new Error('Read replica database pool is not initialized');
				}
				await readReplicaPool.query('select 1');
				const auditLogsTable = await readReplicaPool.query(
					"select to_regclass('public.audit_logs') as table_name",
				);
				if (!auditLogsTable.rows[0]?.table_name) {
					this.logger.error(
						'DATABASE_REPLICA_URL points to a database/schema without public.audit_logs',
					);
				}
			},
			5,
			1500,
		);

		this.logger.log('PostgreSQL connection verified.');
		this.logger.log(
			process.env.DATABASE_REPLICA_URL
				? 'PostgreSQL read replica connection verified.'
				: 'DATABASE_REPLICA_URL not set, read replica client falls back to primary.',
		);
	}

	async onModuleDestroy() {
		const pool = getPool();
		if (!pool) {
			return;
		}

		this.logger.log('Closing PostgreSQL connection...');
		await pool.end();
		const readReplicaPool = getReadReplicaPool();
		if (readReplicaPool && readReplicaPool !== pool) {
			await readReplicaPool.end();
		}
		this.logger.log('PostgreSQL connection closed.');
	}

	async ping() {
		const pool = getPool();
		if (!pool) {
			throw new Error('Database pool is not initialized');
		}

		await pool.query('select 1');
	}

	private async withRetry(
		task: () => Promise<void>,
		attempts: number,
		delayMs: number,
	): Promise<void> {
		let lastError: Error | null = null;

		for (let attempt = 1; attempt <= attempts; attempt += 1) {
			try {
				await task();
				return;
			} catch (error) {
				lastError = error instanceof Error ? error : new Error(String(error));
				this.logger.warn(
					`PostgreSQL connection attempt ${attempt}/${attempts} failed.`,
				);

				if (attempt < attempts) {
					await new Promise((resolve) => setTimeout(resolve, delayMs));
				}
			}
		}

		this.logger.error(
			'PostgreSQL connection failed after retries.',
			lastError?.stack ?? String(lastError),
		);
		throw lastError;
	}

	async withTransaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
		const activeTx = getActiveTransaction(this.cls);
		if (activeTx) {
			return callback(activeTx);
		}

		const db = getDatabase();
		return db.transaction(async (tx) => {
			return runInTransactionContext(this.cls, tx, callback);
		});
	}
}
