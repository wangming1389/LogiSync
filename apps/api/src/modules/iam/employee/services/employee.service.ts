/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */
import {
	BadRequestException,
	ConflictException,
	Inject,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import crypto from 'crypto';
import {
	AuditAction,
	AuditStatus,
} from '../../../../core/audit/enums/audit.enums';
import { AuditLoggerService } from '../../../../core/audit/services/audit-logger.service';
import { DatabaseService } from '../../../../infrastructure/database/database.service';
import { MessageQueueService } from '../../../../infrastructure/message-queue/message-queue.service';
import {
	type IMulterFile,
	MediaService,
} from '../../../media/services/media.service';
import {
	ACCOUNT_CREATED_DLQ,
	ACCOUNT_CREATED_QUEUE,
} from '../../../notification/consumers/account-created.consumer';
import { type JwtPayload } from '../../auth/dtos/auth.dto';
import { UserRepository } from '../../auth/repositories/user.repository';
import { AuthService } from '../../auth/services/auth.service';
import { WorkspaceRepository } from '../../workspace/repositories/workspace.repository';
import {
	EMPLOYEE_CREATABLE_ROLES_BY_WORKSPACE_TYPE,
	type EmployeeCreatableWorkspaceType,
} from '../constants/employee.constants';
import { AddEmployeeDto } from '../dtos/employee.dto';

const TEMP_PASSWORD_ALPHABET_UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const TEMP_PASSWORD_ALPHABET_LOWER = 'abcdefghijkmnpqrstuvwxyz';
const TEMP_PASSWORD_ALPHABET_DIGIT = '23456789';
const TEMP_PASSWORD_ALPHABET_SPECIAL = '!@#$%^&*';
const TEMP_PASSWORD_LENGTH = 14;

/**
 * EmployeeService — HR-driven employee provisioning.
 *
 * Creates a workspace-scoped user account with a temporary password
 * and `must_change_password = true`. Publishes the temp password
 * exactly once via the `account.created` queue so the consumer can
 * deliver it via email (with DLQ for irrecoverable failures).
 */
@Injectable()
export class EmployeeService {
	private readonly logger = new Logger(EmployeeService.name);

	constructor(
		private readonly userRepository: UserRepository,
		private readonly workspaceRepository: WorkspaceRepository,
		private readonly databaseService: DatabaseService,
		private readonly auditLoggerService: AuditLoggerService,
		private readonly messageQueueService: MessageQueueService,
		private readonly mediaService: MediaService,
		@Inject(AuthService) private readonly authService: AuthService,
	) {}

	async addEmployee(
		dto: AddEmployeeDto,
		avatar: IMulterFile | undefined,
		actor: JwtPayload,
		ipAddress: string,
		userAgent?: string,
	) {
		if (!avatar) {
			throw new BadRequestException('Avatar is required');
		}

		const workspace = await this.workspaceRepository.findById(
			actor.workspaceId,
		);
		if (!workspace) {
			throw new NotFoundException('Actor workspace does not exist');
		}
		this.assertRoleAllowedForWorkspaceType(dto.role, workspace.type);

		const existing = await this.userRepository.findByEmailInWorkspace(
			dto.email,
			actor.workspaceId,
		);
		if (existing) {
			await this.auditLoggerService.log({
				actorId: actor.sub,
				workspaceId: actor.workspaceId,
				action: AuditAction.EMPLOYEE_CREATE_FAILED,
				resourceType: 'user',
				changes: { email: dto.email, role: dto.role },
				ipAddress,
				userAgent,
				status: AuditStatus.FAILURE,
				errorMessage: 'Email already in use',
			});
			throw new ConflictException('Employee email already in use');
		}

		const globallyExisting = await this.userRepository.findByEmailForAuth(
			dto.email,
		);
		if (globallyExisting) {
			await this.auditLoggerService.log({
				actorId: actor.sub,
				workspaceId: actor.workspaceId,
				action: AuditAction.EMPLOYEE_CREATE_FAILED,
				resourceType: 'user',
				changes: { email: dto.email, role: dto.role },
				ipAddress,
				userAgent,
				status: AuditStatus.FAILURE,
				errorMessage: 'Email already in use in another workspace',
			});
			throw new ConflictException('Employee email already in use');
		}

		const tempPassword = this.generateTempPassword();
		const passwordHash = await this.authService.hashPassword(tempPassword);
		const { firstName, lastName } = this.resolveNameParts(
			dto.fullName,
			dto.firstName,
			dto.lastName,
		);
		const uploadedAvatar = await this.mediaService.uploadFile(
			avatar,
			'employees/avatars',
		);

		const newUser = await this.databaseService.withTransaction(async (tx) => {
			const created = await this.userRepository.create(
				{
					workspaceId: actor.workspaceId,
					email: dto.email,
					passwordHash,
					fullName: dto.fullName,
					firstName,
					lastName,
					phoneNumber: dto.phoneNumber,
					idCard: dto.idCard,
					avatarUrl: uploadedAvatar.url,
					role: dto.role,
					department: dto.department,
					dateOfBirth: dto.dateOfBirth.toISOString().slice(0, 10),
					vehicleTypePreference:
						dto.department === 'driver'
							? (dto.vehicleTypePreference ?? null)
							: null,
					isActive: true,
					mustChangePassword: true,
				},
				tx,
			);

			await this.auditLoggerService.logInTx(tx, {
				actorId: actor.sub,
				workspaceId: actor.workspaceId,
				action: AuditAction.EMPLOYEE_CREATE_SUCCESS,
				resourceType: 'user',
				resourceId: created.id,
				changes: {
					fullName: dto.fullName,
					email: dto.email,
					role: dto.role,
					phoneNumber: dto.phoneNumber,
					idCard: dto.idCard,
					avatarUrl: uploadedAvatar.url,
					department: dto.department,
					dateOfBirth: dto.dateOfBirth.toISOString().slice(0, 10),
					vehicleTypePreference:
						dto.department === 'driver'
							? (dto.vehicleTypePreference ?? null)
							: null,
				},
				ipAddress,
				userAgent,
				status: AuditStatus.SUCCESS,
			});

			return created;
		});

		try {
			await this.messageQueueService.publishWithDLQ(
				ACCOUNT_CREATED_QUEUE,
				{
					userId: newUser.id,
					email: newUser.email,
					firstName: newUser.firstName,
					lastName: newUser.lastName,
					tempPassword,
					workspaceName: workspace.name,
				},
				ACCOUNT_CREATED_DLQ,
			);
		} catch (error) {
			this.logger.error(
				`Failed to publish account.created for user ${newUser.id}`,
				error instanceof Error ? error.stack : String(error),
			);
		}

		this.logger.log(
			`Employee ${newUser.email} created in workspace ${workspace.name} (${workspace.id})`,
		);

		return {
			id: newUser.id,
			fullName: newUser.fullName,
			email: newUser.email,
			firstName: newUser.firstName,
			lastName: newUser.lastName,
			phoneNumber: newUser.phoneNumber,
			idCard: newUser.idCard,
			avatarUrl: newUser.avatarUrl,
			role: newUser.role,
			department: newUser.department,
			dateOfBirth: newUser.dateOfBirth,
			vehicleTypePreference: newUser.vehicleTypePreference,
			workspaceId: newUser.workspaceId,
			mustChangePassword: true,
		};
	}

	private resolveNameParts(
		fullName: string,
		firstName?: string,
		lastName?: string,
	): { firstName: string; lastName: string } {
		if (firstName && lastName) {
			return { firstName, lastName };
		}

		const parts = fullName.trim().split(/\s+/);
		if (parts.length === 1) {
			return { firstName: parts[0], lastName: '' };
		}

		return {
			firstName: firstName ?? parts.slice(0, -1).join(' '),
			lastName: lastName ?? parts.at(-1) ?? '',
		};
	}

	private assertRoleAllowedForWorkspaceType(
		role: string,
		workspaceType: string,
	): void {
		if (!this.isEmployeeCreatableWorkspaceType(workspaceType)) {
			throw new BadRequestException(
				`Workspace type "${workspaceType}" cannot create employees`,
			);
		}

		const allowedRoles =
			EMPLOYEE_CREATABLE_ROLES_BY_WORKSPACE_TYPE[workspaceType];
		if (!this.includes(allowedRoles, role)) {
			throw new BadRequestException(
				`Role "${role}" cannot be created in a "${workspaceType}" workspace. Allowed roles: ${allowedRoles.join(', ')}`,
			);
		}
	}

	private isEmployeeCreatableWorkspaceType(
		workspaceType: string,
	): workspaceType is EmployeeCreatableWorkspaceType {
		return Object.hasOwn(
			EMPLOYEE_CREATABLE_ROLES_BY_WORKSPACE_TYPE,
			workspaceType,
		);
	}

	private includes(values: readonly string[], value: string): boolean {
		return values.includes(value);
	}

	private generateTempPassword(): string {
		const required = [
			this.pickRandom(TEMP_PASSWORD_ALPHABET_UPPER),
			this.pickRandom(TEMP_PASSWORD_ALPHABET_LOWER),
			this.pickRandom(TEMP_PASSWORD_ALPHABET_DIGIT),
			this.pickRandom(TEMP_PASSWORD_ALPHABET_SPECIAL),
		];

		const pool =
			TEMP_PASSWORD_ALPHABET_UPPER +
			TEMP_PASSWORD_ALPHABET_LOWER +
			TEMP_PASSWORD_ALPHABET_DIGIT +
			TEMP_PASSWORD_ALPHABET_SPECIAL;

		const filler = Array.from(
			{ length: TEMP_PASSWORD_LENGTH - required.length },
			() => this.pickRandom(pool),
		);

		return this.shuffleString([...required, ...filler].join(''));
	}

	private pickRandom(alphabet: string): string {
		const index = crypto.randomInt(0, alphabet.length);
		return alphabet[index];
	}

	private shuffleString(value: string): string {
		const chars = value.split('');
		for (let i = chars.length - 1; i > 0; i -= 1) {
			const j = crypto.randomInt(0, i + 1);
			[chars[i], chars[j]] = [chars[j], chars[i]];
		}
		return chars.join('');
	}
}
