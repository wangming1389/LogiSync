import { DatabaseService } from './database.service';
import { getDatabase } from './index';

jest.mock('./index', () => ({
	getDatabase: jest.fn(),
	getPool: jest.fn(),
	getReadReplicaPool: jest.fn(),
	initializeDatabase: jest.fn(),
	initializeReadReplicaDatabase: jest.fn(),
}));

describe('DatabaseService', () => {
	const tx = {};
	const db = {
		transaction: jest.fn((task: (tx: unknown) => Promise<unknown>) => task(tx)),
	};
	const store: Record<string, unknown> = {};
	const cls = {
		get: jest.fn((key: string) => store[key]),
		set: jest.fn((key: string, value: unknown) => {
			store[key] = value;
		}),
		isActive: jest.fn(() => true),
		run: jest.fn((task: () => unknown) => task()),
	};

	let service: DatabaseService;

	beforeEach(() => {
		jest.clearAllMocks();
		for (const key of Object.keys(store)) {
			delete store[key];
		}
		(getDatabase as jest.Mock).mockReturnValue(db);
		service = new DatabaseService(cls as never);
	});

	it('reuses the active CLS transaction for nested unit-of-work calls', async () => {
		await service.withTransaction(async (outerTx) => {
			await Promise.resolve();
			expect(outerTx).toBe(tx);

			await service.withTransaction(async (innerTx) => {
				await Promise.resolve();
				expect(innerTx).toBe(tx);
			});
		});

		expect(db.transaction).toHaveBeenCalledTimes(1);
	});

	it('creates a CLS context when a transaction starts outside one', async () => {
		cls.isActive.mockReturnValueOnce(false);

		await service.withTransaction(async (activeTx) => {
			await Promise.resolve();
			expect(activeTx).toBe(tx);
		});

		expect(cls.run).toHaveBeenCalledTimes(1);
	});
});
