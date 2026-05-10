/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionService } from '../auth/services/permission.service';

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

		if (!requiredPermissions || requiredPermissions.length === 0) {
			return true; // No permissions required
		}

		const request = context.switchToHttp().getRequest();
		const user = (request as { user?: { sub: string; workspaceId: string } })
			.user;

		if (!user) {
			throw new ForbiddenException('User not authenticated');
		}

		for (const permission of requiredPermissions) {
			const hasPermission = await this.permissionService.hasPermission(
				user.sub,
				user.workspaceId,
				permission,
			);

			if (!hasPermission) {
				throw new ForbiddenException(`Permission denied: ${permission}`);
			}
		}

		return true;
	}
}
