import { ClsService } from 'nestjs-cls';
import { getDatabase } from '../../infrastructure/database';
import { BaseRepository } from './base.repository';
import { DATABASE_TRANSACTION_KEY } from './transaction-context';

jest.mock('../../infrastructure/database', () => ({
	getDatabase: jest.fn(),
}));

class TestRepository extends BaseRepository {
	constructor(cls: ClsService) {
		super(cls);
	}

	get runner() {
		return this.db;
	}
}

describe('BaseRepository', () => {
	const tx = {};
	const db = {};
	const store: Record<string, unknown> = {};
	const cls = {
		get: jest.fn((key: string) => store[key]),
	};

	beforeEach(() => {
		jest.clearAllMocks();
		for (const key of Object.keys(store)) {
			delete store[key];
		}
		(getDatabase as jest.Mock).mockReturnValue(db);
	});

	it('uses the active CLS transaction before the root database', () => {
		store[DATABASE_TRANSACTION_KEY] = tx;

		const repository = new TestRepository(cls as never);

		expect(repository.runner).toBe(tx);
		expect(getDatabase).not.toHaveBeenCalled();
	});

	it('falls back to the root database without an active transaction', () => {
		const repository = new TestRepository(cls as never);

		expect(repository.runner).toBe(db);
		expect(getDatabase).toHaveBeenCalledTimes(1);
	});
});
