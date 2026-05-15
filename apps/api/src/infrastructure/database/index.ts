/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-argument,@typescript-eslint/no-redundant-type-constituents */
import { drizzle } from 'drizzle-orm/node-postgres';

import { Pool } from 'pg';
import * as schema from './schema';

let db: ReturnType<typeof drizzle> | null = null;
let pool: Pool | null = null;
let readReplicaDb: ReturnType<typeof drizzle> | null = null;
let readReplicaPool: Pool | null = null;

export function initializeDatabase(): ReturnType<typeof drizzle> {
	if (!db) {
		const connectionString = process.env.DATABASE_URL;
		if (!connectionString) {
			throw new Error('DATABASE_URL environment variable is not set');
		}

		pool = new Pool({
			connectionString,
			max: 20,
			idleTimeoutMillis: 30000,
			connectionTimeoutMillis: 2000,
		});

		db = drizzle(pool, { schema });
	}

	return db;
}

export function initializeReadReplicaDatabase(): ReturnType<typeof drizzle> {
	if (!readReplicaDb) {
		const connectionString =
			process.env.DATABASE_REPLICA_URL ?? process.env.DATABASE_URL;
		if (!connectionString) {
			throw new Error('DATABASE_URL environment variable is not set');
		}

		readReplicaPool = new Pool({
			connectionString,
			max: 10,
			idleTimeoutMillis: 30000,
			connectionTimeoutMillis: 2000,
		});

		readReplicaDb = drizzle(readReplicaPool, { schema });
	}

	return readReplicaDb;
}

export function getDatabase() {
	if (!db) {
		throw new Error('Database not initialized');
	}

	return db;
}

export function getReadReplicaDatabase() {
	if (!readReplicaDb) {
		throw new Error('Read replica database not initialized');
	}

	return readReplicaDb;
}

export function getPool() {
	return pool;
}

export function getReadReplicaPool() {
	return readReplicaPool;
}

export { schema };
