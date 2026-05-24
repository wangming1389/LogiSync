import { Injectable, Logger } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { getDatabase, schema } from '../../../../infrastructure/database';
import { ROLE_PERMISSIONS } from '../constants/role-permissions.const';

@Injectable()
export class PermissionService {
	private readonly logger = new Logger(PermissionService.name);

	async hasPermission(
		userId: string,
		workspaceId: string,
		action: string,
		activeRole: string,
	): Promise<boolean> {
		const db = getDatabase();
		const [user] = await db
			.select()
			.from(schema.users)
			.where(
				and(
					eq(schema.users.id, userId),
					eq(schema.users.workspaceId, workspaceId),
				),
			);

		if (!user) {
			this.logger.warn(
				`Permission denied: user not found (userId=${userId}, workspaceId=${workspaceId}, action=${action})`,
			);
			return false;
		}

		if (!user.isActive) {
			this.logger.warn(
				`Permission denied: inactive user (userId=${userId}, workspaceId=${workspaceId}, role=${activeRole}, action=${action})`,
			);
			return false;
		}

		const [role] = await db
			.select({ role: schema.userRoles.role })
			.from(schema.userRoles)
			.where(
				and(
					eq(schema.userRoles.userId, userId),
					eq(schema.userRoles.role, activeRole),
				),
			);
		if (!role) {
			this.logger.warn(
				`Permission denied: role ${activeRole} is not assigned to user ${userId}`,
			);
			return false;
		}

		const permissions: string[] =
			ROLE_PERMISSIONS[activeRole as keyof typeof ROLE_PERMISSIONS] ?? [];
		const allowed = permissions.includes('*') || permissions.includes(action);

		if (!allowed) {
			this.logger.warn(
				`Permission denied: action=${action}, userId=${userId}, workspaceId=${workspaceId}, role=${activeRole}, permissions=[${permissions.join(', ')}]`,
			);
		}

		return allowed;
	}
}
