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

	it('TC-INFRA-01 Active CLS Transaction Priority', () => {
		store[DATABASE_TRANSACTION_KEY] = tx;

		const repository = new TestRepository(cls as never);

		expect(repository.runner).toBe(tx);
		expect(getDatabase).not.toHaveBeenCalled();
	});

	it('TC-INFRA-02 Root Database Fallback', () => {
		const repository = new TestRepository(cls as never);

		expect(repository.runner).toBe(db);
		expect(getDatabase).toHaveBeenCalledTimes(1);
	});
});
