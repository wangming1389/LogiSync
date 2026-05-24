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
				`Permission denied: inactive user (userId=${userId}, workspaceId=${workspaceId}, role=${user.role}, action=${action})`,
			);
			return false;
		}

		const permissions: string[] =
			ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS] ?? [];
		const allowed = permissions.includes('*') || permissions.includes(action);

		if (!allowed) {
			this.logger.warn(
				`Permission denied: action=${action}, userId=${userId}, workspaceId=${workspaceId}, role=${user.role}, permissions=[${permissions.join(', ')}]`,
			);
		}

		return allowed;
	}
}
