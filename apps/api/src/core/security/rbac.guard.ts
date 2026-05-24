/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import { PermissionService } from '../../modules/iam/auth/services/permission.service';

export const Permissions = Reflector.createDecorator<string[]>();

@Injectable()
export class RbacGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private permissionService: PermissionService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const requiredPermissions = this.reflector.get(
			Permissions,
			context.getHandler(),
		);
		const requiredRoles = this.reflector.get<string[]>(
			ROLES_KEY,
			context.getHandler(),
		);

		if (
			(!requiredPermissions || requiredPermissions.length === 0) &&
			(!requiredRoles || requiredRoles.length === 0)
		) {
			return true; // No permissions/roles required
		}

		const request = context.switchToHttp().getRequest();
		const user = (
			request as { user?: { sub: string; workspaceId: string; role: string } }
		).user;

		if (!user) {
			throw new ForbiddenException('User not authenticated');
		}

		// Role check
		if (requiredRoles && requiredRoles.length > 0) {
			if (!requiredRoles.includes(user.role)) {
				throw new ForbiddenException(
					`Role denied: required [${requiredRoles.join(', ')}]`,
				);
			}
		}

		// Permission check
		if (requiredPermissions && requiredPermissions.length > 0) {
			for (const permission of requiredPermissions) {
				const hasPermission = await this.permissionService.hasPermission(
					user.sub,
					user.workspaceId,
					permission,
					user.role,
				);

				if (!hasPermission) {
					throw new ForbiddenException(
						`Permission denied: ${permission} (role: ${user.role})`,
					);
				}
			}
		}

		return true;
	}
}
