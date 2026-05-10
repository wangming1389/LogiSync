import {
	ConflictException,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { and, eq, sql } from 'drizzle-orm';
import { getDatabase, schema } from '../../../database';
import { AuditLoggerService } from '../../audit/audit-logger.service';
import { SessionRegistryService } from '../../session/session-registry.service';
import type {
	EnableRoleDto,
	RegisterWorkspaceDto,
	RejectWorkspaceDto,
	UpdateWorkspaceDto,
	WorkspaceFilterDto,
} from './workspace.dto';

/**
 * WorkspaceService — Manage workspaces (multi-tenant)
 *
 * Business logic:
 * - register: validate taxId, check duplicate → insert pending + admin user (atomic)
 * - approve: pending → active
 * - reject: pending → rejected (rejectionReason required)
 * - suspend: → suspended + force logout all sessions (Redis)
 * - enableRole: add role to workspace
 */
@Injectable()
export class WorkspaceService {
	private readonly logger = new Logger(WorkspaceService.name);

	constructor(
		private readonly sessionRegistryService: SessionRegistryService,
		private readonly auditLoggerService: AuditLoggerService,
	) {}

	async register(dto: RegisterWorkspaceDto, ipAddress: string) {
		const db = getDatabase();

		// Check duplicate taxId
		const [existingTax] = await db
			.select({ id: schema.workspaces.id })
			.from(schema.workspaces)
			.where(eq(schema.workspaces.taxId, dto.taxId));

		if (existingTax) {
			throw new ConflictException('Tax ID already registered');
		}

		// Check duplicate slug
		const [existingSlug] = await db
			.select({ id: schema.workspaces.id })
			.from(schema.workspaces)
			.where(eq(schema.workspaces.slug, dto.slug));

		if (existingSlug) {
			throw new ConflictException('Slug already in use');
		}

		// Check duplicate admin email
		const [existingEmail] = await db
			.select({ id: schema.users.id })
			.from(schema.users)
			.where(eq(schema.users.email, dto.adminEmail));

		if (existingEmail) {
			throw new ConflictException('Admin email already in use');
		}

		// Hash admin password
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
		const passwordHash = await bcrypt.hash(dto.adminPassword, 12);

		// Transaction: insert workspace + admin user + audit log
		const result = await db.transaction(async (tx) => {
			// Insert workspace
			const [workspace] = await tx
				.insert(schema.workspaces)
				.values({
					name: dto.name,
					slug: dto.slug,
					type: dto.type,
					taxId: dto.taxId,
					status: 'pending',
					registeredIpAddress: ipAddress,
					acceptedTermsVersion: dto.acceptedTermsVersion,
				})
				.returning();

			// Insert admin user
			const [adminUser] = await tx
				.insert(schema.users)
				.values({
					workspaceId: workspace.id,
					email: dto.adminEmail,
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
					passwordHash,
					firstName: dto.adminFirstName ?? null,
					lastName: dto.adminLastName ?? null,
					role: 'company_admin',
					isActive: true,
				})
				.returning();

			// Audit log in transaction
			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			await this.auditLoggerService.logInTx(tx as any, {
				actorId: adminUser.id,
				workspaceId: workspace.id,
				action: 'WORKSPACE_REGISTER',
				resourceType: 'workspace',
				resourceId: workspace.id,
				changes: {
					name: dto.name,
					slug: dto.slug,
					type: dto.type,
					taxId: dto.taxId,
				},
				ipAddress,
				status: 'success',
			});

			return workspace;
		});

		this.logger.log(
			`Workspace registered: ${result.name} (${result.id}) - status: pending`,
		);

		return result;
	}

	async findAll(filter: WorkspaceFilterDto) {
		const db = getDatabase();

		const conditions: any[] = [];

		if (filter.status) {
			conditions.push(eq(schema.workspaces.status, filter.status));
		}

		const offset = (filter.page - 1) * filter.limit;

		const [items, countResult] = await Promise.all([
			db
				.select()
				.from(schema.workspaces)
				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
				.where(conditions.length > 0 ? and(...conditions) : undefined)
				.limit(filter.limit)
				.offset(offset)
				.orderBy(schema.workspaces.createdAt),
			db
				.select({ count: sql<number>`count(*)` })
				.from(schema.workspaces)
				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
				.where(conditions.length > 0 ? and(...conditions) : undefined),
		]);

		return {
			items,
			total: Number(countResult[0]?.count ?? 0),
			page: filter.page,
			limit: filter.limit,
		};
	}

	async findById(id: string) {
		const db = getDatabase();

		const [workspace] = await db
			.select()
			.from(schema.workspaces)
			.where(eq(schema.workspaces.id, id));

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
		const db = getDatabase();

		await this.findById(id);

		const [updated] = await db
			.update(schema.workspaces)
			.set({
				...(dto.name && { name: dto.name }),
				updatedAt: new Date(),
			})
			.where(eq(schema.workspaces.id, id))
			.returning();

		await this.auditLoggerService.log({
			actorId,
			workspaceId: id,
			action: 'WORKSPACE_UPDATE',
			resourceType: 'workspace',
			resourceId: id,
			changes: dto.name ? { name: dto.name } : {},
			ipAddress,
			status: 'success',
		});

		return updated;
	}

	async approve(id: string, actorId: string, ipAddress: string) {
		const db = getDatabase();

		const workspace = await this.findById(id);

		if (workspace.status !== 'pending') {
			throw new ConflictException(
				`Can only approve workspace in "pending" status (current: "${workspace.status}")`,
			);
		}

		const [updated] = await db
			.update(schema.workspaces)
			.set({
				status: 'active',
				updatedAt: new Date(),
			})
			.where(eq(schema.workspaces.id, id))
			.returning();

		await this.auditLoggerService.log({
			actorId,
			workspaceId: id,
			action: 'WORKSPACE_APPROVE',
			resourceType: 'workspace',
			resourceId: id,
			ipAddress,
			status: 'success',
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
		const db = getDatabase();

		const workspace = await this.findById(id);

		if (workspace.status !== 'pending') {
			throw new ConflictException(
				`Can only reject workspace in "pending" status (current: "${workspace.status}")`,
			);
		}

		const [updated] = await db
			.update(schema.workspaces)
			.set({
				status: 'rejected',
				rejectionReason: dto.rejectionReason,
				updatedAt: new Date(),
			})
			.where(eq(schema.workspaces.id, id))
			.returning();

		await this.auditLoggerService.log({
			actorId,
			workspaceId: id,
			action: 'WORKSPACE_REJECT',
			resourceType: 'workspace',
			resourceId: id,
			changes: { rejectionReason: dto.rejectionReason },
			ipAddress,
			status: 'success',
		});

		this.logger.log(
			`Workspace rejected: ${workspace.name} (${id}) - reason: ${dto.rejectionReason}`,
		);

		return updated;
	}

	async suspend(id: string, actorId: string, ipAddress: string) {
		const db = getDatabase();

		const workspace = await this.findById(id);

		if (workspace.status === 'suspended') {
			throw new ConflictException('Workspace is already suspended');
		}

		// 1. Update status
		const [updated] = await db
			.update(schema.workspaces)
			.set({
				status: 'suspended',
				suspendedAt: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(schema.workspaces.id, id))
			.returning();

		// 2. Force logout all sessions (Redis) - 10-30s per documentation
		await this.sessionRegistryService.revokeAllWorkspaceSessions(id);

		// 3. Audit log
		await this.auditLoggerService.log({
			actorId,
			workspaceId: id,
			action: 'WORKSPACE_SUSPEND',
			resourceType: 'workspace',
			resourceId: id,
			ipAddress,
			status: 'success',
		});

		this.logger.log(
			`Workspace suspended: ${workspace.name} (${id}) - all sessions revoked`,
		);

		return updated;
	}

	async enableRole(
		workspaceId: string,
		dto: EnableRoleDto,
		actorId: string,
		ipAddress: string,
	) {
		const db = getDatabase();

		// Check workspace exists
		await this.findById(workspaceId);

		// Check duplicate role
		const [existing] = await db
			.select()
			.from(schema.workspaceEnabledRoles)
			.where(
				and(
					eq(schema.workspaceEnabledRoles.workspaceId, workspaceId),
					eq(schema.workspaceEnabledRoles.role, dto.role),
				),
			);

		if (existing) {
			throw new ConflictException(
				`Role "${dto.role}" is already enabled for this workspace`,
			);
		}

		const [enabledRole] = await db
			.insert(schema.workspaceEnabledRoles)
			.values({
				workspaceId,
				role: dto.role,
				enabledBy: actorId,
			})
			.returning();

		await this.auditLoggerService.log({
			actorId,
			workspaceId,
			action: 'WORKSPACE_ENABLE_ROLE',
			resourceType: 'workspace_enabled_roles',
			resourceId: enabledRole.id,
			changes: { role: dto.role },
			ipAddress,
			status: 'success',
		});

		this.logger.log(`Role "${dto.role}" enabled for workspace ${workspaceId}`);

		return enabledRole;
	}
}
