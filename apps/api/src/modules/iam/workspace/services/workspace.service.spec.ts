import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { WorkspaceService } from './workspace.service';

jest.mock('bcryptjs', () => ({
	hash: jest.fn(),
}));

describe('WorkspaceService', () => {
	const sessionRegistryService = {
		revokeAllWorkspaceSessions: jest.fn(),
	};
	const auditLoggerService = {
		log: jest.fn(),
		logInTx: jest.fn(),
	};
	const workspaceRepository = {
		findByTaxId: jest.fn(),
		findBySlug: jest.fn(),
		findById: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
	};
	const userRepository = {
		findByEmailForAuth: jest.fn(),
		create: jest.fn(),
	};
	const tx = {};
	const databaseService = {
		withTransaction: jest.fn((task: (tx: unknown) => Promise<unknown>) =>
			task(tx),
		),
	};

	let service: WorkspaceService;

	const dto = {
		name: 'Acme Logistics',
		slug: 'acme-logistics',
		type: 'supplier' as const,
		taxId: '0123456789',
		acceptedTermsVersion: 'v1',
		adminEmail: 'admin@acme.test',
		adminPassword: 'StrongPass1!',
	};

	beforeEach(() => {
		jest.clearAllMocks();
		(bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
		workspaceRepository.findByTaxId.mockResolvedValue(null);
		workspaceRepository.findBySlug.mockResolvedValue(null);
		workspaceRepository.create.mockResolvedValue({
			id: 'workspace-1',
			name: dto.name,
			status: 'pending',
		});
		workspaceRepository.findById.mockResolvedValue({
			id: 'workspace-1',
			name: dto.name,
			status: 'active',
		});
		workspaceRepository.update.mockResolvedValue({
			id: 'workspace-1',
			status: 'suspended',
		});
		userRepository.findByEmailForAuth.mockResolvedValue(null);
		userRepository.create.mockResolvedValue({ id: 'admin-1' });
		auditLoggerService.log.mockResolvedValue(undefined);
		auditLoggerService.logInTx.mockResolvedValue(undefined);
		sessionRegistryService.revokeAllWorkspaceSessions.mockResolvedValue(
			undefined,
		);

		service = new WorkspaceService(
			sessionRegistryService as never,
			auditLoggerService as never,
			workspaceRepository as never,
			userRepository as never,
			databaseService as never,
		);
	});

	it('TC-IAM-03 Identity Uniqueness', async () => {
		workspaceRepository.findByTaxId.mockResolvedValueOnce({ id: 'existing' });

		await expect(service.register(dto, '127.0.0.1')).rejects.toThrow(
			ConflictException,
		);

		workspaceRepository.findByTaxId.mockResolvedValueOnce(null);
		userRepository.findByEmailForAuth.mockResolvedValueOnce({ id: 'user-1' });

		await expect(service.register(dto, '127.0.0.1')).rejects.toThrow(
			ConflictException,
		);
	});

	it('TC-IAM-05 Workspace Suspension', async () => {
		await service.suspend('workspace-1', 'platform-admin-1', '127.0.0.1');

		expect(workspaceRepository.update).toHaveBeenCalledWith(
			'workspace-1',
			expect.objectContaining({ status: 'suspended' }),
		);
		expect(
			sessionRegistryService.revokeAllWorkspaceSessions,
		).toHaveBeenCalledWith('workspace-1');
	});
});
