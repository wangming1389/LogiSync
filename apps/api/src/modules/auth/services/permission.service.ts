import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { getDatabase, schema } from '../../../database';
import { ROLE_PERMISSIONS } from '../constants/role-permissions.const';

@Injectable()
export class PermissionService {
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

		if (!user || !user.isActive) return false;

		const permissions = ROLE_PERMISSIONS[user.role] ?? [];
		return permissions.includes('*') || permissions.includes(action);
	}
}
