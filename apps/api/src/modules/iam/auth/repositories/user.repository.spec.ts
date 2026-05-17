import { and, eq } from 'drizzle-orm';
import { getDatabase } from '../../../../infrastructure/database';
import { UserRepository } from './user.repository';

jest.mock('drizzle-orm', () => ({
	and: jest.fn((...conditions: unknown[]) => ({ conditions })),
	eq: jest.fn((left: unknown, right: unknown) => ({ left, right })),
}));

jest.mock('../../../../infrastructure/database', () => ({
	getDatabase: jest.fn(),
	schema: {
		users: {
			id: 'users.id',
			workspaceId: 'users.workspaceId',
			email: 'users.email',
		},
	},
}));

describe('UserRepository', () => {
	const where = jest.fn().mockResolvedValue([]);
	const from = jest.fn(() => ({ where }));
	const select = jest.fn(() => ({ from }));
	const db = { select };
	const cls = { get: jest.fn() };

	let repository: UserRepository;

	beforeEach(() => {
		jest.clearAllMocks();
		(getDatabase as jest.Mock).mockReturnValue(db);
		cls.get.mockReturnValue('workspace-1');
		repository = new UserRepository(cls as never);
	});

	it('TC-IAM-09 Multi-tenancy Isolation', async () => {
		await repository.findById('user-1');

		expect(eq).toHaveBeenCalledWith('users.id', 'user-1');
		expect(eq).toHaveBeenCalledWith('users.workspaceId', 'workspace-1');
		expect(and).toHaveBeenCalledWith(
			{ left: 'users.id', right: 'user-1' },
			{ left: 'users.workspaceId', right: 'workspace-1' },
		);
		expect(where).toHaveBeenCalledWith({
			conditions: [
				{ left: 'users.id', right: 'user-1' },
				{ left: 'users.workspaceId', right: 'workspace-1' },
			],
		});
	});
});
