/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call */
import {
	ConflictException,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import {
	AuditAction,
	AuditStatus,
} from '../../../core/audit/enums/audit.enums';
import { AuditLoggerService } from '../../../core/audit/services/audit-logger.service';
import { SessionRegistryService } from '../../../core/session/session-registry.service';
import { getDatabase } from '../../../infrastructure/database';
import { UserRepository } from '../auth/user.repository';
import type {
	EnableRoleDto,
	RegisterWorkspaceDto,
	RejectWorkspaceDto,
	RevokeWorkspaceDto,
	UpdateWorkspaceDto,
	WorkspaceFilterDto,
} from './workspace.dto';
import { WorkspaceRepository } from './workspace.repository';

@Injectable()
export class WorkspaceService {
	private readonly logger = new Logger(WorkspaceService.name);

	constructor(
		private readonly sessionRegistryService: SessionRegistryService,
		private readonly auditLoggerService: AuditLoggerService,
		private readonly workspaceRepository: WorkspaceRepository,
		private readonly userRepository: UserRepository,
	) {}

	async register(dto: RegisterWorkspaceDto, ipAddress: string) {
		const existingTax = await this.workspaceRepository.findByTaxId(dto.taxId);
		if (existingTax) {
			throw new ConflictException('Tax ID already registered');
		}

		const existingSlug = await this.workspaceRepository.findBySlug(dto.slug);
		if (existingSlug) {
			throw new ConflictException('Slug already in use');
		}

		const existingEmail = await this.userRepository.findByEmailForAuth(
			dto.adminEmail,
		);
		if (existingEmail) {
			throw new ConflictException('Admin email already in use');
		}

		const passwordHash = await bcrypt.hash(dto.adminPassword, 12);

		const result = await getDatabase().transaction(async (tx) => {
			const workspace = await this.workspaceRepository.create(
				{
					name: dto.name,
					slug: dto.slug,
					type: dto.type,
					taxId: dto.taxId,
					status: 'pending',
					registeredIpAddress: ipAddress,
					acceptedTermsVersion: dto.acceptedTermsVersion,
				},
				tx,
			);

			const adminUser = await this.userRepository.create(
				{
					workspaceId: workspace.id,
					email: dto.adminEmail,

					passwordHash,
					firstName: dto.adminFirstName ?? null,
					lastName: dto.adminLastName ?? null,
					role: 'company_admin',
					isActive: true,
				},
				tx,
			);

			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			await this.auditLoggerService.logInTx(tx as any, {
				actorId: adminUser.id,
				workspaceId: workspace.id,
				action: AuditAction.WORKSPACE_REGISTER_SUCCESS,
				resourceType: 'workspace',
				resourceId: workspace.id,
				changes: {
					name: dto.name,
					slug: dto.slug,
					type: dto.type,
					taxId: dto.taxId,
				},
				ipAddress,
				status: AuditStatus.SUCCESS,
			});

			return workspace;
		});

		this.logger.log(
			`Workspace registered: ${result.name} (${result.id}) - status: pending`,
		);
		return result;
	}

	async findAll(filter: WorkspaceFilterDto) {
		return this.workspaceRepository.findAll({
			status: filter.status,
			page: filter.page,
			limit: filter.limit,
		});
	}

	async findById(id: string) {
		const workspace = await this.workspaceRepository.findById(id);
		if (!workspace) {
			throw new NotFoundException('Workspace does not exist');
		}
		return workspace;
	}

	async update(
		id: string,
		dto: UpdateWorkspaceDto,
		actorId: string,
		ipAddress: string,
	) {
		await this.findById(id);

		const updated = await this.workspaceRepository.update(id, {
			...(dto.name && { name: dto.name }),
		});

		await this.auditLoggerService.log({
			actorId,
			workspaceId: id,
			action: AuditAction.WORKSPACE_UPDATE_SUCCESS,
			resourceType: 'workspace',
			resourceId: id,
			changes: dto.name ? { name: dto.name } : {},
			ipAddress,
			status: AuditStatus.SUCCESS,
		});

		return updated;
	}

	async approve(id: string, actorId: string, ipAddress: string) {
		const workspace = await this.findById(id);

		if (workspace.status !== 'pending') {
			throw new ConflictException(
				`Can only approve workspace in "pending" status (current: "${workspace.status}")`,
			);
		}

		const updated = await this.workspaceRepository.update(id, {
			status: 'active',
		});

		await this.auditLoggerService.log({
			actorId,
			workspaceId: id,
			action: AuditAction.WORKSPACE_APPROVE_SUCCESS,
			resourceType: 'workspace',
			resourceId: id,
			ipAddress,
			status: AuditStatus.SUCCESS,
		});

		this.logger.log(`Workspace approved: ${workspace.name} (${id})`);
		return updated;
	}

	async reject(
		id: string,
		dto: RejectWorkspaceDto,
		actorId: string,
		ipAddress: string,
	) {
		const workspace = await this.findById(id);

		if (workspace.status !== 'pending') {
			throw new ConflictException(
				`Can only reject workspace in "pending" status (current: "${workspace.status}")`,
			);
		}

		const updated = await this.workspaceRepository.update(id, {
			status: 'rejected',
			rejectionReason: dto.rejectionReason,
		});

		await this.auditLoggerService.log({
			actorId,
			workspaceId: id,
			action: AuditAction.WORKSPACE_REJECT_SUCCESS,
			resourceType: 'workspace',
			resourceId: id,
			changes: { rejectionReason: dto.rejectionReason },
			ipAddress,
			status: AuditStatus.SUCCESS,
		});

		this.logger.log(
			`Workspace rejected: ${workspace.name} (${id}) - reason: ${dto.rejectionReason}`,
		);
		return updated;
	}

	async suspend(id: string, actorId: string, ipAddress: string) {
		const workspace = await this.findById(id);

		if (workspace.status === 'suspended') {
			throw new ConflictException('Workspace is already suspended');
		}

		const updated = await this.workspaceRepository.update(id, {
			status: 'suspended',
			suspendedAt: new Date(),
		});

		// Force logout all sessions (Redis) - 10-30s
		await this.sessionRegistryService.revokeAllWorkspaceSessions(id);

		await this.auditLoggerService.log({
			actorId,
			workspaceId: id,
			action: AuditAction.WORKSPACE_SUSPEND_SUCCESS,
			resourceType: 'workspace',
			resourceId: id,
			ipAddress,
			status: AuditStatus.SUCCESS,
		});

		this.logger.log(
			`Workspace suspended: ${workspace.name} (${id}) - all sessions revoked`,
		);
		return updated;
	}

	async revoke(
		id: string,
		dto: RevokeWorkspaceDto,
		actorId: string,
		ipAddress: string,
	) {
		const workspace = await this.findById(id);

		if (workspace.name !== dto.companyNameConfirmation) {
			throw new ConflictException(
				'Company name confirmation does not match workspace name',
			);
		}

		if (workspace.status === 'revoked') {
			throw new ConflictException('Workspace is already revoked');
		}

		const updated = await this.workspaceRepository.update(id, {
			status: 'revoked',
			revokedAt: new Date(),
			isActive: false,
		});

		await this.sessionRegistryService.revokeAllWorkspaceSessions(id);

		await this.auditLoggerService.log({
			actorId,
			workspaceId: id,
			action: AuditAction.UNKNOWN_MUTATION_SUCCESS,
			resourceType: 'workspace',
			resourceId: id,
			changes: { status: 'revoked', isActive: false },
			ipAddress,
			status: AuditStatus.SUCCESS,
		});

		this.logger.log(`Workspace revoked: ${workspace.name} (${id})`);
		return updated;
	}

	async enableRole(
		workspaceId: string,
		dto: EnableRoleDto,
		actorId: string,
		ipAddress: string,
	) {
		await this.findById(workspaceId);

		const result = await this.workspaceRepository.enableRole(
			workspaceId,
			dto.role,
			actorId,
		);

		if (result.existing) {
			throw new ConflictException(
				`Role "${dto.role}" is already enabled for this workspace`,
			);
		}

		await this.auditLoggerService.log({
			actorId,
			workspaceId,
			action: AuditAction.WORKSPACE_ENABLE_ROLE_SUCCESS,
			resourceType: 'workspace_enabled_roles',
			resourceId: result.role.id,
			changes: { role: dto.role },
			ipAddress,
			status: AuditStatus.SUCCESS,
		});

		this.logger.log(`Role "${dto.role}" enabled for workspace ${workspaceId}`);
		return result.role;
	}
}
