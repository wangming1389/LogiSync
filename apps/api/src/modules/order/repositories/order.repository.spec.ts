import { eq, or } from 'drizzle-orm';
import { getDatabase } from '../../../infrastructure/database';
import { UserRole } from '../../iam/auth/enums/user-role.enum';
import { OrderRepository } from './order.repository';

jest.mock('drizzle-orm', () => ({
	and: jest.fn((...conditions: unknown[]) => ({ conditions })),
	desc: jest.fn((field: unknown) => ({ direction: 'desc', field })),
	eq: jest.fn((left: unknown, right: unknown) => ({ op: 'eq', left, right })),
	gte: jest.fn((left: unknown, right: unknown) => ({ op: 'gte', left, right })),
	inArray: jest.fn((left: unknown, right: unknown) => ({
		op: 'inArray',
		left,
		right,
	})),
	isNull: jest.fn((field: unknown) => ({ op: 'isNull', field })),
	lte: jest.fn((left: unknown, right: unknown) => ({ op: 'lte', left, right })),
	or: jest.fn((...conditions: unknown[]) => ({ op: 'or', conditions })),
	sql: jest.fn(() => 'count(*)::int'),
}));

jest.mock('../../../infrastructure/database', () => ({
	getDatabase: jest.fn(),
	schema: {
		purchaseOrders: {
			id: 'purchaseOrders.id',
			buyerWorkspaceId: 'purchaseOrders.buyerWorkspaceId',
			supplierWorkspaceId: 'purchaseOrders.supplierWorkspaceId',
			assignedTo: 'purchaseOrders.assignedTo',
			status: 'purchaseOrders.status',
			createdAt: 'purchaseOrders.createdAt',
			autoConfirmAt: 'purchaseOrders.autoConfirmAt',
		},
		orderAssignmentHistory: {
			orderId: 'orderAssignmentHistory.orderId',
			unassignedAt: 'orderAssignmentHistory.unassignedAt',
			assignedAt: 'orderAssignmentHistory.assignedAt',
		},
		orderStatusHistory: {
			orderId: 'orderStatusHistory.orderId',
			changedAt: 'orderStatusHistory.changedAt',
		},
		users: {
			id: 'users.id',
			workspaceId: 'users.workspaceId',
			isActive: 'users.isActive',
			role: 'users.role',
		},
	},
}));

describe('OrderRepository', () => {
	const offset = jest.fn().mockResolvedValue([]);
	const limit = jest.fn(() => ({ offset }));
	const orderBy = jest.fn(() => ({ limit }));
	const where = jest.fn(() => ({ orderBy }));
	const from = jest.fn(() => ({ where }));
	const select = jest.fn(() => ({ from }));
	const db = { select };
	const cls = { get: jest.fn() };

	let repository: OrderRepository;

	beforeEach(() => {
		jest.clearAllMocks();
		(getDatabase as jest.Mock).mockReturnValue(db);
		repository = new OrderRepository(cls as never);
	});

	it('TC-ORD-01 Role-Based Filtering', async () => {
		await repository.listOrders({
			role: UserRole.BUYER_STAFF,
			userId: 'buyer-staff-1',
			workspaceId: 'buyer-workspace-1',
			limit: 25,
			offset: 0,
		});

		expect(eq).toHaveBeenCalledWith(
			'purchaseOrders.buyerWorkspaceId',
			'buyer-workspace-1',
		);
		expect(eq).toHaveBeenCalledWith(
			'purchaseOrders.assignedTo',
			'buyer-staff-1',
		);
	});

	it('TC-ORD-08 Worker Idempotency', async () => {
		const forUpdate = jest.fn().mockResolvedValue([]);
		const dueWhere = jest.fn(() => ({ for: forUpdate }));
		const dueFrom = jest.fn(() => ({ where: dueWhere }));
		const tx = { select: jest.fn(() => ({ from: dueFrom })) };

		await repository.listDueAutoConfirmOrders(tx);

		expect(forUpdate).toHaveBeenCalledWith('update', { skipLocked: true });
	});

	it('TC-ORD-09 Tenant Isolation', async () => {
		(where as any).mockResolvedValueOnce([]);

		await repository.findVisibleById(
			'order-1',
			UserRole.SUPPLIER_MANAGER,
			'supplier-workspace-1',
		);

		expect(eq).toHaveBeenCalledWith('purchaseOrders.id', 'order-1');
		expect(eq).toHaveBeenCalledWith(
			'purchaseOrders.supplierWorkspaceId',
			'supplier-workspace-1',
		);
	});

	it('TC-ORD-13 scopes company admins to either buyer or supplier workspace orders', async () => {
		await repository.listOrders({
			role: UserRole.COMPANY_ADMIN,
			userId: 'company-admin-1',
			workspaceId: 'company-workspace-1',
			limit: 25,
			offset: 0,
		});

		expect(or).toHaveBeenCalledWith(
			expect.objectContaining({
				left: 'purchaseOrders.buyerWorkspaceId',
				right: 'company-workspace-1',
			}),
			expect.objectContaining({
				left: 'purchaseOrders.supplierWorkspaceId',
				right: 'company-workspace-1',
			}),
		);
	});
});
